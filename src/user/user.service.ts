import { Injectable, forwardRef, Inject } from '@nestjs/common';
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
    const user = await this.userReposetory.findOne({
      where: { azureId },
    });
    if (user) {
      return user;
    }

    const newUser = new User();
    newUser.azureId = azureId;
    newUser.role = RolesEnum.DIJAK;

    return await this.userReposetory.save(newUser);
  }

  async getCurrentUser(): Promise<User> {
    return this.requestService.getUser();
  }
}
