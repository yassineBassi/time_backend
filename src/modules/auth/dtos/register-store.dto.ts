import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsNotEmpty,
  Length,
  IsOptional,
} from 'class-validator';
import { IsUnique } from 'src/common/validators/is-unique';
import { StoreCategory } from 'src/mongoose/store-category';

export class RegisterStoreDTO {
  @IsNotEmpty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  @MinLength(3)
  @IsUnique(['Store'], 'storeName')
  storeName: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber()
  @IsUnique(['Store', 'Client'], 'phoneNumber')
  phoneNumber: string;

  @IsOptional()
  password: string;

  @IsOptional()
  passwordConfirmation: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  area: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @Length(10)
  commerceNumber: string;

  @IsNotEmpty()
  commerceNumberExpirationDate: Date;

  @IsNotEmpty()
  @MinLength(23)
  accountNumber: string;

  @IsNotEmpty()
  @IsString()
  category: string | StoreCategory;

  @IsOptional()
  picture: string;

  @IsOptional()
  address: string;
  @IsOptional()
  lng: string;
  @IsOptional()
  lat: string;

  @IsOptional()
  firebaseID: string;
  @IsOptional()
  googleID: string;
  @IsOptional()
  twitterID: string;
  @IsOptional()
  appleID: string;
}
