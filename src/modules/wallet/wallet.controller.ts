import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Response } from 'src/common/response';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user';
import { User } from 'src/mongoose/user';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserType } from 'src/common/models/enums/user-type';
import { Store } from 'src/mongoose/store';
import { SubscribedStoreGuard } from 'src/common/guards/subscribed-store.guard';
import { DashboardFilterQuery } from 'src/common/models/dahsboard-filter-query';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('my-wallet')
  @UseGuards(JwtAuthGuard, SubscribedStoreGuard)
  async getMyWallet(@CurrentUser() user: User) {
    return Response.success(await this.walletService.getMyWallet(user));
  }

  @Post('transfer')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.CLIENT))
  async transferPoints(
    @CurrentUser() user: User,
    @Body('points') points: number,
  ) {
    return Response.success(
      await this.walletService.transferPoints(user, points),
    );
  }

  @Get('withdraw-requests')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async getWithdrawRequests(@Query() query: DashboardFilterQuery) {
    return Response.success(
      await this.walletService.getWithdrawRequests(query),
    );
  }

  @Post('request-withdraw')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.STORE), SubscribedStoreGuard)
  async requestWithdraw(
    @CurrentUser() user: Store,
    @Body('amount') amount: number,
  ) {
    return Response.success(
      await this.walletService.requestWithdraw(user, amount),
    );
  }

  @Post('withdraw-request/accept/:id')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async acceptWithdrawRequest(@Param('id') requestId: string) {
    return Response.success(
      await this.walletService.acceptWithdrawRequest(requestId),
    );
  }

  @Post('withdraw-request/reject/:id')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async rejectWithdrawRequest(@Param('id') requestId: string) {
    return Response.success(
      await this.walletService.rejectWithdrawRequest(requestId),
    );
  }
}
