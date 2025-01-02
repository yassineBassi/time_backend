import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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
    console.log('current user', user);
    return Response.success(await this.subscriptionService.getTypes(), '');
  }

  @Get('levels')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.STORE), UnSubscribedStoreGuard)
  async getLevels() {
    return Response.success(await this.subscriptionService.getLevels(), '');
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
