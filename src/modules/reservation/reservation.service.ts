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
import { UserStatus } from 'src/common/models/enums/user-status';
import { TransactionType } from 'src/common/models/enums/transaction-type';
import { Transaction } from 'src/common/models/transaction';
import { Cron } from '@nestjs/schedule';
import { logger } from 'src/common/winston-logger';
import { I18nService } from 'nestjs-i18n';
import { NotificationType } from 'src/common/models/enums/notification-type';
import { NotificationReference } from 'src/common/models/enums/notification-reference';
import { FirebaseAdminService } from '../firebase-admin/firebase-admin.service';
import { Notification } from 'src/mongoose/notification';
const moment = require('moment');

@Injectable()
export class ReservationService {
  constructor(
    @InjectModel('Store')
    private readonly storeModel: Model<Store>,
    @InjectModel('Client')
    private readonly clientModel: Model<Client>,
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
    @InjectModel('Notification')
    private readonly notificationModel: Model<Notification>,
    @Inject()
    private readonly couponService: CouponService,
    private readonly i18n: I18nService,
    private firebaseAdminService: FirebaseAdminService,
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

    // check if store enable and available

    if (!store.available) {
      throw new ForbiddenException('messages.store_unavailable');
    }

    if (store.status != UserStatus.ENABLED) {
      throw new ForbiddenException('messages.store_not_exist_any_more');
    }

    // check if there are reservations in the wanted time
    const count = await this.reservationModel
      .countDocuments({
        store: store.id,
        status: ReservationStatus.PAYED,
        reservationStartDate: {
          $lt: request.reservationDate,
        },
        reservationEndDate: {
          $gt: request.reservationDate,
        },
      })
      .populate('items');

    if (count) {
      throw new BadRequestException('messages.reservation_date_booked');
    }

    // check if selected time is in the available times

    let reservation = await this.reservationModel.create({
      store: store.id,
      client: client.id,
      reservationDate: request.reservationDate,
      reservationStartDate: request.reservationDate,
      tva: request.tva,
      totalPrice: request.totalPrice,
      number: await this.generateRandomReservation(10),
      clientAddress: client.address,
      clientPhoneNumber: client.phoneNumber,
    });

    reservation = await reservation.save();

    const items = [];
    let price = 0;
    let duration = 0;

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
      duration += reservationItem.duration;
      items.push(reservationItem.id);
    }

    reservation.reservationEndDate = new Date(
      reservation.reservationStartDate.getTime() + duration,
    );
    reservation.totalPrice = price;
    reservation.items = items;
    reservation = await reservation.save();

