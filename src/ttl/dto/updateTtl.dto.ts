import { IsNotEmpty} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';


export class UpdateTtlDto {
  @ApiProperty()
  ttl_type: string;

  @ApiProperty()
  @Transform(({ value }) => parseInt(value))
  ttl: number;


  @ApiProperty()
  status: string
}