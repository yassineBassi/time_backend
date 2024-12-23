import { IsNotEmpty } from 'class-validator';

export class LoginWithGoogleDTO {
  @IsNotEmpty()
  googleID: string;

  @IsNotEmpty()
  firebaseID: string;
}
