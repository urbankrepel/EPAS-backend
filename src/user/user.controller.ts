import { Controller, Get } from '@nestjs/common';
import { Roles } from 'src/roles/roles.decorator';
import { RolesEnum } from 'src/roles/roles.enum';
import { RequestService } from './request.service';

@Controller('user')
export class UserController {
  constructor(private readonly requestService: RequestService) {}

  @Get()
  getUser() {
    const client = this.requestService.getClient();
    return client.api('/me').get();
  }

  @Get('test')
  @Roles(RolesEnum.ADMIN, RolesEnum.VODJA)
  test() {
    return ' test';
  }
}
