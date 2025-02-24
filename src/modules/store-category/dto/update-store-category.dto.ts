import { IsNotEmpty, MinLength, ValidateNested } from 'class-validator';
import { Exists } from 'src/common/validators/exists';
import { IsUnique } from 'src/common/validators/is-unique';

class SectionInfo {
  @Exists('StoreSection', '_id')
  @IsNotEmpty()
  _id: string;
}

export class UpdateStoreCategoryDTO {
  @Exists('StoreCategory', '_id')
  @IsNotEmpty()
  _id: string;

  @ValidateNested()
  @IsNotEmpty()
  section: SectionInfo;

  @IsUnique(['StoreCategory'], 'name', [{ dtoField: '_id', modelField: '_id' }])
  @MinLength(2)
  @IsNotEmpty()
  name: string;
}
