import { IsNotEmpty, IsString } from 'class-validator';
import { CreateSubscriptionLevelDTO } from './create-subscription-level.dto';

export class UpdateSubscriptionLevelDTO extends CreateSubscriptionLevelDTO {
  @IsString()
  @IsNotEmpty()
  _id: string;
}