    return reservation;
  }

  async fetchReservations(user: User, tab: string) {
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
          select: '_id service quantity price',
          populate: {
            path: 'service',
            select: 'title',
          },
        },
        {
          path: 'client',
          select: '_id fullName picture type',
        },
      ])
      .sort({
        reservationDate: 1,
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

  async fetchReservation(user: User, id: string) {
    const reservations: any = await this.reservationModel
      .findOne({
        _id: id,
        store: user.id,
      })
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
          select: '_id service quantity price',
          populate: {
            path: 'service',
            select: 'title',
          },
        },
        {
          path: 'client',
          select: '_id fullName picture type',
        },
      ]);

    return reservations;
  }

  async cancelReservation(user: Client, reservationId: string) {
    let reservation = await this.reservationModel.findById(reservationId);

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
    reservation.canceledAt = new Date();

    reservation = await reservation.save();

    const store = await this.storeModel.findById(reservation.store);
    await this.sendCancelReservationNotification(store, reservation);

    return reservation;
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
    reservation.clientAddress = user.address;
    reservation.clientPhoneNumber = user.phoneNumber;
    await reservation.save();

    coupon.discount -= totalPrice;
    await coupon.save();

    return {
      success: true,
    };
  }

  async statistics(user: Store, date: string) {
    const completedFilter = {
      store: user.id,
      status: ReservationStatus.COMPLETED,
    };
    const canceledFilter = {
      store: user.id,
      status: {
        $in: [ReservationStatus.REJECTED, ReservationStatus.CANCELED],
      },
    };
    const inProgressFilter = {
      store: user.id,
      status: ReservationStatus.PAYED,
    };

    if (date && date.length) {
      date = date.split(' ')[0];
      const minDate = new Date(date + ' 00:00:00.000Z');
      const maxDate = new Date(date + ' 23:59:59.000Z');

      completedFilter['reservationDate'] = {
        $gt: minDate,
        $lt: maxDate,
      };

      canceledFilter['canceledAt'] = {
        $gt: minDate,
        $lt: maxDate,
      };

      /*
      inProgressFilter['canceledAt'] = {
        $gt: minDate,
        $lt: maxDate,
      };
      */
    }

    return {
      inProgress: await this.reservationModel.countDocuments(inProgressFilter),
      completed: await this.reservationModel.countDocuments(completedFilter),
      canceled: await this.reservationModel.countDocuments(canceledFilter),
    };
  }

  reservationsToTransactions(reservations: Reservation[]): Transaction[] {
    const transactions: Transaction[] = [];

    if (reservations && reservations.length) {
      for (const r of reservations) {
        for (const i of r.items) {
          const item: any = i;
          transactions.push({
            _id: item.id,
            label: item.service.title,
            price: item.price * item.quantity,
            points: item.price * item.quantity,
            number: r.number,
            type: TransactionType.RESERVATION,
            date: new Date((r as any).createdAt),
          });
        }
      }
    }

    return transactions;
  }

  async transactions(store: Store) {
    const reservations = await this.reservationModel
      .find({
        store: store.id,
        status: ReservationStatus.COMPLETED,
      })
      .populate({
        path: 'items',
        populate: 'service',
      });

    const transactions: Transaction[] =
      this.reservationsToTransactions(reservations);

    return transactions;
  }

  async getReservationsByDate(user: Store, date: Date) {
    const startDate = new Date(
      date.toString().split(' ')[0] + ' 00:00:00.000Z',
    );
    const endDate = new Date(date.toString().split(' ')[0] + ' 23:59:59.000Z');

    const reservations = await this.reservationModel
      .find({
        store: user.id,
        status: ReservationStatus.PAYED,
        reservationDate: {
          $gt: startDate,
          $lt: endDate,
        },
      })
      .populate([
        {
          path: 'client',
          select: '_id fullName picture type',
        },
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
          select: '_id service quantity price',
          populate: {
            path: 'service',
            select: 'title',
          },
        },
      ]);

    console.log(reservations);

    return reservations;
  }

  @Cron('*/1 * * * *')
  async completeReservationsCron() {
    let currentDate = new Date();
    // add timezone
    currentDate = new Date(
      currentDate.getTime() + currentDate.getTimezoneOffset() * 60 * 1000 * -1,
    );

    const result = await this.reservationModel.updateMany(
      {
        status: ReservationStatus.PAYED,
        reservationDate: {
          $lt: currentDate,
        },
      },
      {
        status: ReservationStatus.COMPLETED,
      },
    );
    logger.info(
      'update reservations status to completed (current date : ' +
        new Date().toString() +
        ', update result : ' +
        JSON.stringify(result) +
        ' )',
    );
  }

  @Cron('*/1 * * * *')
  async ReservationRminderCron() {
    let currentDate = new Date();
    // add timezone
    currentDate = new Date(
      currentDate.getTime() + currentDate.getTimezoneOffset() * 60 * 1000 * -1,
    );

    // before 1h reminder
    let reservations = await this.reservationModel
      .find({
        status: ReservationStatus.PAYED,
        notifiedBefore1h: false,
        reservationDate: {
          $lt: new Date(currentDate.getTime() + 1000 * 60 * 60),
        },
      })
      .select('_id client reservationDate');

    if (reservations.length) {
      for (const reservation of reservations) {
        const client = await this.clientModel.findById(reservation.client);
        this.sendReservationReminderNotification(client, reservation, '1h');
      }
      await this.reservationModel.updateMany(
        {
          _id: {
            $in: reservations.map((r) => r.id),
          },
        },
        {
          notifiedBefore1h: true,
          notifiedBefore24h: true,
        },
      );
    }

    // before 24h reminder
    const dateAfter24h = new Date(currentDate.getTime() + 1000 * 60 * 60 * 24);
    const endOfDay = new Date(
      moment().endOf('day').toDate().getTime() +
        currentDate.getTimezoneOffset() * 60 * 1000 * -1,
    );

    reservations = await this.reservationModel
      .find({
        status: ReservationStatus.PAYED,
        notifiedBefore24h: false,
        reservationDate: {
          $lt: dateAfter24h,
          $gt: endOfDay,
        },
      })
      .select('_id client reservationDate');

    if (reservations.length) {
      for (const reservation of reservations) {
        const client = await this.clientModel.findById(reservation.client);
        this.sendReservationReminderNotification(client, reservation, '24h');
      }
      await this.reservationModel.updateMany(
        {
          _id: {
            $in: reservations.map((r) => r.id),
          },
        },
        {
          notifiedBefore24h: true,
        },
      );
    }
  }

  async handleReservationCallback(
    metadata: any,
    tapPaymentId: any,
    amount: number,
  ) {
    const reservation = await this.reservationModel.findById(metadata.id);
    reservation.status = ReservationStatus.PAYED;
    reservation.payment = tapPaymentId;

    if (metadata.coupon) {
      const coupon = await this.couponModel.findById(metadata.coupon);
      reservation.coupon = coupon.id;
      coupon.consumed = true;
      await coupon.save();
    }

    reservation.payedPrice = amount;
    await reservation.save();

    const store = await this.storeModel.findById(reservation.store);
    await this.sendNewReservationNotification(store, reservation);

    return true;
  }

  async sendNewReservationNotification(store: Store, reservation: Reservation) {
    const notification = await (
      await this.notificationModel.create({
        title: this.i18n.translate(
          'messages.notification_' +
            NotificationType.NEW_RESERVATION +
            '_title',
        ),
        description:
          this.i18n.translate(
            'messages.notification_' +
              NotificationType.NEW_RESERVATION +
              '_description',
          ) +
          ' ' +
          reservation.reservationDate
            .toISOString()
            .split('T')
            .join(' ')
            .slice(0, -8)
            .split(' ')
            .reverse()
            .join(' '),
        type: NotificationType.NEW_RESERVATION,
        referenceType: NotificationReference.RESERVATION,
        reference: reservation.id,
        receiverType: UserType.STORE,
        receiver: store.id,
      })
    ).save();

    this.firebaseAdminService.sendNotification(
      store.notificationToken,
      notification,
    );
  }

  async sendReservationReminderNotification(
    client: Client,
    reservation: Reservation,
    reminderTime: string,
  ) {
    const notification = await (
      await this.notificationModel.create({
        title: this.i18n.translate(
          'messages.notification_' +
            NotificationType.RESERVATION_REMINDER +
            '_' +
            reminderTime +
            '_title',
        ),
        description:
          this.i18n.translate(
            'messages.notification_' +
              NotificationType.RESERVATION_REMINDER +
              '_' +
              reminderTime +
              '_description',
          ) +
          (reminderTime == '24h'
            ? ' ' +
              reservation.reservationDate
                .toISOString()
                .split('T')[1]
                .slice(0, -8)
            : ''),

        type: NotificationType.RESERVATION_REMINDER,
        referenceType: NotificationReference.RESERVATION,
        reference: reservation.id,
        receiverType: UserType.CLIENT,
        receiver: client.id,
      })
    ).save();

    this.firebaseAdminService.sendNotification(
      client.notificationToken,
      notification,
    );
  }

  async sendCancelReservationNotification(
    store: Store,
    reservation: Reservation,
  ) {
    const notification = await (
      await this.notificationModel.create({
        title: this.i18n.translate(
          'messages.notification_' +
            NotificationType.CANCEL_RESERVATION +
            '_title',
        ),
        description:
          this.i18n.translate(
            'messages.notification_' +
              NotificationType.CANCEL_RESERVATION +
              '_description',
          ) +
          ' ' +
          reservation.reservationDate
            .toISOString()
            .split('T')
            .join(' ')
            .slice(0, -8)
            .split(' ')
            .reverse()
            .join(' '),

        type: NotificationType.CANCEL_RESERVATION,
        referenceType: NotificationReference.RESERVATION,
        reference: reservation.id,
        receiverType: UserType.STORE,
        receiver: store.id,
      })
    ).save();

    this.firebaseAdminService.sendNotification(
      store.notificationToken,
      notification,
    );
  }
}
