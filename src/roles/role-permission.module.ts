import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermissionService } from './role-permission.service';
import { RolePermissionController } from './role-permission.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  providers: [RolePermissionService],
  exports: [RolePermissionService],
  controllers: [RolePermissionController],
})
export class RolePermissionModule {}
