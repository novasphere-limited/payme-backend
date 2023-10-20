import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';

export class WalletDto {
  @ApiProperty()
  @IsNotEmpty()
  user: User;

  @ApiProperty()
  @IsNotEmpty()
  wallet_id: string;

  @ApiProperty()
  @IsNotEmpty()
  wallet_code?: string;

  @ApiProperty()
  @IsNotEmpty()
  account_number: string;

  @ApiProperty()
  @IsNotEmpty()
  bank: string;
}
