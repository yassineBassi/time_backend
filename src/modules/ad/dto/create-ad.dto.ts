import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAdDTO {
  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  title: string;
}
