import {
  Client,
  AuthenticationProvider,
  AuthenticationProviderOptions,
} from '@microsoft/microsoft-graph-client';

export class AppAuthProvider implements AuthenticationProvider {
  constructor(private token: string) {}
  public async getAccessToken(
    authenticationProviderOptions?: AuthenticationProviderOptions,
  ) {
    return this.token;
  }
}
