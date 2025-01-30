import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreSectionSchema } from 'src/mongoose/store-section';
import { StoreCategorySchema } from 'src/mongoose/store-category';
import { SubscriptionModule } from '../subscription/subscription.module';
import { WorkingTimeSchema } from 'src/mongoose/working-time';
import { StoreSchema } from 'src/mongoose/store';
import { ReservationSchema } from 'src/mongoose/reservation';
import { StoreReviewSchema } from 'src/mongoose/store-review';
import { StoreReportSchema } from 'src/mongoose/store-report';
import { FacilitySchema } from 'src/mongoose/facility';
import { FacilityItemSchema } from 'src/mongoose/facility-item';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Store', schema: StoreSchema },
      { name: 'StoreSection', schema: StoreSectionSchema },
      { name: 'StoreCategory', schema: StoreCategorySchema },
      { name: 'WorkingTime', schema: WorkingTimeSchema },
      { name: 'Reservation', schema: ReservationSchema },
      { name: 'StoreReview', schema: StoreReviewSchema },
      { name: 'StoreReport', schema: StoreReportSchema },,
      { name: 'Facility', schema: FacilitySchema },
      { name: 'FacilityItem', schema: FacilityItemSchema },
    ]),
    SubscriptionModule,
  ],
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService]
})
export class StoreModule {}
