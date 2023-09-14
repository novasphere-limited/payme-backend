import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty()
  @IsNotEmpty()
  role_name: string;

  @ApiProperty()
  @IsNotEmpty()
  permission_id: number[];
}
