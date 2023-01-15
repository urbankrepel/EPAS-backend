import { ResponseType } from '@microsoft/microsoft-graph-client';
import {
  Injectable,
  forwardRef,
  Inject,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RolesEnum } from 'src/roles/roles.enum';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RequestService } from './request.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userReposetory: Repository<User>,
    @Inject(forwardRef(() => RequestService))
    private readonly requestService: RequestService,
  ) {}

  async getUserByAzureId(azureId: string): Promise<User> {
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
      throw new BadRequestException('User not found');
    }
    console.log(user);

    user.role = role;

    await this.userReposetory.save(user);

    return { message: 'User role changed' };
  }
}
