import {
  Controller,
  Body,
  Post,
  UseGuards,
  Request,
  HttpStatus,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  ParseFloatPipe,
  Query,
  Res,
  Put,
  Delete,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { BaseResponse } from 'src/common/utils';
import { localAuthGuard } from 'src/auth/guards/local-auth.guard';
import { NotificationDto } from './dto/notification.dto';
import { UpdateNotificationDto } from './dto/updateNotification.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Notification } from './entities/notification.entity';
ApiBearerAuth();
@ApiTags('Notification-Management')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiResponse({
    status: 201,
    description: 'The Transactin has successfully been created.',
  })
//   @UseGuards(localAuthGuard)
  @Post('create-notification')
  async create(
    @Body() notificationDto: NotificationDto,
  ): Promise<BaseResponse> {
    const notification = await this.notificationService.createNotification(
      notificationDto
    );
    return {
      message: 'Notification has successfully been created.',
      status: HttpStatus.CREATED,
      result: notification,
    };
  }

  @ApiResponse({
    status: 200,
    description: 'Notification has successfully been retreived.',
  })
//   @UseGuards(localAuthGuard)
  @Get(':id')
  async getNotification(
    @Param('id') id: string,
  ): Promise<BaseResponse> {
    const transaction = await this.notificationService.singleNotification(id);
    return {
      message: 'Notification has successfully been retreived.',
      status: HttpStatus.OK,
      result: transaction,
    };
  }

  @ApiResponse({
    status: 200,
    description: 'Notification has successfully been edited.',
  })
//   @UseGuards(localAuthGuard)
  @Put(':id')
  async editNotification(
    @Param('id') id: string,@Body() updateNotificationDto:UpdateNotificationDto
  ): Promise<BaseResponse> {
    const transaction = await this.notificationService.editNotification(id,updateNotificationDto);
    return {
      message: 'Notification has successfully been edited.',
      status: HttpStatus.OK,
      result: transaction,
    };
  }

  @ApiResponse({
    status: 200,
    description: 'Notification has successfully been deleted.',
  })
//   @UseGuards(localAuthGuard)
  @Delete(':id')
  async deleteNotification(
    @Param('id') id: string
  ){
    const transaction = await this.notificationService.deleteNotification(id);
    return {
      message: 'Notification has successfully been deleted.',
      status: HttpStatus.OK,
      result: {},
    };
  }

  @ApiResponse({
    status: 200,
    description: 'All notifications has successfully been retreived.',
  })
  @Get('')
  async getAllNotifications(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 10,
  ): Promise<Pagination<Notification>> {
    limit = limit > 100 ? 100 : limit;
    return this.notificationService.allNotifications({
      page,
      limit,
    });

    
  }
}
