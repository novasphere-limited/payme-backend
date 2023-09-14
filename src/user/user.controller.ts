import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PermissionInterceptor } from 'src/common/interceptors/permission.interceptor';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { BaseResponse } from 'src/common/utils';

@ApiBearerAuth()
@ApiTags('User Manager')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiResponse({
    status: 201,
    description: 'The User has successfully been created.',
  })
  @Post('create')
  public async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.create(createUserDto);
  }

  @ApiResponse({
    status: 200,
    description: 'The User has successfully been retrieved.',
  })
  @Get(':id')
  @Permissions('CAN_DELETE')
  public async findById(@Param('id') id: number): Promise<User> {
    return await this.userService.findById(id);
  }

  @ApiResponse({
    status: 200,
    description: 'The User role has successfully been updated.',
  })
  @Put('update-role')
  public async updateUserRole(
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ): Promise<BaseResponse> {
    const updatedUser = await this.userService.updateUserRole(
      updateUserRoleDto,
    );
    return {
      message: 'User role updated.',
      status: HttpStatus.OK,
      result: updatedUser,
    };
  }
}
