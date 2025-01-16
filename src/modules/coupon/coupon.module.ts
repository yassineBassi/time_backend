import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { CouponSchema } from 'src/mongoose/coupon';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Coupon', schema: CouponSchema }]),
  ],
  controllers: [CouponController],
  providers: [CouponService],
  exports: [CouponService]
})
export class CouponModule {}
