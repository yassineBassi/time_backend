import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationSchema } from 'src/mongoose/reservation';
import { CouponService } from '../coupon/coupon.service';
import { CouponSchema } from 'src/mongoose/coupon';
import { PointsTransferSchema } from 'src/mongoose/points-transfer';
import { WithdrawRequestSchema } from 'src/mongoose/withdraw-request';
import { StoreSchema } from 'src/mongoose/store';
import { ReservationService } from '../reservation/reservation.service';
import { ReservationItemSchema } from 'src/mongoose/reservation-item';
import { ServiceSchema } from 'src/mongoose/service';
import { ReservationModule } from '../reservation/reservation.module';
import { StoreReviewSchema } from 'src/mongoose/store-review';
import { StoreReportSchema } from 'src/mongoose/store-report';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Reservation', schema: ReservationSchema },
      { name: 'ReservationItem', schema: ReservationItemSchema },
      { name: 'Service', schema: ServiceSchema },
      { name: 'StoreReview', schema: StoreReviewSchema },
      { name: 'StoreReport', schema: StoreReportSchema },
      { name: 'Coupon', schema: CouponSchema },
      { name: 'PointsTransfer', schema: PointsTransferSchema },
      { name: 'Store', schema: StoreSchema },
      { name: 'WithdrawRequest', schema: WithdrawRequestSchema },
    ]),
  ],
  controllers: [WalletController],
  providers: [WalletService, CouponService, ReservationService],
})
export class WalletModule {}
