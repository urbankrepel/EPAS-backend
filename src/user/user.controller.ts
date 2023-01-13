import { Controller, Get } from '@nestjs/common';
import { RequestService } from './request.service';

@Controller('user')
export class UserController {
  constructor(private readonly requestService: RequestService) {}

  @Get()
  getUser() {
    const client = this.requestService.getClient();
    return client.api('/me').get();
  }
}
