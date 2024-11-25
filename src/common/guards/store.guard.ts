import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from 'src/modules/auth/auth.service';
import { UserType } from '../models/enums/user-type';

@Injectable()
export class StoreGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1]; // Extract the Bearer token

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // Validate the token and retrieve the user
    const user = await this.authService.validateToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    // Check if the user type is 'store'
    if (user.type !== UserType.STORE) {
      throw new UnauthorizedException('Access denied. User is not a store.');
    }

    // Attach the user to the request for further use
    request.user = user;
    return true;
  }
}
