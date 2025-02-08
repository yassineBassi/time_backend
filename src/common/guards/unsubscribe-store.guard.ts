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
export class UnSubscribedStoreGuard implements CanActivate {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const user = context.switchToHttp().getRequest().user;

    if (!user) {
      console.log('subscription guard: cannot find the authenticated user');
      throw new UnauthorizedException('errors.authenticated_not_found');
    }

    if (
      user.type == UserType.STORE &&
      (await this.subscriptionService.checkStoreSubscription(user))
    ) {
      throw new ForbiddenException({
        message: 'errors.1002',
        code: 1002,
        //statusCode: 403,
      });
    }

    return true;
  }
}
