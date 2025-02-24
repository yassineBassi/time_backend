import { IsNotEmpty, MinLength } from 'class-validator';
import { IsUnique } from 'src/common/validators/is-unique';

export class CreateStoreSectionDTO {

  @IsUnique(['StoreSection'], 'name')
  @MinLength(2)
  @IsNotEmpty()
  name: string;
}
