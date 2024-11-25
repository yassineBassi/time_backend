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

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionService.create(createSubscriptionDto);
  }

  @Get()
  findAll() {
    return this.subscriptionService.findAll();
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionService.update(+id, updateSubscriptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriptionService.remove(+id);
  }
}
