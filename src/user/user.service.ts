import { ResponseType } from '@microsoft/microsoft-graph-client';
import {
  Injectable,
  forwardRef,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RolesEnum } from 'src/roles/roles.enum';
import { Workshop } from 'src/workshop/entities/workshop.entity';
import { WorkshopService } from 'src/workshop/workshop.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RequestService } from './request.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userReposetory: Repository<User>,
    @Inject(forwardRef(() => RequestService))
    private readonly requestService: RequestService,
    @Inject(forwardRef(() => WorkshopService))
    private readonly workshopService: WorkshopService,
  ) {}

  async getUserByAzureId(
    azureId: string,
    fromRequestService: boolean = false,
  ): Promise<User> {
    if (!azureId) throw new BadRequestException('AzureId is required');
    const user = await this.userReposetory.findOne({
      where: { azureId: azureId },
    });
    if (user) {
      return user;
    }

    const newUser = new User();
    newUser.azureId = azureId;
    newUser.role = RolesEnum.DIJAK;

    if (!fromRequestService) {
      const userData = await this.getSpecificUser(azureId);
      if (!userData) throw new NotFoundException('User not found');
      if (userData.id !== azureId)
        throw new NotFoundException('User not found');
    }

    return await this.userReposetory.save(newUser);
  }

  async getUserData() {
    const client = this.requestService.getClient();
    return client.api('/me').get();
  }

  async getProfilePicture() {
    try {
      const client = this.requestService.getClient();
      const picture = await client
        .api('/me/photo/$value')
        .responseType(ResponseType.ARRAYBUFFER)
        .get();
      return Buffer.from(picture, 'base64');
    } catch (e) {
      console.log(e);
    }
  }

  async changeUserRole(azureId: string, role: RolesEnum) {
    const user = await this.getUserByAzureId(azureId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = role;

    await this.userReposetory.save(user);

    return { message: 'User role changed' };
  }

  async getSpecificUser(azureId: string) {
    if (!azureId) throw new BadRequestException('AzureId is required');
    try {
      const client = this.requestService.getClient();

      const searchUrl = `/users/${azureId}`;

      return await client.api(searchUrl).get();
    } catch (e) {
      return null;
    }
  }

  async getAllUsers() {
    return await this.userReposetory.find();
  }

  async joinWorkshop(workshopId: number) {
    const workshops = await this.workshopService.findAll();
    const workshop = workshops.find((w) => w.id === workshopId);
    if (!workshop) throw new NotFoundException('Workshop not found');

    const user = this.requestService.getUser();

    if (workshop.users.find((u) => u.id === user.id))
      throw new BadRequestException('User already joined workshop');

    const timetable = workshop.timetable;
    for (const ws of workshops) {
      if (
        ws.timetable.id === timetable.id &&
        ws.users.find((u) => u.id === user.id)
      ) {
        ws.users.splice(ws.users.indexOf(user), 1);
        await this.workshopService.save(ws);
        break;
      }
    }

    workshop.users.push(user);
    await this.workshopService.save(workshop);

    return { message: 'User joined workshop' };
  }
}
