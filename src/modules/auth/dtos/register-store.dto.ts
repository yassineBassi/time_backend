import { IsString, IsEmail, IsPhoneNumber, MinLength, MaxLength, IsNotEmpty, Length } from 'class-validator';
import { IsMatch } from 'src/common/validators/is-match.decorator';
import { IsUnique } from 'src/common/validators/is-unique';
import { StoreCategory } from 'src/mongoose/store-category';

export class RegisterStoreDTO{

    @IsNotEmpty() @IsNotEmpty() @IsString() @MaxLength(40) @MinLength(3) @IsUnique(['Store'], 'storeName')
    storeName: String;

    @IsNotEmpty() @IsString() @IsEmail()
    email: String;

    @IsNotEmpty() @IsString() @IsPhoneNumber() @IsUnique(['Store', 'Client'], 'phoneNumber')
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

    @IsNotEmpty() @Length(10)
    commerceNumber: String

    @IsNotEmpty()
    commerceNumberExpirationDate: Date;

    @IsNotEmpty() @MinLength(5)
    accountNumber: String;

    @IsNotEmpty() @IsString()
    category: String | StoreCategory;

    firebaseID: String;
    googleID: String;
}