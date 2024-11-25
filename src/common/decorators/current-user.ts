import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  async (data: string, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest().user;

    const result = data ? user[data] : user;

    return result; // extract a specific property only if specified or get a user object
  },
);
