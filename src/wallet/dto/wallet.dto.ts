import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';

export class WalletDto {
  @ApiProperty()
  @IsNotEmpty()
  user: User;
}
