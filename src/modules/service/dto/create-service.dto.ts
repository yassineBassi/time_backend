import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { DiscountType } from 'src/common/models/enums/discount-type';

export class CreateServiceDto {
  @MaxLength(40)
  @MinLength(5)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Max(1000)
  @Min(0.01)
  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  discount: number;

  @IsEnum(DiscountType)
  @IsNotEmpty()
  discountType: DiscountType;

  @IsNotEmpty()
  categoryId: string;

  @IsNumber()
  @IsNotEmpty()
  duration: number;
}
