import { Global, Module } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { LoggerModule } from 'nestjs-pino';

@Global()
@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          targets: [
            {
              target: 'pino-pretty',
              options: {
                singleLine: true,
              },
              level: 'info',
            },
            {
              target: '@logtail/pino',
              options: {
                sourceToken: '63juvUcy6dfsrg6XzaXjjQY5',
              },
              level: 'info',
            },
          ],
        },
      },
    }),
  ],

  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}
