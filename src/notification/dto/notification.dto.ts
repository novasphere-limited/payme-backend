import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class NotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  notification_type: string;

  @ApiProperty()
  @IsNotEmpty()
  place_holder_count: number;

  @ApiProperty()
  @IsNotEmpty()
  message: string;

}