import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  protected IDENTITY_URL = '';
  protected CLIENT_ID = '';
  protected CLIENT_SECRET = '';

  public constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.IDENTITY_URL = configService.get<string>('IDENTITY_URL') || '';
    this.CLIENT_ID = configService.get<string>('CLIENT_ID') || '';
    this.CLIENT_SECRET = configService.get<string>('CLIENT_SECRET') || '';
  }

  public async getAuthToken(): Promise<string> {
    const authData = {
      email: this.CLIENT_ID,
      password: this.CLIENT_SECRET,
      returnSecureToken: true,
    };
    const { data } = await this.httpService
      .post(this.IDENTITY_URL, authData)
      .toPromise();
    return data.idToken;
  }
}
