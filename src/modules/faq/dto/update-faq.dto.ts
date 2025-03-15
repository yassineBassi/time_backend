import { IsNotEmpty, IsString } from 'class-validator';
import { CreateFAQDTO } from './create-faq.dto';

export class UpdateFAQDTO extends CreateFAQDTO {
  @IsString()
  @IsNotEmpty()
  _id: string;
}
