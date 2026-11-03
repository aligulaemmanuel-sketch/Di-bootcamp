import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { PrismaService } from "./prisma.service";
import { ReminderService } from "./reminder.service";

@Module({
  providers: [MailService, PrismaService, ReminderService],
})
export class WorkerModule {}
