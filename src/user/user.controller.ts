import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { Roles } from 'src/roles/roles.decorator';
import { RolesEnum } from 'src/roles/roles.enum';
import { ChangeUserRoleDto } from './dto/changeUserRole.dto';
import { GetUserByAzureIdDto } from './dto/getUserByAzureId.dto';
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

  @Get('profilePicture')
  async getProfilePicture(@Res() res: Response) {
    res.setHeader('content-type', 'image/jpeg');
    const picture = await this.userService.getProfilePicture();
    if (picture) {
      return res.send(picture);
    }
    return res.status(404).send("Couldn't find profile picture");
  }

  @Post('changeUserRole')
  @Roles(RolesEnum.ADMIN)
  @HttpCode(200)
  async changeUserRole(@Body() data: ChangeUserRoleDto) {
    return this.userService.changeUserRole(data.azureId, data.role);
  }

  @Post('getByAzureId')
  @HttpCode(200)
  async getUserByAzureId(@Body() data: GetUserByAzureIdDto) {
    const user = await this.userService.getSpecificUser(data.azureId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Get('all')
  @Roles(RolesEnum.ADMIN)
  @HttpCode(200)
  async getAllUsers() {
    return this.userService.getAllUsers();
  }
}
