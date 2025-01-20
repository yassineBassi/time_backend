import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createReservationDTO } from './dto/create-reservation.dto';
import { Client } from 'src/mongoose/client';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store } from 'src/mongoose/store';
import { ReservationItem } from 'src/mongoose/reservation-item';
import { Reservation } from 'src/mongoose/reservation';
import { Service } from 'src/mongoose/service';
import { ReservationStatus } from 'src/common/models/enums/reservation-status';
import { User } from 'src/mongoose/user';
import { UserType } from 'src/common/models/enums/user-type';
import { StoreReview } from 'src/mongoose/store-review';
import { StoreReport } from 'src/mongoose/store-report';
import { Coupon } from 'src/mongoose/coupon';
import { CouponService } from '../coupon/coupon.service';

@Injectable()
export class ReservationService {
  constructor(
    @InjectModel('Store')
    private readonly storeModel: Model<Store>,
    @InjectModel('ReservationItem')
    private readonly reservationItemModel: Model<ReservationItem>,
    @InjectModel('Reservation')
    private readonly reservationModel: Model<Reservation>,
    @InjectModel('Service')
    private readonly serviceModel: Model<Service>,
    @InjectModel('StoreReview')
    private readonly storeReviewModel: Model<StoreReview>,
    @InjectModel('StoreReport')
    private readonly storeReportModel: Model<StoreReport>,
    @InjectModel('Coupon')
    private readonly couponModel: Model<Coupon>,
    @Inject()
    private readonly couponService: CouponService,
  ) {}

  private async generateRandomReservation(length: number) {
    const characters = '0123456789';

    let result = '';
    let exists = false;

    do {
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
      }

      exists = !!(await this.reservationModel.countDocuments({
        number: result,
      }));
    } while (exists);

    return result;
  }

  async createReservation(request: createReservationDTO, client: Client) {
    const store = await this.storeModel.findById(request.storeId);

    // check if there are reservations in the wanted time
    const count = await this.reservationModel.countDocuments({
      store: store.id,
      status: ReservationStatus.PAYED,
      reservationDate: request.reservationDate,
    });

    if (count) {
      throw new BadRequestException('messages.reservation_date_booked');
    }

    let reservation = await this.reservationModel.create({
      store: store.id,
      client: client.id,
      reservationDate: request.reservationDate,
      tva: request.tva,
      totalPrice: request.totalPrice,
      number: await this.generateRandomReservation(10),
    });

    reservation = await reservation.save();

    const items = [];
    let price = 0;

    for (const item of request.items) {
      const service = await this.serviceModel.findById(item.serviceId);
      const reservationItem = await (
        await this.reservationItemModel.create({
          service: service.id,
          price: service.price - (service.price * service.discount) / 100,
          quantity: item.quantity,
          duration: service.duration,
          reservation: reservation.id,
        })
      ).save();
      price += reservationItem.price * reservationItem.quantity;
      items.push(reservationItem.id);
    }

    reservation.totalPrice = price;
    reservation.items = items;
    reservation = await reservation.save();

    return reservation;
  }

  async fetchReservation(user: User, tab: string) {
    const filter = {};

    if (tab.split('ReservationTab.')[1] == 'completed') {
      filter['status'] = {
        $in: [
          ReservationStatus.COMPLETED,
          ReservationStatus.CANCELED,
          ReservationStatus.REJECTED,
        ],
      };
    } else {
      filter['status'] = ReservationStatus.PAYED;
    }

    if (user.type == UserType.STORE) {
      filter['store'] = user.id;
    } else {
      filter['client'] = user.id;
    }

    const reservations: any = await this.reservationModel
      .find(filter)
      .populate([
        {
          path: 'store',
          select: '_id storeName picture isVerified geoLocation',
          populate: {
            path: 'category',
            select: 'name section',
            populate: {
              path: 'section',
              select: '_id name',
            },
          },
        },
        {
          path: 'items',
          select: '_id service quantity',
          populate: {
            path: 'service',
            select: 'title',
          },
        },
      ])
      .sort({
        updatedAt: -1,
      });

    if (user.type == UserType.CLIENT) {
      for (let i = 0; i < reservations.length; i++) {
        reservations[i] = await {
          ...reservations[i].toObject(),
          isReviewSubmitted:
            (await this.storeReviewModel.countDocuments({
              store: reservations[i].store,
              client: user.id,
            })) != 0,
          isReported:
            (await this.storeReportModel.countDocuments({
              reservation: reservations[i].id,
              client: user.id,
            })) != 0,
        };
      }
    }

    return reservations;
  }

  async cancelReservation(user: Client, reservationId: string) {
    const reservation = await this.reservationModel.findById(reservationId);

    if (!reservation) {
      throw new NotFoundException();
    }
    if (reservation.client.toString() != user.id) {
      throw new ForbiddenException();
    }

    const currentDate = new Date().getTime();
    const oneDayTime = 1000 * 3600 * 24;

    if (currentDate > reservation.reservationDate.getTime() - oneDayTime) {
      throw new BadRequestException('messages.cancel_reservation_date_passed');
    }

    reservation.status = ReservationStatus.CANCELED;

    return await reservation.save();
  }

  async payReservation(user: Client, reservationId: string, couponId: string) {
    const reservation = await this.reservationModel
      .findById(reservationId)
      .populate('items');
    const coupon = await this.couponModel.findById(couponId);

    if (!coupon || !reservation) {
      throw new ForbiddenException();
    }

    await this.couponService.validateCoupon(coupon.code, user);

    const totalPrice = reservation.items
      .map((i: any) => i.price * i.quantity)
      .reduce((acc, curr) => acc + curr);

    const couponPrice =
      coupon.discount > totalPrice ? totalPrice : coupon.discount;

    const payedPrice = totalPrice - couponPrice;

    if (payedPrice) {
      throw new BadRequestException();
    }

    reservation.status = ReservationStatus.PAYED;
    reservation.payedPrice = payedPrice;
    reservation.coupon = coupon.id;
    await reservation.save();

    coupon.discount -= totalPrice;
    await coupon.save();

    return {
      success: true,
    };
  }
}
