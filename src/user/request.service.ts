import { Injectable, Scope } from '@nestjs/common';
import { Client } from '@microsoft/microsoft-graph-client';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

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
    return await this.setUser();
  }

  private async setUser(): Promise<boolean> {
    try {
      const client = this.getClient();
      const user = await client.api('/me').get();
      if (!user.id) {
        return false;
      }
      this.user = await this.userService.getUserByAzureId(user.id, true);
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
}
