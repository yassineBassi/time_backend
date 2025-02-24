import { IsNotEmpty, MinLength, ValidateNested } from 'class-validator';
import { Exists } from 'src/common/validators/exists';
import { IsUnique } from 'src/common/validators/is-unique';

class SectionInfo {
  @Exists('StoreSection', '_id')
  _id: string;
}

export class CreateStoreCategoryDTO {
  @IsNotEmpty()
  @ValidateNested()
  section: SectionInfo;

  @IsUnique(['StoreCategory'], 'name')
  @MinLength(2)
  @IsNotEmpty()
  name: string;
}
