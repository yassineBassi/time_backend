import { IsNotEmpty } from 'class-validator';

export class LoginWithGoogleDTO {
  @IsNotEmpty()
  googleId: string;

  @IsNotEmpty()
  firebaseId: string;
}
