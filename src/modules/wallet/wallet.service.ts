import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { TransactionType } from 'src/common/models/enums/transaction-type';
import { Store } from 'src/mongoose/store';
import { WithdrawRequest } from 'src/mongoose/withdraw-request';
import { WithdrawRequestStatus } from 'src/common/models/enums/withdraw-request-status';
import { Transaction } from 'src/common/models/transaction';
import { ReservationService } from '../reservation/reservation.service';
import { DashboardFilterQuery } from 'src/common/models/dahsboard-filter-query';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel('Reservation')
    private readonly reservationModel: Model<Reservation>,
    @InjectModel('PointsTransfer')
    private readonly pointsTransfernModel: Model<PointsTransfer>,
    @InjectModel('Store')
    private readonly storeModel: Model<Store>,
    @InjectModel('WithdrawRequest')
    private readonly withdrawRequestModel: Model<WithdrawRequest>,
    private readonly couponService: CouponService,
    private readonly reservationService: ReservationService,
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

    let transactions: Transaction[] =
      this.reservationService.reservationsToTransactions(reservations);

    if (user.type == UserType.CLIENT) {
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

      for (const t of transfers) {
        transactions.push({
          _id: t.id,
          label: '',
          price: (t.coupon as any).discount,
          points: t.points,
          number: '',
          type: TransactionType.POINTS_TRANSFER,
          date: new Date((t as any).createdAt),
        });
      }
    } else if (user.type == UserType.STORE) {
      const requests = await this.withdrawRequestModel.find({
        status: WithdrawRequestStatus.PAYED,
        store: user.id,
      });

      if (requests && requests.length) {
        points -= requests
          .map((r) => r.amount)
          .reduce((acc, curr) => acc + curr);
      }

      for (const r of requests) {
        transactions.push({
          _id: r.id,
          label: '',
          price: r.amount,
          points: r.amount,
          number: '',
          status: r.status,
          type: TransactionType.WITHDRAW_FUNDS,
          date: new Date((r as any).createdAt),
        });
      }
    }

    if (transactions && transactions.length) {
      transactions = transactions.sort(
        (a, b) => b.date.getTime() - a.date.getTime(),
      );
    }

    let successTransactions = 0;
    let failedTransactions = 0;
    if (user.type == UserType.STORE) {
      successTransactions = await this.reservationModel.countDocuments({
        store: user.id,
        status: ReservationStatus.COMPLETED,
      });
      failedTransactions = await this.reservationModel.countDocuments({
        store: user.id,
        status: {
          $in: [ReservationStatus.CANCELED, ReservationStatus.REJECTED],
        },
      });
    }

    return {
      points: points,
      transactions,
      success: successTransactions,
      failed: failedTransactions,
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

  async getWithdrawRequests(query: DashboardFilterQuery) {
    const searchQuery = JSON.parse(decodeURIComponent(query.searchQuery));

    const searchFilter = {};

    Object.keys(searchQuery).forEach((k) => {
      if (searchQuery[k].length)
        searchFilter[k] = { $regex: new RegExp(`${searchQuery[k]}`, 'i') };
    });

    const requests = await this.withdrawRequestModel
      .find(searchFilter)
      .populate({
        path: 'store',
        select: 'storeName fullName accountNumber',
      })
      .sort({ createdAt: -1 })
      .skip(query.skip)
      .limit(query.take);

    return {
      'withdraw-requests': requests,
      count: await this.withdrawRequestModel.countDocuments(searchFilter),
    };
  }

  async requestWithdraw(user: Store, amount: number) {
    if (!amount) {
      return new BadRequestException();
    }

    const store = await this.storeModel.findById(user.id);

    const wallet = await this.getMyWallet(store);
    const balance = wallet.points;

    if (amount > balance) {
      return new ForbiddenException('');
    }

    await (
      await this.withdrawRequestModel.create({
        store: store.id,
        amount: amount,
        status: WithdrawRequestStatus.INPROGRESS,
      })
    ).save();

    return {
      success: true,
    };
  }

  async acceptWithdrawRequest(requestId: string) {
    const withdrawRequest = await this.withdrawRequestModel.findById(requestId);
    if (!withdrawRequest) {
      throw new NotFoundException('request_not_found');
    }

    if (withdrawRequest.status != WithdrawRequestStatus.INPROGRESS) {
      throw new ForbiddenException('errors.withdraw_request_no_available');
    }

    const store = await this.storeModel.findById(withdrawRequest.store);

    const balance = (await this.getMyWallet(store)).points;

    if (balance < withdrawRequest.amount) {
      throw new ForbiddenException('errors.balance_insufficient');
    }

    withdrawRequest.status = WithdrawRequestStatus.PAYED;
    await withdrawRequest.save();

    return {
      success: true,
      message: 'messages.withdeaw_payed',
    };
  }

  async rejectWithdrawRequest(requestId: string) {
    const withdrawRequest = await this.withdrawRequestModel.findById(requestId);
    if (!withdrawRequest) {
      throw new NotFoundException('request_not_found');
    }

    if (withdrawRequest.status != WithdrawRequestStatus.INPROGRESS) {
      throw new ForbiddenException('errors.withdraw_request_no_available');
    }

    withdrawRequest.status = WithdrawRequestStatus.REJECTED;
    await withdrawRequest.save();

    return {
      success: true,
      message: 'messages.withdeaw_rejected',
    };
  }
}
