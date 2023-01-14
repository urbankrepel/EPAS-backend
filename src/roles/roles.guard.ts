import {
  CanActivate,
  ExecutionContext,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ContextIdFactory, ModuleRef, Reflector } from '@nestjs/core';
import { RequestService } from 'src/user/request.service';
import { UserService } from 'src/user/user.service';
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
      const role = request.body.role;
      return roles.includes(role);
    } catch (error) {
      return false;
    }
  }
}
