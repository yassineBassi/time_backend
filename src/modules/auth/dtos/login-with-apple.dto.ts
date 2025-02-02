import { IsNotEmpty, IsOptional } from 'class-validator';

export class LoginWithAppleDTO {
  @IsNotEmpty()
  appleID: string;

  @IsNotEmpty()
  firebaseID: string;

  @IsOptional()
  notificationToken: string;
}