import { Global, Module } from '@nestjs/common';
import { ConfigcatService } from './configcat.service';
@Global()
@Module({
  providers: [ConfigcatService],
  exports: [ConfigcatService]
})
export class ConfigcatModule {}
