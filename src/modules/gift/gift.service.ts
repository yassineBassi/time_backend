import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GiftStatus } from 'src/common/models/enums/gift-status';
import { Gift } from 'src/mongoose/gift';
import { GiftCard } from 'src/mongoose/gift-card';
import { User } from 'src/mongoose/user';
import { CouponService } from '../coupon/coupon.service';
import { UserType } from 'src/common/models/enums/user-type';
import { Client } from 'src/mongoose/client';
import { Store } from 'src/mongoose/store';
import { DiscountType } from 'src/common/models/enums/discount-type';
import { CouponType } from 'src/common/models/enums/coupon-type';

@Injectable()
export class GiftService {
  constructor(
    @InjectModel('GiftCard')
    private giftCardModel: Model<GiftCard>,
    @InjectModel('Gift')
    private giftModel: Model<Gift>,
    @InjectModel('Client')
    private clientModel: Model<Client>,
    @InjectModel('Store')
    private storeModel: Model<Store>,
    private readonly couponService: CouponService,
  ) {}

  async getGiftCards() {
    const cards = await this.giftCardModel.find();
    return cards;
  }

  async getGifts(user: User) {
    console.log('get all gifts');

    const gifts = await this.giftModel
      .find({
        userType: user.type,
        user: user.id,
      })
      .populate(['coupon', 'giftCard']);

    console.log(gifts);

    return gifts;
  }

  async fetchGift(giftId: string, user: User) {
    const gift = await this.giftModel
      .findById(giftId)
      .populate(['coupon', 'giftCard']);

    if (gift.user.toString() != user.id.toString()) {
      throw new ForbiddenException();
    }

    if (gift.status != GiftStatus.PAYED) {
      throw new BadRequestException();
    }

    console.log(gift);

    return gift;
  }

  async createGiftCard(giftCardId: string, user: User) {
    const card = await this.giftCardModel.findById(giftCardId);
    let gift = await this.giftModel.create({
      giftCard: card.id,
      status: GiftStatus.CREATED,
      userType: user.type,
      user: user.id,
    });

    gift = await gift.save();

    return gift;
  }

  async handleGiftCallback(metadata: any, tapPaymentId: any, status: string) {
    console.log('-- create gift');
    console.log(metadata);

    let user;
    if (metadata.userType == UserType.CLIENT) {
      user = await this.clientModel.findById(metadata.userId);
    } else {
      user = await this.storeModel.findById(metadata.userId);
    }

    const giftCard = await this.giftCardModel.findById(metadata.id);
    const gift = await this.giftModel.create({
      giftCard: giftCard.id,
      payment: tapPaymentId,
      status:
        status == 'CAPTURED' ? GiftStatus.PAYED : GiftStatus.PAYMENT_FAILED,
      userType: metadata.userType,
      user: metadata.userId,
    });


    if (gift.status == GiftStatus.PAYED) {
        console.log('captured');
      const coupon = await this.couponService.createCoupon(
        user,
        giftCard.price,
        DiscountType.FIX,
        CouponType.GIFT,
        new Date(new Date().getTime() + giftCard.validityMills),
      );
      console.log(coupon);
      gift.coupon = coupon.id;
      await gift.save();
    }

    await gift.save();

    return true;
  }
}
