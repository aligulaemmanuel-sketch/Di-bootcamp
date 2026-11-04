import {
  BadRequestException,
  ForbiddenException,
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { isUUID } from "class-validator";
import { CurrentUser, SessionGuard, SessionUser } from "./auth";
import { DarajaConfigurationDto, StartDarajaPaymentDto } from "./auth.dto";
import { DarajaService } from "./daraja.service";
import { PrismaService } from "./prisma.service";

@Controller("api/payments/daraja")
export class DarajaController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(DarajaService) private readonly daraja: DarajaService,
  ) {}

  @Get("config")
  @UseGuards(SessionGuard)
  async configuration(@CurrentUser() user: SessionUser) {
    const membership = await this.getMembership(user);
    this.rejectSacco(membership.groupType);
    return this.daraja.configuration(membership.groupId);
  }

  @Put("config")
  @UseGuards(SessionGuard)
  async saveConfiguration(@CurrentUser() user: SessionUser, @Body() input: DarajaConfigurationDto) {
    const membership = await this.getMembership(user);
    this.rejectSacco(membership.groupType);
    if (membership.role !== "OWNER" && membership.role !== "ADMIN") throw new ForbiddenException("Only a group owner or administrator can configure M-Pesa.");
    return this.daraja.saveConfiguration(membership.groupId, user.sub, input);
  }

  @Post("stk-push")
  @UseGuards(SessionGuard)
  async startPayment(@CurrentUser() user: SessionUser, @Body() input: StartDarajaPaymentDto) {
    const membership = await this.getMembership(user);
    this.rejectSacco(membership.groupType);
    return this.daraja.startPayment(user.sub, membership.groupId, membership.id, input);
  }

  @Get("stk-push/:id")
  @UseGuards(SessionGuard)
  async paymentStatus(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    if (!isUUID(id)) throw new BadRequestException("The payment request ID is invalid.");
    const membership = await this.getMembership(user);
    this.rejectSacco(membership.groupType);
    return this.daraja.statusForGroup(
      id,
      membership.groupId,
      membership.id,
      membership.role === "ADMIN" || membership.role === "TREASURER",
    );
  }

  @Post("callback/:callbackToken")
  async callback(@Param("callbackToken") callbackToken: string, @Body() payload: unknown) {
    if (!isUUID(callbackToken)) throw new BadRequestException("The callback token is invalid.");
    await this.daraja.receiveCallback(callbackToken, payload);
    return { ResultCode: 0, ResultDesc: "Accepted" };
  }

  private async getMembership(user: SessionUser) {
    if (user.personalWorkspace) {
      throw new BadRequestException("Select a group workspace to access M-Pesa payments.");
    }
    const membership = await this.prisma.groupMember.findFirst({
      where: { userId: user.sub, revokedAt: null, status: "APPROVED", ...(user.selectedGroupId ? { groupId: user.selectedGroupId } : {}) },
      orderBy: { joinedAt: "asc" },
      select: { id: true, groupId: true, role: true, group: { select: { type: true } } },
    });
    if (!membership) throw new NotFoundException("Your account is not linked to a group.");
    return { ...membership, groupType: membership.group.type };
  }

  private rejectSacco(groupType: string) {
    if (groupType === "SACCO") throw new ForbiddenException("Live payment integration is not available for SACCO workspaces.");
  }
}
