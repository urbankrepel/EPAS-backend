import { Injectable, Scope } from '@nestjs/common';
import { Client } from '@microsoft/microsoft-graph-client';

@Injectable({ scope: Scope.REQUEST })
export class RequestService {
  private token: Token;
  private client: Client;

  setToken(token: Token) {
    this.token = token;
    this.client = Client.init({
      defaultVersion: 'v1.0',
      debugLogging: true,
      authProvider: (done) => {
        done(null, token.accessToken.toString());
      },
    });
  }

  getToken(): Token {
    return this.token;
  }

  getClient(): Client {
    return this.client;
  }
}
