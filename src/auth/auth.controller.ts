import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Redirect,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { TokenService } from 'src/token/token.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Get('url')
  @Redirect('/', 302)
  getAuthUrl() {
    return this.authService.getAuthUrl();
  }

  @Get('redirect')
  async getAccessToken(@Query('code') code: string, @Res() res: Response) {
    if (!code || code === '') {
      throw new BadRequestException('No code provided');
    }
    const token = await this.authService.getAccessToken(code);
    await this.tokenService.saveToken(token, res);
    return res.redirect('/');
  }
}
