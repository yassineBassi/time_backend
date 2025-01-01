import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { IsUnique } from 'src/common/validators/is-unique';

export class EditStoreProfileDTO {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  @MinLength(3)
  @IsUnique(['Store'], 'storeName', [{ dtoField: 'id', modelField: '_id' }])
  storeName: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber()
  @IsUnique(['Store', 'Client'], 'phoneNumber', [
    { dtoField: 'id', modelField: '_id' },
  ])
  phoneNumber: string;

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
  @MinLength(23)
  accountNumber: string;
}
