import { Module, Global } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { RolePermissionModule } from 'src/roles/role-permission.module';
import { HttpModule } from '@nestjs/axios';
@Global()
@Module({
  imports: [RolePermissionModule, TypeOrmModule.forFeature([User]),HttpModule],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
