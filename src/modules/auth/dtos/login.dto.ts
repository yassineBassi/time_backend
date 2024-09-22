import { IsNotEmpty } from 'class-validator';

export class LoginDTO{
    @IsNotEmpty()
    phoneNumber: string;

    @IsNotEmpty()
    password: string;
}