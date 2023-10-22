import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { keyword } from 'src/common/keywords/keywords';


export class TtlDto {
  @ApiProperty()
  @IsNotEmpty()
  ttl_type: keyword;

  @ApiProperty()
  @IsNotEmpty()
  ttl: number;


}