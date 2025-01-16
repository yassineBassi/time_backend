import { Module } from '@nestjs/common';
import { GiftService } from './gift.service';
import { GiftController } from './gift.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { GiftCardSchema } from 'src/mongoose/gift-card';
import { GiftSchema } from 'src/mongoose/gift';
import { ClientSchema } from 'src/mongoose/client';
import { StoreSchema } from 'src/mongoose/store';
import { CouponModule } from '../coupon/coupon.module';

@Module({
  imports: [
    CouponModule,
    MongooseModule.forFeature([
      { name: 'GiftCard', schema: GiftCardSchema },
      { name: 'Gift', schema: GiftSchema },
      { name: 'Client', schema: ClientSchema },
      { name: 'Store', schema: StoreSchema },
    ]),
  ],
  controllers: [GiftController],
  providers: [GiftService],
  exports: [GiftService]
})
export class GiftModule {}
