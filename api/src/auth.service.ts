import {
  ConflictException,
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from "bcryptjs";
import { PrismaService } from "./prisma.service";
import { AcceptInvitationDto, LoginDto, RegisterDto, RequestEmailVerificationDto, RequestPasswordResetDto, ResetPasswordDto, VerifyEmailDto } from "./auth.dto";
import { createOpaqueToken, hashInvitationToken } from "./invitation-token";
import { MailService } from "./mail.service";
import { getAppUrl } from "./config";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwt: JwtService,
    @Inject(MailService) private readonly mail: MailService,
  ) {}

  async register(input: RegisterDto) {
    const email = input.email.trim().toLowerCase();
    if (Boolean(input.groupName) !== Boolean(input.phone)) {
      throw new BadRequestException("Enter both a group name and phone number to create a group, or leave both blank for a personal account.");
    }
    if (input.groupType === "SACCO" && !input.groupName) {
      throw new BadRequestException("Enter a SACCO name and phone number to create a SACCO workspace.");
    }
    if (input.groupName && input.phone && input.constitutionSigned !== true) {
      throw new BadRequestException("Confirm that the Chama or SACCO constitution or bylaws have been signed by the designated officials before creating the workspace.");
    }
    const phone = input.phone
      ? input.phone.startsWith("+") ? input.phone : input.phone.startsWith("0") ? `+254${input.phone.slice(1)}` : `+${input.phone}`
      : null;
    const passwordHash = await hash(input.password, 12);
    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: { email, name: input.name.trim(), passwordHash, phone },
        });
        if (input.groupName && phone) {
          const groupType = input.groupType ?? "CHAMA";
          const group = await tx.group.create({
            data: {
              name: input.groupName.trim(),
              type: groupType,
              members: {
                create: {
                  userId: createdUser.id,
                  name: createdUser.name,
                  phone,
                  role: groupType === "SACCO" ? "CHAIRPERSON" : "OWNER",
                },
              },
            },
          });
          await tx.auditEvent.create({
            data: {
              groupId: group.id,
              actorId: createdUser.id,
              action: groupType === "SACCO" ? "SACCO_CREATED" : "GROUP_CREATED",
              entityType: "Group",
              entityId: group.id,
            },
          });
        }
        return createdUser;
      });
      await this.sendVerificationEmail(user);
      return { message: "Account created. Check your email for a verification link before signing in." };
    } catch (error) {
      if (this.isUniqueError(error)) throw new ConflictException("An account with that email or phone already exists.");
      throw error;
    }
  }

  async login(input: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: input.email.trim().toLowerCase() } });
    if (!user || !(await compare(input.password, user.passwordHash))) {
      throw new UnauthorizedException("Email or password is incorrect.");
    }
    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException("Verify your email address before signing in. Use the resend verification email option if needed.");
    }
    return {
      token: await this.jwt.signAsync({ sub: user.id, email: user.email, ver: user.tokenVersion }),
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, profilePhotoData: user.profilePhotoData },
    };
  }

  async requestEmailVerification(input: RequestEmailVerificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email.trim().toLowerCase() },
      select: { id: true, name: true, email: true, emailVerifiedAt: true },
    });
    if (!user || user.emailVerifiedAt) return;
    await this.sendVerificationEmail(user);
  }

  async verifyEmail(input: VerifyEmailDto) {
    const now = new Date();
    const tokenHash = hashInvitationToken(input.token);
    const user = await this.prisma.user.findUnique({
      where: { emailVerificationTokenHash: tokenHash },
      select: { id: true, emailVerifiedAt: true, emailVerificationExpiresAt: true },
    });
    if (!user || user.emailVerifiedAt || !user.emailVerificationExpiresAt || user.emailVerificationExpiresAt <= now) {
      throw new UnauthorizedException("This email verification link is invalid, expired, or already used.");
    }
    const updated = await this.prisma.user.updateMany({
      where: { id: user.id, emailVerifiedAt: null, emailVerificationTokenHash: tokenHash, emailVerificationExpiresAt: { gt: now } },
      data: { emailVerifiedAt: now, emailVerificationTokenHash: null, emailVerificationExpiresAt: null },
    });
    if (updated.count !== 1) {
      throw new UnauthorizedException("This email verification link is invalid, expired, or already used.");
    }
    return { message: "Email verified. You can now sign in." };
  }

  async acceptInvitation(input: AcceptInvitationDto) {
    const tokenHash = hashInvitationToken(input.token);
    const now = new Date();
    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const invitation = await tx.memberInvitation.findUnique({
          where: { tokenHash },
          include: { group: true },
        });
        if (!invitation || invitation.acceptedAt || invitation.revokedAt || invitation.expiresAt <= now) {
          throw new UnauthorizedException("This invitation is invalid, expired, or already used.");
        }

        let acceptedUser = await tx.user.findUnique({ where: { email: invitation.email } });
        if (acceptedUser) {
          if (!(await compare(input.password, acceptedUser.passwordHash))) {
            throw new UnauthorizedException("Email or password is incorrect.");
          }
          if (!acceptedUser.emailVerifiedAt) {
            acceptedUser = await tx.user.update({
              where: { id: acceptedUser.id },
              data: { emailVerifiedAt: now, emailVerificationTokenHash: null, emailVerificationExpiresAt: null },
            });
          }
        } else {
          acceptedUser = await tx.user.create({
            data: {
              email: invitation.email,
              name: invitation.name,
              passwordHash: await hash(input.password, 12),
              phone: invitation.phone,
              emailVerifiedAt: now,
            },
          });
        }

        const claimed = await tx.memberInvitation.updateMany({
          where: { id: invitation.id, acceptedAt: null, revokedAt: null, expiresAt: { gt: now } },
          data: { acceptedAt: now, acceptedUserId: acceptedUser.id },
        });
        if (claimed.count !== 1) {
          throw new UnauthorizedException("This invitation is invalid, expired, or already used.");
        }

        const previousMembership = await tx.groupMember.findFirst({
          where: { groupId: invitation.groupId, phone: invitation.phone },
          select: { id: true, revokedAt: true },
        });
        let member: { id: string };
        if (previousMembership) {
          if (!previousMembership.revokedAt) {
            throw new ConflictException("This account is already an active member of the group.");
          }
          const restored = await tx.groupMember.updateMany({
            where: { id: previousMembership.id, revokedAt: { not: null } },
            data: {
              userId: acceptedUser.id,
              name: invitation.name,
              role: invitation.role,
              revokedAt: null,
              status: "PENDING_APPROVAL",
            },
          });
          if (restored.count !== 1) {
            throw new ConflictException("This membership changed while the invitation was being accepted. Try again.");
          }
          member = { id: previousMembership.id };
        } else {
          member = await tx.groupMember.create({
            data: {
              groupId: invitation.groupId,
              userId: acceptedUser.id,
              name: invitation.name,
              phone: invitation.phone,
              role: invitation.role,
              status: "PENDING_APPROVAL",
            },
          });
        }
        await tx.auditEvent.create({
          data: {
            groupId: invitation.groupId,
            actorId: acceptedUser.id,
            action: "MEMBER_INVITATION_ACCEPTED",
            entityType: "GroupMember",
            entityId: member.id,
          },
        });
        return acceptedUser;
      });

      return {
        token: await this.jwt.signAsync({ sub: user.id, email: user.email, ver: user.tokenVersion }),
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, profilePhotoData: user.profilePhotoData },
      };
    } catch (error) {
      if (this.isUniqueError(error)) {
        throw new ConflictException("This account could not be added. Contact your group administrator.");
      }
      throw error;
    }
  }

  private async sendVerificationEmail(user: { id: string; name: string; email: string }) {
    let verificationUrl: URL;
    try {
      verificationUrl = new URL("/", getAppUrl());
    } catch {
      throw new Error("APP_URL must be a valid absolute URL for email verification links.");
    }
    if (
      (verificationUrl.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && verificationUrl.protocol === "http:")) ||
      verificationUrl.username ||
      verificationUrl.password
    ) {
      throw new Error("APP_URL must use HTTPS in production.");
    }
    const { token, tokenHash } = createOpaqueToken();
    const now = new Date();
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpiresAt: new Date(now.getTime() + 60 * 60 * 1000),
      },
    });
    verificationUrl.searchParams.set("verifyEmail", token);
    try {
      await this.mail.sendEmailVerification({ email: user.email, name: user.name, verificationUrl: verificationUrl.toString() });
    } catch (error) {
      await this.prisma.user.updateMany({
        where: { id: user.id, emailVerificationTokenHash: tokenHash },
        data: { emailVerificationTokenHash: null, emailVerificationExpiresAt: null },
      });
      throw error;
    }
  }

  async requestPasswordReset(input: RequestPasswordResetDto) {
    const appUrl = getAppUrl();
    let resetUrl: URL;
    try {
      resetUrl = new URL("/", appUrl);
    } catch {
      throw new Error("APP_URL must be a valid absolute URL for password reset links.");
    }
    if (
      (resetUrl.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && resetUrl.protocol === "http:")) ||
      resetUrl.username ||
      resetUrl.password
    ) {
      throw new Error("APP_URL must use HTTPS in production.");
    }

    const email = input.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });
    if (!user) return;

    const { token, tokenHash } = createOpaqueToken();
    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.deleteMany({ where: { userId: user.id } });
      await tx.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
        },
      });
    });

    resetUrl.searchParams.set("reset", token);
    try {
      await this.mail.sendPasswordReset({ email: user.email, name: user.name, resetUrl: resetUrl.toString() });
    } catch (error) {
      if (!(error instanceof ServiceUnavailableException)) throw error;
      await this.prisma.passwordResetToken.deleteMany({ where: { tokenHash } });
      this.logger.error("Password reset email delivery failed.");
    }
  }

  async resetPassword(input: ResetPasswordDto) {
    const now = new Date();
    const tokenHash = hashInvitationToken(input.token);
    const passwordHash = await hash(input.password, 12);

    await this.prisma.$transaction(async (tx) => {
      const reset = await tx.passwordResetToken.findUnique({
        where: { tokenHash },
        select: { id: true, userId: true, expiresAt: true, usedAt: true },
      });
      if (!reset || reset.usedAt || reset.expiresAt <= now) {
        throw new UnauthorizedException("This password reset link is invalid, expired, or already used.");
      }

      const claimed = await tx.passwordResetToken.updateMany({
        where: { id: reset.id, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now },
      });
      if (claimed.count !== 1) {
        throw new UnauthorizedException("This password reset link is invalid, expired, or already used.");
      }

      await tx.user.update({
        where: { id: reset.userId },
        data: { passwordHash, tokenVersion: { increment: 1 } },
      });
      await tx.passwordResetToken.deleteMany({
        where: { userId: reset.userId, id: { not: reset.id } },
      });
      const memberships = await tx.groupMember.findMany({
        where: { userId: reset.userId, revokedAt: null },
        select: { groupId: true },
      });
      for (const membership of memberships) {
        await tx.auditEvent.create({
          data: {
            groupId: membership.groupId,
            actorId: reset.userId,
            action: "PASSWORD_RESET",
            entityType: "User",
            entityId: reset.userId,
          },
        });
      }
    });
  }

  private isUniqueError(error: unknown): boolean {
    return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
  }
}
