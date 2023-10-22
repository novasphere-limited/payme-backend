import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseInterceptors,
  Res
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PermissionInterceptor } from 'src/common/interceptors/permission.interceptor';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { BaseResponse } from 'src/common/utils';
import { Pagination } from 'nestjs-typeorm-paginate';
import { CacheInterceptor } from '@nestjs/cache-manager';
import {Response} from 'express'
import { NotificationService } from 'src/notification/notification.service';


@ApiBearerAuth()
@ApiTags('User Manager')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService,
    private readonly notificationService:NotificationService) {}

  @ApiResponse({
    status: 201,
    description: 'The User has successfully been created.',
  })
  @Get('create/user')
  public async create( @Query("sender") sender: string,
  @Query("message") message:string, @Res() res: Response) {
    try {
    const response =  await this.userService.create(sender,message);
      const note = await this.notificationService.keywordNotification("Confirm_Registeration")
      console.log(note)
      note.message = note.message.replace("[account number]", response.wallet.account_number);
      note.message = note.message.replace("[bank]", response.wallet.bank);
      res.setHeader('Content-Type', 'text/plain')
      return res.send(note.message)
    } catch (error) {
      res.setHeader('Content-Type', 'text/plain');
      return res.send(error.message);
    }
    
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
  @ApiResponse({
    status: 200,
    description: 'All User has successfully been retreived.',
  })
  @Get('')
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<Pagination<User>> {
    limit = limit > 100 ? 100 : limit;
    return this.userService.allUsers({
      page,
      limit,
    });

    
  }

  @ApiResponse({
    status: 200,
    description: 'The User role has successfully been updated.',
  })
  @Get('verify-user/verify')
  public async confirmUser(
    @Query("sender") sender: string,
    @Query("message") message:string,
    @Res() res: Response
  ) {
    try {
      const updatedUser = await this.userService.verifyUser(
        sender,message
      );
     
      
        const note = await this.notificationService.keywordNotification("Register")
        note.message = note.message.replace("[name]", updatedUser.fullName);
        note.message = note.message.replace("[date of birth]", updatedUser.redactedDate);
        note.message = note.message.replace("[trans code]", updatedUser.transCode);
      res.setHeader('Content-Type', 'text/plain')
      res.send(note.message)
    } catch (error) {
      res.setHeader('Content-Type', 'text/plain');
      return res.send(error.message);
    }
    
  }

}
