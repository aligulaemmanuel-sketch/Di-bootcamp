import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { WorkspaceController } from "./workspace.controller";
import { PrismaService } from "./prisma.service";
import { MailService } from "./mail.service";
import { DarajaController } from "./daraja.controller";
import { DarajaService } from "./daraja.service";
import { ReminderService } from "./reminder.service";

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "8h" },
    }),
  ],
  controllers: [AuthController, WorkspaceController, DarajaController],
  providers: [AuthService, DarajaService, MailService, PrismaService, ReminderService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
