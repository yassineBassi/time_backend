import { Controller, Get, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Response } from 'src/common/response';
import { CurrentUser } from 'src/common/decorators/current-user';
import { User } from 'src/mongoose/user';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  async getNotifications(@CurrentUser() user: User) {
    return Response.success(
      await this.notificationService.getNotifications(user),
    );
  }
}
