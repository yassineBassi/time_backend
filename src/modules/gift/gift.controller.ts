import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { GiftService } from './gift.service';
import { Response } from 'src/common/response';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user';
import { User } from 'src/mongoose/user';

@Controller('gift')
export class GiftController {
  constructor(private readonly giftService: GiftService) {}

  @Get('cards')
  @UseGuards(JwtAuthGuard)
  async getGiftCards() {
    return Response.success(await this.giftService.getGiftCards());
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  async getGifts(@CurrentUser() user: User) {
    return Response.success(await this.giftService.getGifts(user));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async fetchGift(@Param('id') giftId: string, @CurrentUser() user: User){
    return Response.success(await this.giftService.fetchGift(giftId, user));
  }

  @Post(':id')
  @UseGuards(JwtAuthGuard)
  async createGiftCard(
    @Param('id') giftCardId: string,
    @CurrentUser() user: User,
  ) {
    return Response.success(
      await this.giftService.createGiftCard(giftCardId, user),
    );
  }
}
