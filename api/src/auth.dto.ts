import { IsBoolean, IsDateString, IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(72)
  password!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  groupName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(?:\+?254|0)?[17]\d{8}$/)
  phone?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(CHAMA|SACCO)$/)
  groupType?: "CHAMA" | "SACCO";

  @IsOptional()
  @IsBoolean()
  constitutionSigned?: boolean;
}

export class CreateGroupDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsString()
  @Matches(/^(CHAMA|SACCO)$/)
  type!: "CHAMA" | "SACCO";

  @IsString()
  @Matches(/^(?:\+?254|0)?[17]\d{8}$/)
  phone!: string;

  @IsBoolean()
  constitutionSigned!: boolean;
}

export class CreateSaccoEntryDto {
  @IsString()
  @Matches(/^(SHARE_CAPITAL|DEPOSIT|WITHDRAWAL)$/)
  kind!: "SHARE_CAPITAL" | "DEPOSIT" | "WITHDRAWAL";

  @IsString()
  @Matches(/^(BOSA|FOSA)$/)
  accountType!: "BOSA" | "FOSA";

  @IsString()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  memberId!: string;

  @IsString()
  @Matches(/^[1-9]\d{0,11}$/)
  amountKes!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}

export class CreateSaccoLoanProductDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsString()
  @Matches(/^(FLAT|REDUCING_BALANCE)$/)
  calculationMethod!: "FLAT" | "REDUCING_BALANCE";

  @IsString()
  @Matches(/^(?:0|[1-9]\d{0,3})$/)
  annualInterestBps!: string;

  @IsString()
  @Matches(/^[1-9]\d{0,2}$/)
  termMonths!: string;
}

export class LoginDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(72)
  password!: string;
}

export class RequestPasswordResetDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{43}$/)
  token!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(72)
  password!: string;
}

export class AcceptInvitationDto {
  @IsString()
  @MinLength(43)
  @MaxLength(43)
  token!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(72)
  password!: string;
}

export class CreateMemberDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsString()
  @Matches(/^(?:\+?254|0)?[17]\d{8}$/)
  phone!: string;

  @IsString()
  @Matches(/^(MEMBER|TREASURER|SECRETARY|CREDIT_OFFICER)$/)
  role!: "MEMBER" | "TREASURER" | "SECRETARY" | "CREDIT_OFFICER";
}

export class CreateInvitationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @Matches(/^(?:\+?254|0)?[17]\d{8}$/)
  phone!: string;

  @IsString()
  @Matches(/^(MEMBER|TREASURER|SECRETARY|CREDIT_OFFICER)$/)
  role!: "MEMBER" | "TREASURER" | "SECRETARY" | "CREDIT_OFFICER";
}

export class CreateContributionDto {
  @IsString()
  memberId!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  savingsGoalId?: string;

  @IsString()
  @Matches(/^[1-9]\d{0,11}$/)
  amountKes!: string;

  @IsString()
  @Matches(/^(MPESA|BANK|CASH)$/)
  method!: "MPESA" | "BANK" | "CASH";

  @IsString()
  @MaxLength(300)
  note = "";
}

export class DarajaConfigurationDto {
  @IsString()
  @Matches(/^\d{5,7}$/)
  shortcode!: string;

  @IsString()
  @Matches(/^(PAYBILL|TILL)$/)
  shortcodeType!: "PAYBILL" | "TILL";

  @IsOptional()
  @IsString()
  @MaxLength(200)
  consumerKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  consumerSecret?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  passkey?: string;
}

export class StartDarajaPaymentDto {
  @IsString()
  @Matches(/^[1-9]\d{0,5}$/)
  amountKes!: string;

  @IsString()
  @Matches(/^(?:\+?254|0)?[17]\d{8}$/)
  phone!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  savingsGoalId?: string;
}

export class CreateLoanDto {
  @IsString()
  memberId!: string;

  @IsString()
  @Matches(/^[1-9]\d{0,11}$/)
  amountKes!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(250)
  purpose!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  productId?: string;
}

export class DecideLoanDto {
  @IsString()
  @Matches(/^(APPROVED|DECLINED)$/)
  status!: "APPROVED" | "DECLINED";
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(?:\+?254|0)?[17]\d{8}$/)
  phone?: string;

  @IsOptional()
  @IsString()
  @Matches(/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/)
  @MaxLength(1_400_000)
  profilePhotoData?: string | null;
}

export class CreateSavingsGoalDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  title!: string;

  @IsString()
  @Matches(/^[1-9]\d{0,11}$/)
  targetKes!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  memberId?: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startsAt!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  deadline!: string;
}

export class CreatePersonalActivityDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title!: string;

  @IsString()
  @Matches(/^(SAVING|INVESTMENT|INCOME|EXPENSE)$/)
  kind!: "SAVING" | "INVESTMENT" | "INCOME" | "EXPENSE";

  @IsString()
  @Matches(/^[1-9]\d{0,11}$/)
  amountKes!: string;

  @IsOptional()
  @IsDateString()
  occurredAt?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  goalId?: string;
}

export class CreatePersonalGoalDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  title!: string;

  @IsString()
  @Matches(/^(SAVING|INVESTMENT)$/)
  kind!: "SAVING" | "INVESTMENT";

  @IsString()
  @Matches(/^[1-9]\d{0,11}$/)
  targetKes!: string;

  @IsDateString()
  targetDate!: string;
}

export class CreateReminderDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title!: string;

  @IsString()
  @MaxLength(500)
  message = "";

  @IsDateString()
  dueAt!: string;

  @IsOptional()
  @IsBoolean()
  emailEnabled = false;

  @IsOptional()
  @IsBoolean()
  smsEnabled = false;

  @IsOptional()
  @IsBoolean()
  sharedWithGroup = false;
}
