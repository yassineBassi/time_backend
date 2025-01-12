import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientSchema } from 'src/mongoose/client';
import { StoreSchema } from 'src/mongoose/store';
import { ServiceSchema } from 'src/mongoose/service';
import { ReservationSchema } from 'src/mongoose/reservation';
import { ReservationItemSchema } from 'src/mongoose/reservation-item';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Store', schema: StoreSchema },
      { name: 'Service', schema: ServiceSchema },
      { name: 'Reservation', schema: ReservationSchema },
      { name: 'ReservationItem', schema: ReservationItemSchema },
    ]),
  ],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}
