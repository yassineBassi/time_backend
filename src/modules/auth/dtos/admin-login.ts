import { IsNotEmpty } from 'class-validator';

export class AdminLoginDTO {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
