import { IsString, IsEmail, IsPhoneNumber, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { IsMatch } from 'src/common/validators/is-match.decorator';
import { IsUnique } from 'src/common/validators/is-unique';

export class RegisterClientDTO{

    @IsNotEmpty() @IsString() @MaxLength(40) @MinLength(3) @IsUnique('Client', 'username')
    username: String;

    @IsNotEmpty() @IsString() @IsEmail()
    email: String;

    @IsNotEmpty() @IsString() @IsPhoneNumber() @IsUnique('Client', 'phoneNumber')
    phoneNumber: string;

    @IsNotEmpty() @IsString() @MinLength(8)
    password: string;

    @IsNotEmpty() @IsMatch('password', { message: 'password_not_match' })
    passwordConfirmation: string;

    @IsNotEmpty() @IsString()
    country: string;

    @IsNotEmpty() @IsString() 
    area: string;

    @IsNotEmpty() @IsString()
    city: string;
}