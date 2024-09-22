import { IsString, IsEmail, IsPhoneNumber, MinLength, MaxLength, IsNotEmpty, IsOptional, ValidateIf } from 'class-validator';
import { IsMatch } from 'src/common/validators/is-match.decorator';
import { IsUnique } from 'src/common/validators/is-unique';

export class RegisterClientDTO{

    @IsOptional()
    picture: String;

    @IsNotEmpty() @IsString() @MaxLength(40) @MinLength(3)
    fullName: String;

    @IsNotEmpty() @IsString() @IsEmail()
    email: String;

    @IsNotEmpty() @IsString() @IsPhoneNumber() @IsUnique(['Client', 'Store'], 'phoneNumber')
    phoneNumber: string;

    @ValidateIf(o => !o.firebaseID) @IsNotEmpty() @IsString() @MinLength(8)
    password: string;

    @ValidateIf(o => !o.firebaseID)@IsNotEmpty() @IsMatch('password', { message: 'password_not_match' })
    passwordConfirmation: string;

    @IsNotEmpty() @IsString()
    country: string;

    @IsNotEmpty() @IsString() 
    area: string;

    @IsNotEmpty() @IsString()
    city: string;

    @IsOptional()
    firebaseID: String;
    @IsOptional()
    googleID: String;
}