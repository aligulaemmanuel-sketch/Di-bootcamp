import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import { PrismaService } from "./prisma.service";

export type SessionUser = {
  sub: string;
  email: string;
  ver?: number;
  selectedGroupId?: string | null;
  personalWorkspace?: boolean;
};
type AuthenticatedRequest = Request & { user: SessionUser };
type CookieRequest = Request & { cookies?: Record<string, unknown> };

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    @Inject(JwtService) private readonly jwt: JwtService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest & CookieRequest>();
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
      const expectedOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
      if (request.get("origin") !== expectedOrigin) {
        throw new UnauthorizedException("The request origin could not be verified.");
      }
    }
    const token = request.cookies?.maliwise_session as string | undefined;
    if (!token) throw new UnauthorizedException("Please sign in to continue.");
    try {
      request.user = this.jwt.verify<SessionUser>(token);
    } catch {
      throw new UnauthorizedException("Your session has expired. Please sign in again.");
    }
    const current = await this.prisma.user.findUnique({
      where: { id: request.user.sub },
      select: { tokenVersion: true, emailVerifiedAt: true },
    });
    if (!current || current.emailVerifiedAt === null || (request.user.ver ?? 0) !== current.tokenVersion) {
      throw new UnauthorizedException("Your session has expired. Please sign in again.");
    }
    const selectedWorkspace = request.get("x-maliwise-workspace");
    if (selectedWorkspace === "personal") {
      request.user.personalWorkspace = true;
      request.user.selectedGroupId = null;
    } else if (selectedWorkspace) {
      const membership = await this.prisma.groupMember.findFirst({
        where: { userId: request.user.sub, groupId: selectedWorkspace, revokedAt: null, status: "APPROVED" },
        select: { groupId: true },
      });
      if (!membership) throw new ForbiddenException("You do not belong to the selected group workspace.");
      request.user.selectedGroupId = membership.groupId;
      request.user.personalWorkspace = false;
    } else {
      const membership = await this.prisma.groupMember.findFirst({
        where: { userId: request.user.sub, revokedAt: null, status: "APPROVED" },
        orderBy: { joinedAt: "asc" },
        select: { groupId: true },
      });
      request.user.selectedGroupId = membership?.groupId ?? null;
      request.user.personalWorkspace = false;
    }
    return true;
  }
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SessionUser =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
