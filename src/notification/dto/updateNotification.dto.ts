import { IsNotEmpty} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';


export class UpdateNotificationDto {
  @ApiProperty()
  notification_type: string;

  @ApiProperty()
  @Transform(({ value }) => parseInt(value))
  place_holder_count: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  status: string
}