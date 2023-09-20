import { Global, Module } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { LoggerModule } from 'nestjs-pino'

@Global()
@Module({
  imports: [LoggerModule.forRoot({
    pinoHttp: {
      transport: {
        target: 'pino-pretty',
        options: {
          singleLine: true,
        },
      },
    },
  })],
  providers: [LoggingService],
  exports: [LoggingService]
})
export class LoggingModule {}
