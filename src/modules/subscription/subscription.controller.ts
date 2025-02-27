import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Response } from 'src/common/response';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserType } from 'src/common/models/enums/user-type';
import { UnSubscribedStoreGuard } from 'src/common/guards/unsubscribe-store.guard';
import { Store } from 'src/mongoose/store';
import { SubscribedStoreGuard } from 'src/common/guards/subscribed-store.guard';
import { DashboardFilterQuery } from 'src/common/models/dahsboard-filter-query';
import { CreateSubscriptionLevelDTO } from './dto/create-subscription-level.dto';
import { UpdateSubscriptionLevelDTO } from './dto/update-subscription-level.dto';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('my-subscription')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.STORE), SubscribedStoreGuard)
  async getMySubscription(@CurrentUser() CurrentUser: Store) {
    return Response.success(
      await this.subscriptionService.getMySubscription(CurrentUser),
      '',
    );
  }

  @Get('types')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.STORE), UnSubscribedStoreGuard)
  async getTypes(@CurrentUser() user: any) {
    return Response.success(await this.subscriptionService.getTypes(), '');
  }

  @Get('levels')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.STORE))
  async getLevels() {
    return Response.success(await this.subscriptionService.getLevels(), '');
  }

  @Post('levels')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async createLevel(@Body() request: CreateSubscriptionLevelDTO) {
    return Response.success(
      await this.subscriptionService.createLevel(request),
    );
  }

  @Post('levels/update')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async updateLevel(@Body() request: UpdateSubscriptionLevelDTO) {
    return Response.success(
      await this.subscriptionService.updateLevel(request),
    );
  }

  @Get('levels/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async getLevelsInDashboard(@Query() query: DashboardFilterQuery) {
    return Response.success(
      await this.subscriptionService.getLevelsInDashboard(query),
    );
  }

  @Get('levels/:id')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async getLevel(@Param('id') levelId: string) {
    return Response.success(await this.subscriptionService.getLevel(levelId));
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.STORE), SubscribedStoreGuard)
  async cancelSubscription(@CurrentUser() store: Store) {
    return Response.success(
      await this.subscriptionService.cancelSubscription(store),
      '',
    );
  }
}
