import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Response } from 'src/common/response';
import { createReservationDTO } from './dto/create-reservation.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserType } from 'src/common/models/enums/user-type';
import { CurrentUser } from 'src/common/decorators/current-user';
import { Client } from 'src/mongoose/client';
import { User } from 'src/mongoose/user';
import { Store } from 'src/mongoose/store';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post('')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.CLIENT))
  async createReservation(
    @Body() request: createReservationDTO,
    @CurrentUser() client: Client,
  ) {
    return Response.success(
      await this.reservationService.createReservation(request, client),
    );
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  async fetchReservations(
    @CurrentUser() user: User,
    @Query('tab') tab: string,
  ) {
    return Response.success(
      await this.reservationService.fetchReservations(user, tab),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.STORE))
  async fetchReservation(@CurrentUser() user: User, @Param('id') id: string) {
    return Response.success(
      await this.reservationService.fetchReservation(user, id),
    );
  }

  @Get('cancel/:id')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.CLIENT))
  async cancelReservation(
    @CurrentUser() user: Client,
    @Param('id') reservationId: string,
  ) {
    return Response.success(
      await this.reservationService.cancelReservation(user, reservationId),
    );
  }

  @Post('pay')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.CLIENT))
  async payReservation(
    @CurrentUser() user: Client,
    @Body('reservationId') reservationId: string,
    @Body('couponId') couponId: string,
  ) {
    return Response.success(
      await this.reservationService.payReservation(
        user,
        reservationId,
        couponId,
      ),
    );
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.STORE))
  async statistics(@CurrentUser() user: Store, @Query('date') date: string) {
    return Response.success(
      await this.reservationService.statistics(user, date),
    );
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.STORE))
  async transactions(@CurrentUser() user: Store) {
    return Response.success(await this.reservationService.transactions(user));
  }

  @Get('by-date')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.STORE))
  async getReservationsByDate(
    @CurrentUser() user: Store,
    @Query('date') date: Date,
  ) {
    return Response.success(
      await this.reservationService.getReservationsByDate(user, date),
    );
  }
}
