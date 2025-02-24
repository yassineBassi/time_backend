import { IsNotEmpty, MinLength } from 'class-validator';
import { Exists } from 'src/common/validators/exists';
import { IsUnique } from 'src/common/validators/is-unique';

export class UpdateStoreSectionDTO {
  @Exists('StoreSection', '_id')
  @IsNotEmpty()
  _id: string;

  @IsUnique(['StoreSection'], 'name', [{ dtoField: '_id', modelField: '_id' }])
  @MinLength(2)
  @IsNotEmpty()
  name: string;
}
