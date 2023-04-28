import { ResponseType } from '@microsoft/microsoft-graph-client';
import {
  Injectable,
  forwardRef,
  Inject,
  BadRequestException,
  NotFoundException,
  CACHE_MANAGER,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RolesEnum } from 'src/roles/roles.enum';
import { WorkshopService } from 'src/workshop/workshop.service';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RequestService } from './request.service';
import { GradeEntity } from './entities/grade.entity';
import { Cache } from 'cache-manager';
import { Registration } from './entities/registrations';

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
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @InjectRepository(Registration)
    private readonly registrations: Repository<Registration>,
  ) {}

  async getUserByAzureId(
    azureId: string,
    fromRequestService: boolean = false,
  ): Promise<User> {
    if (!azureId) throw new BadRequestException('AzureId is required');
    const user = await this.userReposetory.findOne({
      where: { azureId: azureId },
      relations: ['grade'],
      loadEagerRelations: true,
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
  async getUserRole() {
    const user = this.requestService.getUser();
    return user.role;
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

  async generateUniqueCode() {
    const user = this.requestService.getUser();
    if (user.code) return user.code;

    const code = Math.floor(100000 + Math.random() * 900000);
    user.code = code;
    try {
      await this.userReposetory.save(user);
    } catch (e) {
      if (e.code === '23505') {
        return await this.generateUniqueCode();
      }
    }
    return code;
  }

  async getUserByCode(code: number) {
    if (!code) throw new BadRequestException('Code is required');
    return await this.userReposetory.findOne({
      where: { code: code },
      loadEagerRelations: false,
    });
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
    const [workshop, registeredUsers] = await Promise.all([
      this.workshopService.findOne(workshopId),
      this.registrations.find({
        where: { workshop: { id: workshopId } },
        loadRelationIds: true,
      }),
    ]);
    if (!workshop) throw new NotFoundException('Delavnica ne obstaja');

    const user = this.requestService.getUser();

    if (registeredUsers.length >= workshop.capacity)
      throw new BadRequestException('Delevnica je že polna');

    if (registeredUsers.find((u: any) => u.user === user.id))
      throw new BadRequestException('Si že prijavljen na delavnico');

    const workshopWithSameName = await this.registrations.findOne({
      where: { user: { id: user.id }, workshop: { name: workshop.name } },
      relations: ['workshop'],
    });
    if (workshopWithSameName) {
      throw new BadRequestException({
        workshopWithSameNameId: workshopWithSameName.workshop.id,
        message: "You can't join two workshops with the same name",
        statusCode: 400,
      });
    }

    const sameTimetable: any = await this.registrations.findOne({
      where: {
        user: { id: user.id },
        workshop: { timetable: { id: workshop.timetable.id } },
      },
      loadRelationIds: true,
    });

    if (sameTimetable) {
      await this.leaveWorkshop(sameTimetable.workshop);
    }

    await this.registrations.save({
      user: user,
      workshop: workshop,
    });

    return { message: 'User joined workshop' };
  }

  async leaveWorkshop(workshopId: number) {
    await this.registrations.delete({
      user: this.requestService.getUser(),
      workshop: { id: workshopId },
    });
    return { message: 'User left workshop' };
  }

  async getJoinedWorkshops() {
    const user = this.requestService.getUser();
    const registrations = await this.registrations.find({
      where: { user: { id: user.id } },
      relations: ['workshop', 'workshop.timetable'],
    });

    return registrations.map((r) => {
      return {
        ...r.workshop,
        timetable: r.workshop.timetable.id,
        attended: r.attended,
      };
    });
  }

  async getMyWorkshops() {
    const user = this.requestService.getUser();
    return await this.workshopService.findWorkshopsByLeader(user);
  }

  async chechIfUserIsInWorkshop(workshopId: number, user: User) {
    if (!user) throw new NotFoundException('Uporabnik ni bil najden');
    const [registration, workshop] = await Promise.all([
      this.registrations.findOne({
        where: { user: { id: user.id }, workshop: { id: workshopId } },
      }),
      this.workshopService.findOne(workshopId),
    ]);

    if (!workshop) throw new NotFoundException('Delavnica ne obstaja');

    const leader = this.requestService.getUser();
    if (workshop.leader.id !== leader.id)
      throw new ForbiddenException('Niste vodja te delavnice');

    if (registration) {
      return {
        isJoinedAtWorkshop: true,
        user: user,
      };
    }
    const someTimetable = await this.registrations.findOne({
      where: {
        user: { id: user.id },
        workshop: { timetable: { id: workshop.timetable.id } },
      },
      relations: ['workshop'],
    });
    if (someTimetable) {
      return {
        isJoinedAtWorkshop: false,
        user: user,
        workshop: someTimetable.workshop,
      };
    }
    return {
      isJoinedAtWorkshop: false,
    };
  }

  async approveAttendance(workshopId: number, azureId: string) {
    const [workshop, user] = await Promise.all([
      this.workshopService.findOne(workshopId),
      this.getUserByAzureId(azureId),
    ]);
    if (!workshop) throw new NotFoundException('Delavnica ne obstaja');
    if (!user) throw new NotFoundException('Uporabnik ni bil najden');
    const leader = this.requestService.getUser();
    if (workshop.leader.id !== leader.id)
      throw new ForbiddenException('Niste vodja te delavnice');

    const registration = await this.registrations.findOne({
      where: { user: { id: user.id }, workshop: { id: workshop.id } },
    });
    if (!registration) throw new NotFoundException('Napaka pri potrditvi');
    registration.attended = true;
    await this.registrations.save(registration);
  }

  async getMyWorkshopJoinList(workshopId: number) {
    if (!workshopId) throw new BadRequestException('Workshop id is required');
    const [registrations, workshop] = await Promise.all([
      this.registrations.find({
        where: { workshop: { id: workshopId } },
        loadRelationIds: true,
      }),
      this.workshopService.findOne(workshopId),
    ]);

    if (!workshop) throw new NotFoundException('Delavnica ne obstaja');
    if (registrations.length === 0)
      throw new NotFoundException('Na delavnico se ni prijavil še nihče');

    const leader = this.requestService.getUser();
    if (workshop.leader.id !== leader.id)
      throw new ForbiddenException('Niste vodja te delavnice');
    const usersIds = registrations.map((r) => r.user);
    const users = await this.userReposetory.find({
      where: { id: In(usersIds) },
      loadEagerRelations: false,
    });
    return registrations.map((r: any) => {
      const user = users.find((u) => u.id === r.user);
      return {
        azureId: user.azureId,
        attended: r.attended,
      };
    });
  }

  async getUserCount(workshopId: number) {
    return await this.registrations.count({
      where: { workshop: { id: workshopId } },
    });
  }
}
