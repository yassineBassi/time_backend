import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreSectionSchema } from 'src/mongoose/store-section';
import { StoreCategorySchema } from 'src/mongoose/store-category';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'StoreSection', schema: StoreSectionSchema },
      { name: 'StoreCategory', schema: StoreCategorySchema },
    ]),
  ],
  controllers: [StoreController],
  providers: [StoreService],
})
export class StoreModule {}
