// import { Transport } from '@nestjs/microservices';

export class ConfigService {
  private readonly envConfig: Record<string, any>;

  constructor() {
    this.envConfig = {
      httpPort: process.env.HTTP_PORT,
      gatewayPort: process.env.API_GATEWAY_PORT,
      apiPrefix: process.env.API_PREFIX,
      apiVersion: process.env.API_VERSION,
      swaggerAuthPassword: process.env.SWAGGER_AUTH_PASSWORD
    };
  }

  get(key: string): any {
    return this.envConfig[key];
  }
}
