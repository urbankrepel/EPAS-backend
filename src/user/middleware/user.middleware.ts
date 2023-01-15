import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { TokenService } from 'src/token/token.service';
import { RequestService } from '../request.service';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(
    private readonly tokenService: TokenService,
    private readonly requestService: RequestService,
  ) {}

  async use(req: any, res: Response, next: NextFunction) {
    try {
      const accessTokenAndExpiresOn = req.cookies['accessToken'];
      const refreshTokenJwt = req.cookies['refreshToken'];

      const token = await this.tokenService.verifyToken(
        accessTokenAndExpiresOn,
        refreshTokenJwt,
      );
      if (!token) {
        throw new UnauthorizedException('No token');
      }

      const newToken = await this.tokenService.getToken(token);

      if (
        newToken &&
        newToken.accessToken &&
        newToken.refreshToken &&
        newToken.expiresOn
      ) {
        await this.tokenService.saveToken(newToken, res);
        await this.requestService.setToken(newToken);
        req.role = this.requestService.getUser().role;
        return next();
      } else {
        throw new UnauthorizedException('No token');
      }
    } catch (e) {
      throw e;
    }
  }
}
