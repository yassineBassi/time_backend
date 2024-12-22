import { IsNotEmpty } from 'class-validator';

export class LoginWithAppleDTO {
  @IsNotEmpty()
  appleID: string;

  @IsNotEmpty()
  firebaseID: string;
}