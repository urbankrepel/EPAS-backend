import { Controller, Get } from '@nestjs/common';
import { Roles } from 'src/roles/roles.decorator';
import { RolesEnum } from 'src/roles/roles.enum';
import { RequestService } from './request.service';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly requestService: RequestService,
    private readonly userService: UserService,
  ) {}

  @Get()
  getUser() {
    return this.userService.getUserData();
  }
}
