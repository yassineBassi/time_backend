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

export class EditClientProfileDTO {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  @MinLength(3)
  fullName: string;

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
}
