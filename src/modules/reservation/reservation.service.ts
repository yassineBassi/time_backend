import { Injectable } from '@nestjs/common';
import { createReservationDTO } from './dto/create-reservation.dto';
import { Client } from 'src/mongoose/client';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store } from 'src/mongoose/store';
import { ReservationItem } from 'src/mongoose/reservation-item';
import { Reservation } from 'src/mongoose/reservation';
import { Service } from 'src/mongoose/service';

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

  async createReservation(request: createReservationDTO, client: Client) {
    const store = await this.storeModel.findById(request.storeId);

    let reservation = await this.reservationModel.create({
      store: store.id,
      client: client.id,
      reservationDate: request.reservationDate,
      tva: request.tva,
      totalPrice: request.totalPrice,
    });

    reservation = await reservation.save();

    const reservations = [];

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
      reservations.push(reservationItem.id);
    }

    reservation.reservations = reservations;
    reservation = await reservation.save();

    return reservation;
  }
}
