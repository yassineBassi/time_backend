import { IsNotEmpty } from 'class-validator';

export class LoginWithTwitterDTO {
  @IsNotEmpty()
  twitterID: string;

  @IsNotEmpty()
  firebaseID: string;
}
