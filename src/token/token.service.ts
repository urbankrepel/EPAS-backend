import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async getToken(jwt: string): Promise<Token> {
    try {
      let decoded = this.jwtService.decode(jwt);
      if (!decoded) {
        throw new UnauthorizedException();
      }
      return decoded as Token;
    } catch (e) {
      return null;
    }
  }
}
