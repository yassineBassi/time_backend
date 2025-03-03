import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsNotEmpty,
  Length,
  IsOptional,
  IsAlpha,
} from 'class-validator';
import { ContainsSpaceSeparatedValues } from 'src/common/validators/contains-space-seperated';
import { IsUnique } from 'src/common/validators/is-unique';
import { StoreCategory } from 'src/mongoose/store-category';

export class RegisterStoreDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  @MinLength(3)
  @IsUnique(['Store'], 'storeName')
  storeName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(80)
  @MinLength(6)
  @ContainsSpaceSeparatedValues()
  fullName: string;

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
  @MinLength(20)
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

  @IsOptional()
  notificationToken: string;
}
