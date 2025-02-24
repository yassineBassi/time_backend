import { Module } from '@nestjs/common';
import { StoreCategoryService } from './store-category.service';
import { StoreCategoryController } from './store-category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreSectionSchema } from 'src/mongoose/store-section';
import { StoreCategorySchema } from 'src/mongoose/store-category';
import { SharedModule } from 'src/common/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'StoreSection', schema: StoreSectionSchema },
      { name: 'StoreCategory', schema: StoreCategorySchema },
    ]),
    SharedModule,
  ],
  controllers: [StoreCategoryController],
  providers: [StoreCategoryService],
})
export class StoreCategoryModule {}
