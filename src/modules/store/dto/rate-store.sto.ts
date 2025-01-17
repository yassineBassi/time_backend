import { IsNotEmpty, Max, Min } from 'class-validator';

export class RateStoreDTO {
  @IsNotEmpty()
  message: string;

  @IsNotEmpty()
  @Min(0)
  @Max(5)
  rate: number;
}
