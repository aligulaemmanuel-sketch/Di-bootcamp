import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { hash } from "bcryptjs";
import {
  createHash,
  createHmac,
  createPublicKey,
  createSign,
  randomBytes,
  timingSafeEqual,
  verify as verifySignature,
  type JsonWebKey,
} from "node:crypto";
import { PrismaService } from "./prisma.service";
import { getApiPublicUrl, getAppUrl as getConfiguredAppUrl } from "./config";

export const oauthProviders = ["google", "apple", "microsoft", "facebook", "github"] as const;
export type OAuthProvider = (typeof oauthProviders)[number];

type OAuthIdentity = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
};

type OAuthState = {
  state: string;
  nonce: string;
  verifier: string;
  issuedAt: number;
};

type TokenResponse = {
  access_token?: string;
  id_token?: string;
};

const providerLabels: Record<OAuthProvider, string> = {
  google: "Google",
  apple: "Apple",
  microsoft: "Microsoft",
  facebook: "Facebook",
  github: "GitHub",
};

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwt: JwtService,
  ) {}

  getProvider(value: string): OAuthProvider {
    if ((oauthProviders as readonly string[]).includes(value)) return value as OAuthProvider;
    throw new NotFoundException("This sign-in provider is not supported.");
  }

  private microsoftTenant() {
    const tenant = process.env.MICROSOFT_TENANT_ID || "common";
    if (!["common", "organizations", "consumers"].includes(tenant) && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(tenant)) {
      throw new ServiceUnavailableException("MICROSOFT_TENANT_ID must be a tenant ID or a supported Microsoft tenant alias.");
    }
    return tenant;
  }

  async begin(provider: OAuthProvider) {
    const config = this.getConfig(provider);
    const state = this.createState();
    const callbackUrl = this.getCallbackUrl(provider);
    const authorizationUrl = new URL(this.getAuthorizationEndpoint(provider));
    authorizationUrl.searchParams.set("client_id", config.clientId);
    authorizationUrl.searchParams.set("redirect_uri", callbackUrl);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("scope", this.getScopes(provider));
    authorizationUrl.searchParams.set("state", state.state);
    if (provider !== "facebook") {
      authorizationUrl.searchParams.set("code_challenge", createHash("sha256").update(state.verifier).digest("base64url"));
      authorizationUrl.searchParams.set("code_challenge_method", "S256");
    }
    if (provider === "google" || provider === "apple" || provider === "microsoft") {
      authorizationUrl.searchParams.set("nonce", state.nonce);
    }
    if (provider === "microsoft") authorizationUrl.searchParams.set("response_mode", "query");

    return {
      authorizationUrl: authorizationUrl.toString(),
      stateCookie: this.signState(state),
      callbackPath: `/api/auth/oauth/${provider}/callback`,
      secure: new URL(callbackUrl).protocol === "https:",
    };
  }

  async complete(provider: OAuthProvider, input: {
    code: string;
    state: string;
    stateCookie: string | undefined;
  }) {
    const state = this.readState(input.stateCookie, input.state);
    const config = this.getConfig(provider);
    const tokenResponse = await this.exchangeCode(provider, input.code, state.verifier, config.clientId);
    const identity = await this.getIdentity(provider, tokenResponse, state.nonce, config.clientId);
    if (!identity.emailVerified) {
      throw new UnauthorizedException(`${providerLabels[provider]} did not confirm that this email address is verified.`);
    }

    const user = await this.resolveAccount(provider, identity);
    return {
      token: await this.jwt.signAsync({ sub: user.id, email: user.email, ver: user.tokenVersion }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePhotoData: user.profilePhotoData,
      },
    };
  }

  getAppUrl() {
    return new URL(getConfiguredAppUrl());
  }

  private getConfig(provider: OAuthProvider) {
    const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`];
    const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`];
    if (!clientId || (provider !== "apple" && !clientSecret)) {
      throw new ServiceUnavailableException(`${providerLabels[provider]} sign-in is not configured on this server.`);
    }
    if (provider === "apple" && (!process.env.APPLE_TEAM_ID || !process.env.APPLE_KEY_ID || !process.env.APPLE_PRIVATE_KEY)) {
      throw new ServiceUnavailableException("Apple sign-in is not configured on this server.");
    }
    return { clientId, clientSecret };
  }

  private getCallbackUrl(provider: OAuthProvider) {
    const url = new URL(`/api/auth/oauth/${provider}/callback`, getApiPublicUrl());
    return url.toString();
  }

  private getAuthorizationEndpoint(provider: OAuthProvider) {
    switch (provider) {
      case "google": return "https://accounts.google.com/o/oauth2/v2/auth";
      case "apple": return "https://appleid.apple.com/auth/authorize";
      case "microsoft": return `https://login.microsoftonline.com/${this.microsoftTenant()}/oauth2/v2.0/authorize`;
      case "facebook": return "https://www.facebook.com/v22.0/dialog/oauth";
      case "github": return "https://github.com/login/oauth/authorize";
    }
  }

  private getScopes(provider: OAuthProvider) {
    switch (provider) {
      case "google": return "openid email profile";
      case "apple": return "openid email";
      case "microsoft": return "openid email profile";
      case "facebook": return "email public_profile";
      case "github": return "read:user user:email";
    }
  }

  private createState(): OAuthState {
    return {
      state: randomBytes(32).toString("base64url"),
      nonce: randomBytes(32).toString("base64url"),
      verifier: randomBytes(32).toString("base64url"),
      issuedAt: Date.now(),
    };
  }

  private signState(state: OAuthState) {
    const payload = `${state.state}.${state.nonce}.${state.verifier}.${state.issuedAt}`;
    const signature = createHmac("sha256", process.env.JWT_SECRET ?? "").update(payload).digest("base64url");
    return `${payload}.${signature}`;
  }

  private readState(cookie: string | undefined, expectedState: string): OAuthState {
    if (!cookie) throw new UnauthorizedException("The sign-in request expired. Please try again.");
    const [state, nonce, verifier, issuedAtValue, signature, ...extra] = cookie.split(".");
    const issuedAt = Number(issuedAtValue);
    const payload = `${state}.${nonce}.${verifier}.${issuedAtValue}`;
    const expectedSignature = createHmac("sha256", process.env.JWT_SECRET ?? "").update(payload).digest();
    let actualSignature: Buffer;
    try {
      actualSignature = Buffer.from(signature ?? "", "base64url");
    } catch {
      throw new UnauthorizedException("The sign-in request could not be verified. Please try again.");
    }
    if (
      extra.length ||
      !state ||
      !nonce ||
      !verifier ||
      !Number.isSafeInteger(issuedAt) ||
      issuedAt > Date.now() ||
      Date.now() - issuedAt > 10 * 60 * 1000 ||
      Buffer.byteLength(state) !== Buffer.byteLength(expectedState) ||
      actualSignature.length !== expectedSignature.length ||
      !timingSafeEqual(actualSignature, expectedSignature) ||
      !timingSafeEqual(Buffer.from(state), Buffer.from(expectedState))
    ) {
      throw new UnauthorizedException("The sign-in request could not be verified. Please try again.");
    }
    return { state, nonce, verifier, issuedAt };
  }

  private async exchangeCode(provider: OAuthProvider, code: string, verifier: string, clientId: string): Promise<TokenResponse> {
    const config = this.getConfig(provider);
    const callbackUrl = this.getCallbackUrl(provider);
    const form = new URLSearchParams({
      client_id: clientId,
      client_secret: provider === "apple" ? await this.appleClientSecret(clientId) : config.clientSecret!,
      code,
      grant_type: "authorization_code",
      redirect_uri: callbackUrl,
    });
    if (provider !== "facebook") form.set("code_verifier", verifier);
    const response = await fetch(this.getTokenEndpoint(provider), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: form,
    });
    const result = await this.readJson(response);
    if (!response.ok || typeof result.access_token !== "string" && typeof result.id_token !== "string") {
      throw new UnauthorizedException(`${providerLabels[provider]} could not complete sign-in. Please try again.`);
    }
    return result;
  }

  private getTokenEndpoint(provider: OAuthProvider) {
    switch (provider) {
      case "google": return "https://oauth2.googleapis.com/token";
      case "apple": return "https://appleid.apple.com/auth/token";
      case "microsoft": return `https://login.microsoftonline.com/${this.microsoftTenant()}/oauth2/v2.0/token`;
      case "facebook": return "https://graph.facebook.com/v22.0/oauth/access_token";
      case "github": return "https://github.com/login/oauth/access_token";
    }
  }

  private async appleClientSecret(clientId: string) {
    const privateKey = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const teamId = process.env.APPLE_TEAM_ID;
    const keyId = process.env.APPLE_KEY_ID;
    if (!privateKey || !teamId || !keyId) {
      throw new ServiceUnavailableException("Apple sign-in is not configured on this server.");
    }
    const issuedAt = Math.floor(Date.now() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: "ES256", kid: keyId, typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({
      iss: teamId,
      sub: clientId,
      aud: "https://appleid.apple.com",
      iat: issuedAt,
      exp: issuedAt + 5 * 60,
    })).toString("base64url");
    const signingInput = `${header}.${payload}`;
    const signer = createSign("SHA256");
    signer.update(signingInput);
    signer.end();
    const signature = signer.sign({ key: privateKey, dsaEncoding: "ieee-p1363" }).toString("base64url");
    return `${signingInput}.${signature}`;
  }

  private async getIdentity(provider: OAuthProvider, tokens: TokenResponse, nonce: string, clientId: string): Promise<OAuthIdentity> {
    if (provider === "github") return this.getGitHubIdentity(tokens.access_token);
    if (provider === "facebook") return this.getFacebookIdentity(tokens.access_token);
    if (!tokens.id_token) throw new UnauthorizedException(`${providerLabels[provider]} did not return a valid identity.`);

    const idToken = tokens.id_token;
    const { claims: payload } = this.decodeIdToken(idToken);
    const issuer = provider === "google"
      ? ["https://accounts.google.com", "accounts.google.com"]
      : provider === "apple"
        ? "https://appleid.apple.com"
        : this.microsoftIssuer(payload.tid);
    const claims = await this.verifyIdToken(idToken, provider, clientId, nonce, issuer);
    const email = typeof claims.email === "string" ? claims.email : "";
    const name = typeof claims.name === "string" ? claims.name : "";
    return {
      id: typeof claims.sub === "string" ? claims.sub : "",
      email,
      name,
      emailVerified: claims.email_verified === true || claims.email_verified === "true",
    };
  }

  private microsoftIssuer(tenant: unknown) {
    if (typeof tenant !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(tenant)) {
      throw new UnauthorizedException("Microsoft returned an invalid sign-in identity.");
    }
    const configuredTenant = process.env.MICROSOFT_TENANT_ID;
    if (configuredTenant && configuredTenant !== "common" && configuredTenant !== "organizations" && configuredTenant !== "consumers" && configuredTenant.toLowerCase() !== tenant.toLowerCase()) {
      throw new UnauthorizedException("This Microsoft account is not allowed to sign in.");
    }
    return `https://login.microsoftonline.com/${tenant}/v2.0`;
  }

  private getJwksUrl(provider: "google" | "apple" | "microsoft") {
    switch (provider) {
      case "google": return "https://www.googleapis.com/oauth2/v3/certs";
      case "apple": return "https://appleid.apple.com/auth/keys";
      case "microsoft": return "https://login.microsoftonline.com/common/discovery/v2.0/keys";
    }
  }

  private decodeIdToken(token: string) {
    const parts = token.split(".");
    if (parts.length !== 3 || parts.some((part) => !part)) {
      throw new UnauthorizedException("The sign-in provider returned an invalid identity token.");
    }
    try {
      const header: unknown = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
      const claims: unknown = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
      if (
        typeof header !== "object" ||
        header === null ||
        typeof claims !== "object" ||
        claims === null
      ) {
        throw new Error("Invalid token shape.");
      }
      return {
        header: header as Record<string, unknown>,
        claims: claims as Record<string, unknown>,
        signingInput: `${parts[0]}.${parts[1]}`,
        signature: Buffer.from(parts[2], "base64url"),
      };
    } catch {
      throw new UnauthorizedException("The sign-in provider returned an invalid identity token.");
    }
  }

  private async verifyIdToken(
    token: string,
    provider: "google" | "apple" | "microsoft",
    clientId: string,
    nonce: string,
    issuer: string | string[],
  ) {
    const decoded = this.decodeIdToken(token);
    const { header, claims } = decoded;
    if (header.alg !== "RS256" || typeof header.kid !== "string") {
      throw new UnauthorizedException("The sign-in provider returned an unsupported identity token.");
    }
    const jwksResponse = await fetch(this.getJwksUrl(provider));
    const jwks = await this.readJson(jwksResponse);
    const keys = jwks.keys;
    if (!jwksResponse.ok || !Array.isArray(keys)) {
      throw new ServiceUnavailableException("The sign-in provider's identity keys could not be loaded.");
    }
    const matchingKey = keys.find((candidate): candidate is Record<string, unknown> =>
      typeof candidate === "object" &&
      candidate !== null &&
      "kid" in candidate &&
      candidate.kid === header.kid &&
      "kty" in candidate &&
      candidate.kty === "RSA" &&
      "n" in candidate &&
      typeof candidate.n === "string" &&
      "e" in candidate &&
      typeof candidate.e === "string",
    );
    if (!matchingKey) throw new UnauthorizedException("The sign-in provider's identity key was not recognized.");

    const jwk: JsonWebKey = {
      kty: "RSA",
      n: matchingKey.n as string,
      e: matchingKey.e as string,
    };
    const publicKey = createPublicKey({ key: jwk, format: "jwk" });
    if (!verifySignature("RSA-SHA256", Buffer.from(decoded.signingInput), publicKey, decoded.signature)) {
      throw new UnauthorizedException("The sign-in provider returned an invalid identity signature.");
    }

    const issuers = Array.isArray(issuer) ? issuer : [issuer];
    const audiences = typeof claims.aud === "string" ? [claims.aud] : Array.isArray(claims.aud) ? claims.aud : [];
    const now = Math.floor(Date.now() / 1000);
    if (
      typeof claims.iss !== "string" ||
      !issuers.includes(claims.iss) ||
      !audiences.includes(clientId) ||
      typeof claims.exp !== "number" ||
      claims.exp < now - 5 ||
      typeof claims.iat !== "number" ||
      claims.iat > now + 5 ||
      claims.nonce !== nonce
    ) {
      throw new UnauthorizedException("The sign-in provider returned an expired or mismatched identity.");
    }
    return claims;
  }

  private async getGitHubIdentity(accessToken: string | undefined): Promise<OAuthIdentity> {
    if (!accessToken) throw new UnauthorizedException("GitHub did not return a valid sign-in token.");
    const headers = { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" };
    const profileResponse = await fetch("https://api.github.com/user", { headers });
    const profile = await this.readJson(profileResponse);
    if (!profileResponse.ok || typeof profile.id !== "number") {
      throw new UnauthorizedException("GitHub could not verify this account.");
    }
    const emailsResponse = await fetch("https://api.github.com/user/emails", { headers });
    const emails = await this.readJson(emailsResponse);
    if (!emailsResponse.ok || !Array.isArray(emails)) {
      throw new UnauthorizedException("GitHub could not verify an email address for this account.");
    }
    const primary = emails.find((item): item is Record<string, unknown> =>
      typeof item === "object" &&
      item !== null &&
      "primary" in item &&
      item.primary === true &&
      "verified" in item &&
      item.verified === true &&
      typeof item.email === "string",
    );
    return {
      id: String(profile.id),
      email: typeof primary?.email === "string" ? primary.email : "",
      name: typeof profile.name === "string" ? profile.name : typeof profile.login === "string" ? profile.login : "",
      emailVerified: Boolean(primary),
    };
  }

  private async getFacebookIdentity(accessToken: string | undefined): Promise<OAuthIdentity> {
    if (!accessToken) throw new UnauthorizedException("Facebook did not return a valid sign-in token.");
    const url = new URL("https://graph.facebook.com/v22.0/me");
    url.searchParams.set("fields", "id,name,email");
    url.searchParams.set("access_token", accessToken);
    const response = await fetch(url);
    const profile = await this.readJson(response);
    if (!response.ok || typeof profile.id !== "string" || typeof profile.email !== "string") {
      throw new UnauthorizedException("Facebook could not verify an email address for this account.");
    }
    return {
      id: profile.id,
      email: profile.email,
      name: typeof profile.name === "string" ? profile.name : "",
      emailVerified: true,
    };
  }

  private async readJson(response: Response): Promise<Record<string, unknown>> {
    let value: unknown;
    try {
      value = await response.json();
    } catch {
      throw new ServiceUnavailableException("The sign-in provider returned an invalid response.");
    }
    if (typeof value !== "object" || value === null) {
      throw new ServiceUnavailableException("The sign-in provider returned an invalid response.");
    }
    return value as Record<string, unknown>;
  }

  private async resolveAccount(provider: OAuthProvider, identity: OAuthIdentity) {
    const email = identity.email.trim().toLowerCase();
    if (!identity.id || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new UnauthorizedException(`${providerLabels[provider]} did not return a valid email address.`);
    }
    const now = new Date();
    const name = identity.name.trim() || email.split("@")[0];
    try {
      return await this.prisma.$transaction(async (tx) => {
        const linked = await tx.oAuthAccount.findUnique({
          where: { provider_providerAccountId: { provider, providerAccountId: identity.id } },
          include: { user: true },
        });
        if (linked) return linked.user;

        let user = await tx.user.findUnique({ where: { email } });
        if (user) {
          if (!user.emailVerifiedAt) {
            user = await tx.user.update({
              where: { id: user.id },
              data: {
                emailVerifiedAt: now,
                emailVerificationTokenHash: null,
                emailVerificationExpiresAt: null,
              },
            });
          }
        } else {
          user = await tx.user.create({
            data: {
              email,
              name,
              passwordHash: await hash(randomBytes(48).toString("base64url"), 12),
              emailVerifiedAt: now,
            },
          });
        }
        await tx.oAuthAccount.create({
          data: { provider, providerAccountId: identity.id, userId: user.id },
        });
        return user;
      });
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
        const linked = await this.prisma.oAuthAccount.findUnique({
          where: { provider_providerAccountId: { provider, providerAccountId: identity.id } },
          include: { user: true },
        });
        if (linked) return linked.user;
        throw new ConflictException("This email is already connected to another account. Sign in with that account first.");
      }
      this.logger.error("Social sign-in account provisioning failed.");
      throw error;
    }
  }
}
