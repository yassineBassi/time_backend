import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateFAQDTO {
  @MaxLength(250)
  @MinLength(10)
  @IsString()
  @IsNotEmpty()
  question: string;

  @MaxLength(500)
  @MinLength(10)
  @IsString()
  @IsNotEmpty()
  answer: string;
}
