import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TranslogDto {
  @ApiProperty()
  request_time?: string;

  @ApiProperty()
  response_time?: string;

  @ApiProperty()
  is_request?: boolean;

  @ApiProperty()
  @IsNotEmpty()
  status: string;

  @ApiProperty()
  @IsNotEmpty()
  transaction_type: string;

  @ApiProperty()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  transaction_code: number;

  @ApiProperty()
  @IsNotEmpty()
  message?: string;

  @ApiProperty()
  @IsNotEmpty()
  requested_by?: string;
}
