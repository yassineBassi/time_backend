import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAppReportDTO {
  @IsNotEmpty()
  @IsString()
  message: string;
}
