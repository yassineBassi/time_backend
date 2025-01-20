import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Response } from 'src/common/response';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user';
import { User } from 'src/mongoose/user';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserType } from 'src/common/models/enums/user-type';
import { Store } from 'src/mongoose/store';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('my-wallet')
  @UseGuards(JwtAuthGuard)
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

  @Post('request-withdraw')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.STORE))
  async requestWithdraw(
    @CurrentUser() user: Store,
    @Body('amount') amount: number,
  ) {
    return Response.success(
      await this.walletService.requestWithdraw(user, amount),
    );
  }
}
