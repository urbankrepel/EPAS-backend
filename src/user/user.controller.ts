import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { Roles } from 'src/roles/roles.decorator';
import { RolesEnum } from 'src/roles/roles.enum';
import { ChangeUserRoleDto } from './dto/changeUserRole.dto';
import { GetUserByAzureIdDto } from './dto/getUserByAzureId.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUser() {
    return true;
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

  @Roles(RolesEnum.ADMIN)
  @Get('all')
  @HttpCode(200)
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Roles(RolesEnum.DIJAK)
  @Get('code')
  async getCode() {
    return await this.userService.generateUniqueCode();
  }

  @Roles(RolesEnum.DIJAK)
  @Post('joinworkshop')
  @HttpCode(200)
  async joinWorkshop(@Body('workshopId', ParseIntPipe) workshopId: number) {
    return this.userService.joinWorkshop(workshopId);
  }

  @Roles(RolesEnum.DIJAK)
  @Post('leaveworkshop')
  @HttpCode(200)
  async leaveWorkshop(@Body('workshopId', ParseIntPipe) workshopId: number) {
    return this.userService.leaveWorkshop(workshopId);
  }

  @Roles(RolesEnum.DIJAK)
  @Get('joinedworkshops')
  @HttpCode(200)
  async getJoinedWorkshops() {
    return await this.userService.getJoinedWorkshops();
  }

  @Roles(RolesEnum.VODJA)
  @Get('myworkshops')
  @HttpCode(200)
  async getMyWorkshops() {
    return await this.userService.getMyWorkshops();
  }

  @Roles(RolesEnum.VODJA)
  @Post('chech_join_workshop')
  @HttpCode(200)
  async checkJoinWorkshop(
    @Body('workshopId', ParseIntPipe) workshopId: number,
    @Body('userCode') userCode: string,
  ) {}
}
