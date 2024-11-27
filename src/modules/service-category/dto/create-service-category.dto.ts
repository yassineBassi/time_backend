import { IsNotEmpty, IsString } from 'class-validator';
import { IsUnique } from 'src/common/validators/is-unique';

export class CreateServiceCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
