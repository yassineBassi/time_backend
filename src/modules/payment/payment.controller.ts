import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Response } from 'src/common/response';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post(':id')
  async callback(@Body() request: string) {
    return Response.success(await this.paymentService.callback(request));
  }
}
