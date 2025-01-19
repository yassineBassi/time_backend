import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { Response } from 'src/common/response';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user';
import { User } from 'src/mongoose/user';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('validate/:code')
  @UseGuards(JwtAuthGuard)
  async validateCoupon(@Param('code') code: string, @CurrentUser() user: User){
    return Response.success(await this.couponService.validateCoupon(code, user));
  }
}
