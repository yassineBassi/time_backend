import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreSectionSchema } from 'src/mongoose/store-section';
import { StoreCategorySchema } from 'src/mongoose/store-category';
import { SubscriptionModule } from '../subscription/subscription.module';
import { WorkingTimeSchema } from 'src/mongoose/working-time';
import { StoreSchema } from 'src/mongoose/store';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Store', schema: StoreSchema },
      { name: 'StoreSection', schema: StoreSectionSchema },
      { name: 'StoreCategory', schema: StoreCategorySchema },
      { name: 'WorkingTime', schema: WorkingTimeSchema },
    ]),
    SubscriptionModule
  ],
  controllers: [StoreController],
  providers: [StoreService],
})
export class StoreModule {}
