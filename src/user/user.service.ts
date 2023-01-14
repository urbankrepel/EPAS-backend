import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RolesEnum } from 'src/roles/roles.enum';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userReposetory: Repository<User>,
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
}
