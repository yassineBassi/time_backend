import {
  BadRequestException,
  ForbiddenException,
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
import { populate } from 'dotenv';

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
      number: this.generateRandomReservation(10),
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
    });

    reservation = await reservation.save();

    const items = [];

    for (const item of request.items) {
      const service = await this.serviceModel.findById(item.serviceId);
      const reservationItem = await (
        await this.reservationItemModel.create({
          service: service.id,
          price: (service.price * service.discount) / 100,
          quantity: item.quantity,
          duration: service.duration,
          reservation: reservation.id,
        })
      ).save();
      items.push(reservationItem.id);
    }

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

    const reservations = await this.reservationModel
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

    if (
      (reservation as any).createdAt.getTime() + 1000 * 3600 * 24 <
      new Date().getTime() 
    ) {
      throw new BadRequestException('messages.cancel_reservation_date_passed');
    }

    reservation.status = ReservationStatus.CANCELED;

    return await reservation.save();
  }
}
