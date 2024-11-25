import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  mixin,
  Type,
  UnauthorizedException,
} from '@nestjs/common';
import { UserType } from '../models/enums/user-type';

export const RolesGuard = (role: UserType): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    async canActivate(context: ExecutionContext) {
      const user = context.switchToHttp().getRequest().user;

      if (!user) {
        console.log('roles guard: cannot find the authenticated user');
        throw new UnauthorizedException('errors.authenticated_not_found');
      }

      if (user.type.trim() != role.trim()) {
        throw new ForbiddenException('errors.forbiedden_role');
      }

      return true;
    }
  }

  return mixin(RoleGuardMixin);
};
