import { IsNotEmpty, Length, MinLength } from 'class-validator';

export class UpdateDashboardStore {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @Length(10)
  commerceNumber: string;

  @IsNotEmpty()
  commerceNumberExpirationDate: Date;

  @IsNotEmpty()
  @MinLength(20)
  accountNumber: string;
}
