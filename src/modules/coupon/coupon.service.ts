import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CouponType } from 'src/common/models/enums/coupon-type';
import { DiscountType } from 'src/common/models/enums/discount-type';
import { Coupon } from 'src/mongoose/coupon';
import { User } from 'src/mongoose/user';

@Injectable()
export class CouponService {
  constructor(
    @InjectModel('Coupon')
    private readonly couponModel: Model<Coupon>,
  ) {}

  private generateRandomCode(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  }

  private async generateCouponCode() {
    let code: string;
    let codeExists = true;
    const length = 10;

    while (codeExists) {
      code = this.generateRandomCode(length);
      codeExists = (await this.couponModel.countDocuments({ code })) > 0;
    }

    return code;
  }

  async createCoupon(
    user: User,
    discount: number,
    discountType: DiscountType,
    type: CouponType,
  ) {
    const coupon = await (
      await this.couponModel.create({
        code: await this.generateCouponCode(),
        discount,
        discountType,
        type,
        consumed: false,
        userType: user.type,
        user: user.id,
      })
    ).save();

    return coupon;
  }
}
