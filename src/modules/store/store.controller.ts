import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Response } from 'src/common/response';
import { StoreService } from './store.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserType } from 'src/common/models/enums/user-type';
import { SubscribedStoreGuard } from 'src/common/guards/subscribed-store.guard';
import { CurrentUser } from 'src/common/decorators/current-user';
import { Store } from 'src/mongoose/store';

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
    return Response.success(await this.storeService.saveWorkingDays(request, store));
  }

  @Get('working-days')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.STORE), SubscribedStoreGuard)
  async getWorkingDays(@CurrentUser() store: Store) {
    return Response.success(await this.storeService.getWorkingDays(store));
  }
}
