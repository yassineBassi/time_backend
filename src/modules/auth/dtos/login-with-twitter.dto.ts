import { IsNotEmpty, IsOptional } from 'class-validator';

export class LoginWithTwitterDTO {
  @IsNotEmpty()
  twitterID: string;

  @IsNotEmpty()
  firebaseID: string;


  @IsOptional()
  notificationToken: string;
}
