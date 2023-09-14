import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { Permission } from './entities/permission.entity';

@Injectable()
export class RolePermissionService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async getAllPermission(): Promise<Permission[]> {
    const permissionsFromDb = await this.permissionRepository.find();
    if (permissionsFromDb.length > 0) {
      return permissionsFromDb;
    }
    throw new HttpException(
      'No permissions found for specified module',
      HttpStatus.NOT_FOUND,
    );
  }

  async createPermission(
    perm_title: string,
    module: string,
  ): Promise<Permission> {
    const permission = this.permissionRepository.create({
      permission_title: perm_title.toUpperCase(),
      module,
    });
    return await this.permissionRepository.save(permission);
  }

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const { role_name, permission_id } = createRoleDto;

    const permissions: Permission[] = [];
    for (const id of permission_id) {
      const permissionFromDb = await this.permissionRepository.findOne({
        where: { id },
      });
      if (!permissionFromDb) {
        throw new HttpException(
          `No permissions found for id ${id}`,
          HttpStatus.NOT_FOUND,
        );
      }
      permissions.push(permissionFromDb);
    }

    const role = this.roleRepository.create({
      role_name,
      permissions,
    });
    const createdRole = this.roleRepository.save(role);
    if (createdRole) {
      return createdRole;
    }
    throw new HttpException('Unable to create role', HttpStatus.BAD_REQUEST);
  }

  async getAllRoles(): Promise<Role[]> {
    const rolesFromDb = await this.roleRepository.find();
    if (rolesFromDb.length > 0) {
      return rolesFromDb;
    }
    throw new HttpException('No roles found.', HttpStatus.NOT_FOUND);
  }

  async getRoleById(id: number): Promise<Role> {
    const roleFromDb = await this.roleRepository.findOne({ where: { id } });
    if (roleFromDb) {
      return roleFromDb;
    }
    throw new HttpException(
      'No role found for specified id.',
      HttpStatus.NOT_FOUND,
    );
  }
}
