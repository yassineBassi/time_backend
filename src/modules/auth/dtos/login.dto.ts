import { IsNotEmpty, IsOptional } from 'class-validator';

export class LoginDTO {
  @IsNotEmpty()
  phoneNumber: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  notificationToken: string;
}
