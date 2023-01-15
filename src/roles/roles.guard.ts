import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesEnum } from './roles.enum';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const roles = this.reflector.get<RolesEnum[]>(
        'roles',
        context.getHandler(),
      );
      if (!roles) {
        return true;
      }
      const request = context.switchToHttp().getRequest();
      const role = request.role;
      if (!role) return false;
      const rolesIncludeUsers = roles.includes(role);
      if (rolesIncludeUsers === true) {
        return true;
      } else {
        throw new ForbiddenException('You dont have permission to do this');
      }
    } catch (error) {
      throw error;
    }
  }
}
