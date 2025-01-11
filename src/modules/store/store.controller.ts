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

  @Get('')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.CLIENT))
  async getStores(@Query() params: any) {
    return Response.success(await this.storeService.getStores(params));
  }

  @Get('map')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.CLIENT))
  async getMapStores(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
  ) {
    return Response.success(
      await this.storeService.getMapStores(latitude, longitude),
    );
  }
}
