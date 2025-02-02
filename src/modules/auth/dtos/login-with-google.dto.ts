import { IsNotEmpty, IsOptional } from 'class-validator';

export class LoginWithGoogleDTO {
  @IsNotEmpty()
  googleID: string;

  @IsNotEmpty()
  firebaseID: string;

  @IsOptional()
  notificationToken: string;
}
