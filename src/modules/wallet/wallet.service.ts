import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CouponType } from 'src/common/models/enums/coupon-type';
import { DiscountType } from 'src/common/models/enums/discount-type';
import { ReservationStatus } from 'src/common/models/enums/reservation-status';
import { UserType } from 'src/common/models/enums/user-type';
import { Reservation } from 'src/mongoose/reservation';
import { User } from 'src/mongoose/user';
import { CouponService } from '../coupon/coupon.service';
import { PointsTransfer } from 'src/mongoose/points-transfer';
import { ReservationItem } from 'src/mongoose/reservation-item';
import { transactionType } from 'src/common/models/enums/transaction-type';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel('Reservation')
    private readonly reservationModel: Model<Reservation>,
    @InjectModel('PointsTransfer')
    private readonly pointsTransfernModel: Model<PointsTransfer>,
    private readonly couponService: CouponService,
  ) {}

  async getMyWallet(user: User) {
    const filter = {
      status: ReservationStatus.COMPLETED,
    };

    if (user.type == UserType.STORE) filter['store'] = user.id;
    else filter['client'] = user.id;

    const reservations = await this.reservationModel.find(filter).populate({
      path: 'items',
      populate: {
        path: 'service',
      },
    });

    let points = 0;
    if (reservations && reservations.length) {
      points += reservations
        .map((r) => r.totalPrice)
        .reduce((acc, curr) => acc + curr);
    }

    const transfers = await this.pointsTransfernModel
      .find({
        user: user.id,
        userType: user.type,
      })
      .populate('coupon');

    if (transfers && transfers.length) {
      points -= transfers
        .map((t) => t.points)
        .reduce((acc, curr) => acc + curr);
    }

    let transactions = [];
    for (const r of reservations) {
      for (const i of r.items) {
        const item: any = i;
        transactions.push({
          _id: item.id,
          label: item.service.title,
          price: item.price * item.quantity,
          points: item.price * item.quantity,
          number: r.number,
          type: transactionType.RESERVATION,
          date: new Date((r as any).createdAt),
        });
      }
    }

    for (const t of transfers) {
        console.log(t);
      transactions.push({
        _id: t.id,
        label: '',
        price: (t.coupon as any).discount,
        points: t.points,
        number: '',
        type: transactionType.POINTS_TRANSFER,
        date: new Date((t as any).createdAt),
      });
    }

    if (transactions && transactions.length) {
      transactions = transactions.sort(
        (a, b) => b.date.getTime() - a.date.getTime(),
      );
    }

    return {
      points: points,
      transactions,
    };
  }

  async transferPoints(user: User, points: number) {
    const myPoints = (await this.getMyWallet(user))['points'];

    if (points > myPoints) {
      throw new BadRequestException('not allowed');
    }

    const coupon = await this.couponService.createCoupon(
      user,
      points / 100,
      DiscountType.FIX,
      CouponType.BY_POINTS,
    );

    await (
      await this.pointsTransfernModel.create({
        coupon: coupon.id,
        points,
        price: coupon.discount,
        userType: user.type,
        user: user,
      })
    ).save();

    return coupon;
  }
}
