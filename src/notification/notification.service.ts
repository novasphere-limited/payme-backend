import {  BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggingService } from 'src/logging/logging.service';
import { Repository } from 'typeorm';
import { NotificationDto } from './dto/notification.dto';
import { Notification } from './entities/notification.entity';
import { UpdateNotificationDto } from './dto/updateNotification.dto';
import {
    paginate,
    Pagination,
    IPaginationOptions,
  } from 'nestjs-typeorm-paginate';

@Injectable()
export class NotificationService {
  constructor(
    private readonly loggingService: LoggingService,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async createNotification(
    notificationDto: NotificationDto,
  ): Promise<Notification> {
        try {
            this.loggingService.log({
                event: 'method_start',
                message: 'creating a notification',
              });
            const notification = this.notificationRepository.create({
              ...notificationDto,
            });
            await this.notificationRepository.save(notification);
            return notification;
        } catch (error) {
            throw new HttpException(
                {
                  message: 'Error: ' + error,
                },
                HttpStatus.BAD_REQUEST,
              );
        }
   
  }

  async singleNotification(id: string):Promise<Notification> {
    try {
      const notification = await this.notificationRepository.findOne({
        where: { id },
      });
      if(!notification) throw new BadRequestException("This notification does not exist")
      return notification;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error: ' + error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async editNotification(id: string,updateNotification:UpdateNotificationDto):Promise<Notification> {
    try {
      const notification = await this.notificationRepository.findOne({
        where: { id,
        isDeleted:false },
      });
      if(!notification) throw new BadRequestException("This notification does not exist")

      let {  notification_type, place_holder_count, message, status } = updateNotification
  

      if(notification_type){
        notification.notification_type = notification_type
      }
      if(place_holder_count){
        notification.place_holder_count = place_holder_count
      }
      if(message){
        notification.message = message
      }
      if(status){
        notification.status= status
      }

      await this.notificationRepository.save(notification)

      return notification;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error: ' + error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteNotification(id: string) {
    try {
      const notification = await this.notificationRepository.findOne({
        where: { id,
        isDeleted:false },
      });
      if(!notification) throw new BadRequestException("This notification does not exist")

     notification.isDeleted = true

      await this.notificationRepository.save(notification)

      return notification;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error: ' + error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async allNotifications(options: IPaginationOptions): Promise<Pagination<Notification>> {
    try {
      this.loggingService.log({
        event: 'method_start',
        message: 'Getting all notifications',
      });

      const queryBuilder = this.notificationRepository.createQueryBuilder('notification');
    
     
      queryBuilder.where('notification.isDeleted = :isDeleted', { isDeleted: false });
  
      const notifications = await paginate<Notification>(queryBuilder, options);
      return notifications;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error: ' + error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async keywordNotification (keyword: string):Promise<Notification> {
    try {
      const notification = await this.notificationRepository.findOne({
        where: { notification_type:keyword,
            isDeleted:false
         },
      });
      if(!notification) throw new BadRequestException("This notification does not exist")
      return notification;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error: ' + error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
