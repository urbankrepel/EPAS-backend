import { Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { Client } from '@microsoft/microsoft-graph-client';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { GradeEntity } from './entities/grade.entity';
import { RolesEnum } from 'src/roles/roles.enum';

@Injectable({ scope: Scope.REQUEST })
export class RequestService {
  private token: Token;
  private client: Client;
  private user: User;
  constructor(private readonly userService: UserService) {}

  async setToken(token: Token): Promise<boolean> {
    this.token = token;
    this.client = Client.init({
      defaultVersion: 'v1.0',
      debugLogging: true,
      authProvider: (done) => {
        done(null, token.accessToken.toString());
      },
    });
    return await this.setUser(token.user_azure_id);
  }

  private async setUser(user_azure_id?: string): Promise<boolean> {
    if (user_azure_id) {
      this.user = await this.userService.getUserByAzureId(user_azure_id, true);
      if (!this.user.grade && this.user.role === RolesEnum.DIJAK) {
        const grade = await this.getUserGrade();
        if (!grade) {
          throw new UnauthorizedException('You are not in allowed grades');
        }
        this.userService.setUserGrade(this.user, grade);
      }
      return true;
    }
    try {
      const client = this.getClient();
      const user = await client.api('/me').get();
      if (!user.id) {
        return false;
      }
      this.user = await this.userService.getUserByAzureId(user.id, true);
      if (!this.user.grade && this.user.role === RolesEnum.DIJAK) {
        const grade = await this.getUserGrade();
        if (!grade) {
          throw new UnauthorizedException('You are not in allowed grades');
        }
        this.userService.setUserGrade(this.user, grade);
      }
    } catch (error) {
      return false;
    }
    return true;
  }

  getToken(): Token {
    return this.token;
  }

  getClient(): Client {
    return this.client;
  }

  getUser(): User {
    return this.user;
  }

  private async getUserGrade(): Promise<GradeEntity | null> {
    const grade = await this.userService.getUserGrade();
    return await this.userService.getGrade(grade);
  }
}
