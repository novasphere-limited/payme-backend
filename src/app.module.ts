import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from './config/config.service';
import { JwtService } from '@nestjs/jwt';
import { RolePermissionModule } from './roles/role-permission.module';
import { WalletModule } from './wallet/wallet.module';
import { TransactionModule } from './transaction/transaction.module';
import { MessagingModule } from './messaging/messaging.module';
import { LoggingModule } from './logging/logging.module';
import { HelperModule } from './helper/helper.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import type { RedisClientOptions } from 'redis';
import { NotificationModule } from './notification/notification.module';
import { TtlModule } from './ttl/ttl.module';
import { TransactionLogModule } from './transaction-log/transaction-log.module';
import { ConfigcatModule } from './configcat/configcat.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 0
    }),
    AuthModule,
    UserModule,
    RolePermissionModule,
    WalletModule,
    TransactionModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      port: parseInt(process.env.DATABASE_PORT, 10),
      host: process.env.DATABASE_HOST,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: true,
      //options: { trustServerCertificate: true },
      migrations: ['src/migration/*{.ts,.js}'],
      // logging: true,
    }),
    MessagingModule,
    LoggingModule,
    HelperModule,
    NotificationModule,
    TtlModule,
    TransactionLogModule,
    ConfigcatModule,
  ],
  providers: [JwtService, ConfigService],
})
export class AppModule {
  static port: number;
  static apiVersion: string;
  static apiPrefix: string;

  constructor(private readonly configService: ConfigService) {
    AppModule.port = new ConfigService().get('HTTP_PORT');
    AppModule.apiVersion = this.configService.get('API_VERSION');
    AppModule.apiPrefix = this.configService.get('API_PREFIX');
  }
}
