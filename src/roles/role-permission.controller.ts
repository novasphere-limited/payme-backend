import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from './entities/role.entity';
import { RolePermissionService } from './role-permission.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { BaseResponse } from 'src/common/utils';

@ApiBearerAuth()
@ApiTags('Role & Permission Manager')
@Controller('role-permission')
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  @ApiResponse({
    status: 201,
    description: 'The Role has successfully been created.',
  })
  @Post('role')
  public async createRole(
    @Body() createRoleDto: CreateRoleDto,
  ): Promise<BaseResponse> {
    const createdRole = await this.rolePermissionService.createRole(
      createRoleDto,
    );
    return {
      message: 'Role has successfully been created.',
      status: HttpStatus.CREATED,
      result: createdRole,
    };
  }

  @ApiResponse({
    status: 200,
    description: 'The roles has successfully been retrieved.',
  })
  @Get('role/:id')
  public async findById(@Param('id') id: number): Promise<BaseResponse> {
    const role = await this.rolePermissionService.getRoleById(id);
    return {
      message: 'Role has successfully been retrieved.',
      status: HttpStatus.OK,
      result: role,
    };
  }

  @ApiResponse({
    status: 200,
    description: 'All roles has successfully been retrieved.',
  })
  @Get('role')
  public async getAllRoles(): Promise<BaseResponse> {
    const roles = await this.rolePermissionService.getAllRoles();
    return {
      message: 'Roles has successfully been retrieved.',
      status: HttpStatus.OK,
      result: roles,
    };
  }

  @ApiResponse({
    status: 201,
    description: 'The permission has successfully been created.',
  })
  @Post('permission/:perm_title/:module')
  public async createPermission(
    @Param('perm_title') perm_title: string,
    @Param('module') module: string,
  ): Promise<BaseResponse> {
    const createdPermission = await this.rolePermissionService.createPermission(
      perm_title,
      module,
    );
    return {
      message: 'Permission has successfully been created.',
      status: HttpStatus.CREATED,
      result: createdPermission,
    };
  }

  @ApiResponse({
    status: 200,
    description: 'All permissions has successfully been retrieved.',
  })
  @Get('permission')
  public async getAllPermission(): Promise<BaseResponse> {
    const permissions = await this.rolePermissionService.getAllPermission();
    return {
      message: 'Permissions has successfully been retrieved.',
      status: HttpStatus.OK,
      result: permissions,
    };
  }
}
