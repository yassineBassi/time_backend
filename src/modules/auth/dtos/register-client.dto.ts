import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { ContainsSpaceSeparatedValues } from 'src/common/validators/contains-space-seperated';
import { IsMatch } from 'src/common/validators/is-match.decorator';
import { IsUnique } from 'src/common/validators/is-unique';

export class RegisterClientDTO {
  @IsOptional()
  picture: string;

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
  
  @ValidateIf((o) => !o.firebaseID)
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ValidateIf((o) => !o.firebaseID)
  @IsNotEmpty()
  @IsMatch('password', { message: 'password_not_match' })
  passwordConfirmation: string;

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
