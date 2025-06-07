/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const request: Request = context.switchToHttp().getRequest<Request>();
    const user = request.user ? request.user : null;
    if (!user) {
      throw new ForbiddenException('User not found');
    }
    const role = user.role ? user.role : 'employee';
    if (role !== 'admin') {
      throw new ForbiddenException('You do not have permission (roles)');
    }

    return true;
  }
}
