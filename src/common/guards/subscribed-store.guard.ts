import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SubscriptionService } from 'src/modules/subscription/subscription.service';

@Injectable()
export class SubscribedStoreGuard implements CanActivate {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const user = context.switchToHttp().getRequest().user;

    if (!user) {
      console.log('subscription guard: cannot find the authenticated user');
      throw new UnauthorizedException('errors.authenticated_not_found');
    }

    if (await !this.subscriptionService.checkStoreSubscription(user)) {
      throw new ForbiddenException('errors.1001');
    }

    return true;
  }
}
