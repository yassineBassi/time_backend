import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  mixin,
  Type,
  UnauthorizedException,
} from '@nestjs/common';
import { UserType } from '../models/enums/user-type';
import { logger } from '../winston-logger';

export const RolesGuard = (role: UserType): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    async canActivate(context: ExecutionContext) {
      const user = context.switchToHttp().getRequest().user;

      if (!user) {
        console.log('roles guard: cannot find the authenticated user');
        throw new UnauthorizedException('errors.authenticated_not_found');
      }

      if (user.type.trim() != role.trim()) {
        logger.info('required role ' + role);
        logger.info('user role ' + user.type);
        throw new ForbiddenException('errors.forbiedden_role');
      }

      return true;
    }
  }

  return mixin(RoleGuardMixin);
};
