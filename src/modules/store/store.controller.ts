import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'src/common/response';
import { StoreService } from './store.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserType } from 'src/common/models/enums/user-type';
import { SubscribedStoreGuard } from 'src/common/guards/subscribed-store.guard';
import { CurrentUser } from 'src/common/decorators/current-user';
import { Store } from 'src/mongoose/store';
import { StoresListSegment } from 'src/common/models/enums/stores-list-segement';
import { Client } from 'src/mongoose/client';
import { RateStoreDTO } from './dto/rate-store.sto';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get('sections')
  async getSections() {
    return Response.success(await this.storeService.getSections(), '');
  }

  @Get('categories')
  async getCategories(@Query('sectionId') sectionId: string) {
    return Response.success(
      await this.storeService.getCategories(sectionId),
      '',
    );
  }

  @Post('working-days')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.STORE), SubscribedStoreGuard)
  async saveWorkingDays(@Body() request: any, @CurrentUser() store: Store) {
    return Response.success(
      await this.storeService.saveWorkingDays(request, store),
    );
  }

  @Get('working-days')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.STORE), SubscribedStoreGuard)
  async getWorkingDays(@CurrentUser() store: Store) {
    return Response.success(await this.storeService.getWorkingDays(store));
  }

  @Get('bySegment')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.CLIENT))
  async getStoresBySegment(
    @Query('segment') segment: StoresListSegment,
    @CurrentUser() client: Client,
  ) {
    return Response.success(
      await this.storeService.getStoresBySegment(segment, client),
    );
  }

  @Get('with-segments')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.CLIENT))
  async getStoresWithSegments(@CurrentUser() client: Client) {
    return Response.success(
      await this.storeService.getStoresWithSegments(client),
    );
  }

  @Get('')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.CLIENT))
  async getStores(@Query() params: any, @CurrentUser() client: Client) {
    return Response.success(await this.storeService.getStores(params, client));
  }

  @Get('map')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.CLIENT))
  async getMapStores(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @CurrentUser() client: Client,
  ) {
    return Response.success(
      await this.storeService.getMapStores(latitude, longitude, client),
    );
  }

  @Get('available-times')
  async getStoreAvailableTimes(
    @Query('date') date: string,
    @Query('storeId') storeId: string,
  ) {
    return Response.success(
      await this.storeService.getStoreAvailableTimes(date, storeId),
    );
  }

  @Get('comments')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.CLIENT))
  async getStoreComments(@Query('storeId') storeId: string) {
    return Response.success(await this.storeService.getStoreComments(storeId));
  }

  @Post('toggle-availability')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.STORE))
  async toggleAvailablity(@CurrentUser() store: Store) {
    return Response.success(await this.storeService.toggleAvailablity(store));
  }

  @Get('availability')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.STORE))
  async fetchAvailability(@CurrentUser() store: Store) {
    return Response.success(await this.storeService.fetchAvailability(store));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.CLIENT))
  async getStoreById(@Param('id') id: string, @CurrentUser() client: Client) {
    return Response.success(await this.storeService.getStoreById(id, client));
  }

  @Post(':id/rate')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.CLIENT))
  async rateStore(
    @Body() request: RateStoreDTO,
    @Param('id') storeId: string,
    @CurrentUser() client: Client,
  ) {
    return Response.success(
      await this.storeService.rateStore(request, storeId, client),
    );
  }

  @Post(':id/report')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.CLIENT))
  async reportStore(
    @Body('message') message: string,
    @Param('id') reservationId: string,
    @CurrentUser() client: Client,
  ) {
    return Response.success(
      await this.storeService.reportStore(message, reservationId, client),
    );
  }
}
