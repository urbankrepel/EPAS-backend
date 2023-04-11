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
      const jwt = req.headers.authorization;
      if (!jwt) {
        throw new UnauthorizedException();
      }
      const token = await this.tokenService.getToken(jwt);
      if (!token) {
        throw new UnauthorizedException();
      }
      const isValid = await this.requestService.setToken(token);
      if (!isValid) {
        throw new UnauthorizedException();
      }
      req.role = this.requestService.getUser().role;
      return next();
    } catch (e) {
      throw e;
    }
  }
}

// await this.tokenService.saveToken(newToken, res);
//         await this.requestService.setToken(newToken);
//         req.role = this.requestService.getUser().role;
//         return next();
