import { BadGatewayException, Injectable } from '@nestjs/common';
import clientApplication from 'src/applications/clientAppliction';

@Injectable()
export class AuthService {
  async getAuthUrl(): Promise<{ url: string }> {
    const authCodeUrlParameters = {
      scopes: process.env.OAUTH_SCOPES.split(' '),
      redirectUri: process.env.OAUTH_REDIRECT_URI,
      prompt: 'select_account',
    };
    let url = await clientApplication.getAuthCodeUrl(authCodeUrlParameters);
    return { url: url };
  }

  async getAccessToken(code: string): Promise<Token> {
    const tokenRequest = {
      code: code,
      scopes: process.env.OAUTH_SCOPES.split(' '),
      redirectUri: process.env.OAUTH_REDIRECT_URI,
      accessType: 'offline',
    };
    try {
      let respons = await clientApplication.acquireTokenByCode(tokenRequest);
      const tokenCache = clientApplication.getTokenCache().serialize();
      const refreshTokenObject = JSON.parse(tokenCache).RefreshToken;
      let homeAccountId = respons.account.homeAccountId;
      let refreshToken = '';
      Object.entries(refreshTokenObject).forEach((item: any) => {
        if (item[1].home_account_id === homeAccountId) {
          refreshToken = item[1].secret;
        }
      });
      const token: Token = {
        //Žeton, ki ga shranimo v uporabnikovo sejo ali v primeru mobilne aplikacije v pomnilnik in vsebuje:
        accessToken: respons.accessToken, //Dostopni žeton
        refreshToken: refreshToken, //Žeton za osvežitev
        expiresOn: respons.expiresOn.toString(), //Rok trajanja dostopnega žetona
      };
      return token;
    } catch (e) {
      throw new BadGatewayException();
    }
  }
}
