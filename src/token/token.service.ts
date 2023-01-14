import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class TokenService {
  private readonly cookieOptions = {
    httpOnly: true,
    secure:
      process.env.OAUTH_REDIRECT_URI ===
      'http://localhost:5050/api/auth/redirect/'
        ? false
        : true,
    domain: 'localhost',
  };
  constructor(private readonly jwtService: JwtService) {}
  async saveToken(token: Token, res: Response) {
    const { accessToken, refreshToken, expiresOn } = token;
    const accessTokenAndExpiresOn = await this.jwtService.signAsync({
      accessToken,
      expiresOn,
    });
    res.cookie('accessToken', accessTokenAndExpiresOn, this.cookieOptions);

    const refreshTokenJwt = await this.jwtService.signAsync(
      {
        refreshToken,
      },
      {
        expiresIn: '2d',
      },
    );
    res.cookie('refreshToken', refreshTokenJwt, this.cookieOptions);
  }

  async verifyToken(
    accessTokenAndExpiresOn: string,
    refreshTokenJwt: string,
  ): Promise<Token> {
    let accessTokenAndExpiresOnObject: any = {
      accessToken: null,
      expiresOn: null,
    };
    try {
      accessTokenAndExpiresOnObject = await this.jwtService.verifyAsync(
        accessTokenAndExpiresOn,
      );
    } catch (e) {}
    try {
      const refreshTokenObject = await this.jwtService.verifyAsync(
        refreshTokenJwt,
      );
      return {
        accessToken: accessTokenAndExpiresOnObject.accessToken,
        refreshToken: refreshTokenObject.refreshToken,
        expiresOn: accessTokenAndExpiresOnObject.expiresOn,
      };
    } catch (e) {
      return null;
    }
  }

  async getToken(token: Token): Promise<Token> {
    let now = new Date();
    let expDateUTC = new Date(token.expiresOn.toString()) || new Date();
    if (now.getTime() < expDateUTC.getTime()) {
      return token;
    }

    const data = await this.fetchToken(token);
    if (!data) {
      throw new UnauthorizedException('Ne morem osveziti zetona');
    }
    let expDate = new Date(now.getTime() + data.expires_in * 1000);
    let newtoken: Token = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresOn: expDate.toString(),
    };

    return newtoken;
  }

  private async fetchToken(token: Token) {
    try {
      let respons = await fetch(
        `${process.env.OAUTH_AUTHORITY}oauth2/v2.0/token`,
        {
          body: `client_id=${process.env.OAUTH_APP_ID}&client_secret=${
            process.env.OAUTH_APP_CLIENT_SECRET
          }&refresh_token=${
            token.refreshToken
          }&scopes='${process.env.OAUTH_SCOPES.split(
            ' ',
          )}'&grant_type=refresh_token&redirect_uri=${
            process.env.OAUTH_REDIRECT_URI
          }`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          method: 'post',
        },
      );
      if (respons.status != 200) {
        return undefined;
      }
      const data = await respons.json();
      if (data) {
        return data;
      }
      return undefined;
    } catch (e) {
      return undefined;
    }
  }
}
