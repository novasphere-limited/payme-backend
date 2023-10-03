import { Module, Global } from '@nestjs/common';
import { TransactionLogService } from './transaction-log.service';
import { TransactionLogController } from './transaction-log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Translog } from './entities/translog.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Translog])],
  providers: [TransactionLogService],
  exports: [TransactionLogService],
  controllers: [TransactionLogController]
})
export class TransactionLogModule {}
