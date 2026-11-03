import { Body, Controller, Get, Inject, Logger, NotFoundException, Param, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { CurrentUser, SessionGuard, SessionUser } from "./auth";
import { AcceptInvitationDto, LoginDto, RegisterDto, RequestEmailVerificationDto, RequestPasswordResetDto, ResetPasswordDto, VerifyEmailDto } from "./auth.dto";
import { PrismaService } from "./prisma.service";
import { hashInvitationToken } from "./invitation-token";
import { OAuthProvider, OAuthService } from "./oauth.service";

const oauthStateCookieName = (provider: OAuthProvider) => `maliwise_oauth_${provider}`;

const cookieOptions = (secure: boolean) => ({
  httpOnly: true,
  secure,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

@Controller("api/auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(OAuthService) private readonly oauth: OAuthService,
  ) {}

  @Post("register")
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  async register(@Body() input: RegisterDto) {
    return this.auth.register(input);
  }

  @Post("login")
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  async login(@Body() input: LoginDto, @Res({ passthrough: true }) response: Response) {
    const { token, user } = await this.auth.login(input);
    response.cookie("maliwise_session", token, cookieOptions(process.env.NODE_ENV === "production"));
    return { user };
  }

  @Get("oauth/:provider")
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async beginOAuth(@Param("provider") value: string, @Res() response: Response) {
    const provider = this.oauth.getProvider(value);
    const { authorizationUrl, stateCookie, callbackPath, secure } = await this.oauth.begin(provider);
    response.cookie(oauthStateCookieName(provider), stateCookie, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: callbackPath,
      maxAge: 10 * 60 * 1000,
    });
    response.redirect(302, authorizationUrl);
  }

  @Get("oauth/:provider/callback")
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async completeOAuth(
    @Param("provider") value: string,
    @Query("code") code: string | undefined,
    @Query("state") state: string | undefined,
    @Query("error") providerError: string | undefined,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const provider = this.oauth.getProvider(value);
    const appUrl = this.oauth.getAppUrl();
    const stateCookie = request.cookies?.[oauthStateCookieName(provider)] as string | undefined;
    response.clearCookie(oauthStateCookieName(provider), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || (process.env.WEB_ORIGIN ?? "").startsWith("https://"),
      sameSite: "lax",
      path: `/api/auth/oauth/${provider}/callback`,
    });
    if (providerError || !code || !state) {
      appUrl.searchParams.set("auth", "login");
      appUrl.searchParams.set("oauth_error", "1");
      response.redirect(302, appUrl.toString());
      return;
    }

    try {
      const { token, user } = await this.oauth.complete(provider, { code, state, stateCookie });
      response.cookie("maliwise_session", token, cookieOptions(process.env.NODE_ENV === "production"));
      appUrl.searchParams.delete("auth");
      appUrl.searchParams.delete("oauth_error");
      response.redirect(302, appUrl.toString());
      return user;
    } catch (error) {
      this.logger.error(`${provider} sign-in failed.`);
      appUrl.searchParams.set("auth", "login");
      appUrl.searchParams.set("oauth_error", "1");
      response.redirect(302, appUrl.toString());
    }
  }

  @Post("password-reset/request")
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  async requestPasswordReset(@Body() input: RequestPasswordResetDto) {
    await this.auth.requestPasswordReset(input);
    return { message: "If an account exists for that email, a password reset link will be sent shortly." };
  }

  @Post("email-verification/request")
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  async requestEmailVerification(@Body() input: RequestEmailVerificationDto) {
    await this.auth.requestEmailVerification(input);
    return { message: "If an account needs email verification, a verification link will be sent shortly." };
  }

  @Post("email-verification/confirm")
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async verifyEmail(@Body() input: VerifyEmailDto) {
    return this.auth.verifyEmail(input);
  }

  @Post("password-reset/confirm")
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async resetPassword(@Body() input: ResetPasswordDto) {
    await this.auth.resetPassword(input);
    return { message: "Password reset successfully. Please sign in with your new password." };
  }

  @Post("accept-invitation")
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  async acceptInvitation(@Body() input: AcceptInvitationDto, @Res({ passthrough: true }) response: Response) {
    const { token, user } = await this.auth.acceptInvitation(input);
    response.cookie("maliwise_session", token, cookieOptions(process.env.NODE_ENV === "production"));
    return { user };
  }

  @Get("invitation/:token")
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async getInvitation(@Param("token") token: string) {
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
      throw new NotFoundException("This invitation is invalid or has expired.");
    }
    const invitation = await this.prisma.memberInvitation.findUnique({
      where: { tokenHash: hashInvitationToken(token) },
      include: { group: { select: { name: true } } },
    });
    if (!invitation || invitation.acceptedAt || invitation.expiresAt <= new Date()) {
      throw new NotFoundException("This invitation is invalid or has expired.");
    }
    return {
      email: invitation.email,
      name: invitation.name,
      groupName: invitation.group.name,
      expiresAt: invitation.expiresAt,
      existingAccount: Boolean(await this.prisma.user.findUnique({ where: { email: invitation.email }, select: { id: true } })),
    };
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie("maliwise_session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return { ok: true };
  }

  @Get("me")
  @UseGuards(SessionGuard)
  async me(@CurrentUser() user: SessionUser) {
    const account = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: { id: true, name: true, email: true, phone: true, profilePhotoData: true, emailVerifiedAt: true },
    });
    if (!account) return { user: null };
    const memberships = await this.prisma.groupMember.findMany({
      where: { userId: user.sub, revokedAt: null, status: "APPROVED" },
      orderBy: { joinedAt: "asc" },
      select: { group: { select: { id: true, name: true, currency: true, type: true } }, role: true },
    });
    return {
      user: account,
      group: memberships[0]?.group ?? null,
      workspaces: memberships.map(({ group, role }) => ({ ...group, role })),
      pendingMemberships: await this.prisma.groupMember.findMany({
        where: { userId: user.sub, revokedAt: null, status: "PENDING_APPROVAL" },
        select: { group: { select: { id: true, name: true, type: true } } },
      }).then((pending) => pending.map(({ group }) => group)),
    };
  }
}
