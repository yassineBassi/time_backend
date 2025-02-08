import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SubscriptionService } from 'src/modules/subscription/subscription.service';
import { UserType } from '../models/enums/user-type';

@Injectable()
export class SubscribedStoreGuard implements CanActivate {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const user = context.switchToHttp().getRequest().user;

    if (!user) {
      throw new UnauthorizedException('errors.authenticated_not_found');
    }

    if (
      user.type == UserType.STORE &&
      !(await this.subscriptionService.checkStoreSubscription(user))
    ) {
      throw new ForbiddenException({
        message: 'errors.1001',
        code: 1001,
        statusCode: 403,
      });
    }

    return true;
  }
}
