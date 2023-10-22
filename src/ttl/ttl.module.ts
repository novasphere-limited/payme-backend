import { Module, Global } from '@nestjs/common';
import { TtlService } from './ttl.service';
import { TtlController } from './ttl.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ttl } from './entities/ttl.entity';
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Ttl])],
  providers: [TtlService],
  exports: [TtlService],
  controllers: [TtlController]
})
export class TtlModule {}
