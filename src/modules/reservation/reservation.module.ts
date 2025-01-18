import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreSchema } from 'src/mongoose/store';
import { ServiceSchema } from 'src/mongoose/service';
import { ReservationSchema } from 'src/mongoose/reservation';
import { ReservationItemSchema } from 'src/mongoose/reservation-item';
import { StoreReviewSchema } from 'src/mongoose/store-review';
import { StoreReportSchema } from 'src/mongoose/store-report';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Store', schema: StoreSchema },
      { name: 'Service', schema: ServiceSchema },
      { name: 'Reservation', schema: ReservationSchema },
      { name: 'ReservationItem', schema: ReservationItemSchema },
      { name: 'StoreReview', schema: StoreReviewSchema },
      { name: 'StoreReport', schema: StoreReportSchema },
    ]),
  ],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}
