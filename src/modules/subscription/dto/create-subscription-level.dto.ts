import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateSubscriptionLevelDTO {
  @MaxLength(150)
  @MinLength(1)
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @Min(1)
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @Min(1)
  @IsNumber()
  @IsNotEmpty()
  showPrice: number;

  @Min(1)
  @IsNumber()
  @IsNotEmpty()
  expirationDays: number;

  @Min(1)
  @IsNumber()
  @IsNotEmpty()
  reservations: number;

  @IsNumber()
  @IsNotEmpty()
  specialAds: number;

  @IsBoolean()
  @IsNotEmpty()
  verified: boolean;

  @IsBoolean()
  @IsNotEmpty()
  support: boolean;

  @IsBoolean()
  @IsNotEmpty()
  specialServices: boolean;
}
