import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ClientService } from './client.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserType } from 'src/common/models/enums/user-type';
import { CurrentUser } from 'src/common/decorators/current-user';
import { Response } from 'src/common/response';
import { Client } from 'src/mongoose/client';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post('favorite/:id')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.CLIENT))
  async toggleFavorite(
    @Param('id') storeId: string,
    @CurrentUser() client: Client,
  ) {
    return Response.success(
      await this.clientService.toggleFavorite(storeId, client),
    );
  }

  @Get('favorites')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.CLIENT))
  async getFavorites(
    @CurrentUser() client: Client,
  ) {
    return Response.success(
      await this.clientService.getFavorites(client),
    );
  }
}
