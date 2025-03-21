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
import { CouponSchema } from 'src/mongoose/coupon';
import { CouponService } from '../coupon/coupon.service';
import { CouponModule } from '../coupon/coupon.module';
import { NotificationSchema } from 'src/mongoose/notification';
import { FirebaseAdminModule } from '../firebase-admin/firebase-admin.module';
import { ClientSchema } from 'src/mongoose/client';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Store', schema: StoreSchema },
      { name: 'Client', schema: ClientSchema },
      { name: 'Service', schema: ServiceSchema },
      { name: 'Reservation', schema: ReservationSchema },
      { name: 'ReservationItem', schema: ReservationItemSchema },
      { name: 'StoreReview', schema: StoreReviewSchema },
      { name: 'StoreReport', schema: StoreReportSchema },
      { name: 'Coupon', schema: CouponSchema },
      { name: 'Notification', schema: NotificationSchema },
    ]),
    CouponModule,
    FirebaseAdminModule,
    SubscriptionModule,
  ],
  controllers: [ReservationController],
  providers: [ReservationService, CouponService],
  exports: [ReservationService],
})
export class ReservationModule {}
