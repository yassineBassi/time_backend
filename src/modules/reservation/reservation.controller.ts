import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Response } from 'src/common/response';
import { createReservationDTO } from './dto/create-reservation.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserType } from 'src/common/models/enums/user-type';
import { CurrentUser } from 'src/common/decorators/current-user';
import { Client } from 'src/mongoose/client';
import { User } from 'src/mongoose/user';

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
  async fetchReservation(@CurrentUser() user: User, @Query('tab') tab: string) {
    return Response.success(
      await this.reservationService.fetchReservation(user, tab),
    );
  }
}
