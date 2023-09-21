import { Injectable,Logger } from '@nestjs/common';


@Injectable()
export class LoggingService {
    private readonly logger = new Logger(LoggingService.name);

    log(logData: { event: string; message: string }) {
        this.logger.log({
            event: logData.event,
            message: logData.message,
        });
    }
    }


