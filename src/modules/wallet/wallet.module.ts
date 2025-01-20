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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Reservation', schema: ReservationSchema },
      { name: 'Coupon', schema: CouponSchema },
      { name: 'PointsTransfer', schema: PointsTransferSchema },
      { name: 'Store', schema: StoreSchema },
      { name: 'WithdrawRequest', schema: WithdrawRequestSchema },
    ]),
  ],
  controllers: [WalletController],
  providers: [WalletService, CouponService],
})
export class WalletModule {}
