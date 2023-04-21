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
import { WorkshopService } from 'src/workshop/workshop.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RequestService } from './request.service';
import { GradeEntity } from './entities/grade.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userReposetory: Repository<User>,
    @Inject(forwardRef(() => RequestService))
    private readonly requestService: RequestService,
    @Inject(forwardRef(() => WorkshopService))
    private readonly workshopService: WorkshopService,
    @InjectRepository(GradeEntity)
    private readonly gradeReposetory: Repository<GradeEntity>,
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

  async getUserGrade(): Promise<string | null> {
    const client = this.requestService.getClient();
    const results = await client
      .api(
        '/me/memberOf?$select=groupTypes,mailEnabled,securityEnabled,displayName',
      )
      .responseType(ResponseType.JSON)
      .get();

    const grade =
      results.value.find(
        (e: any) =>
          e.mailEnabled == true &&
          e.securityEnabled == true &&
          e.groupTypes.length == 0,
      ) || null;

    return grade ? grade.displayName : null;
  }

  async setUserGrade(user: User, grade: GradeEntity) {
    user.grade = grade;
    await this.userReposetory.save(user);
  }

  async getGrade(name: string): Promise<GradeEntity | null> {
    if (!name) {
      return null;
    }
    return await this.gradeReposetory.findOne({
      where: { name: name },
    });
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

    const copacity = workshop.capacity;
    if (copacity <= workshop.users.length)
      throw new BadRequestException('Workshop is full');

    const user = this.requestService.getUser();

    if (workshop.users.find((u) => u.id === user.id))
      throw new BadRequestException('User already joined workshop');

    const usersWorkshops = workshops.filter((workshop) =>
      workshop.users.includes(user),
    );
    const workshopWithSameName = usersWorkshops.find(
      (workshop) => workshop.name === workshop.name,
    );
    if (workshopWithSameName) {
      throw new BadRequestException(
        "You can't join two workshops with the same name",
      );
    }

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

  async leaveWorkshop(workshopId: number) {
    const workshops = await this.workshopService.findAll();
    const workshop = workshops.find((w) => w.id === workshopId);
    if (!workshop) throw new NotFoundException('Workshop not found');

    const user = this.requestService.getUser();

    if (!workshop.users.find((u) => u.id === user.id))
      throw new BadRequestException('User is not in workshop');

    workshop.users.splice(workshop.users.indexOf(user), 1);
    await this.workshopService.save(workshop);

    return { message: 'User left workshop' };
  }
}
