import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from './config/config.service';
import * as basicAuth from "express-basic-auth";
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

async function bootstrap() {

  const httpPort = new ConfigService().get('httpPort');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/payme');
  app.enableCors({
    origin: '*',
  });
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.use(`/api/v1/swagger*`,
    basicAuth({
      challenge: true,
      users: {
        payme: await new ConfigService().get('swaggerAuthPassword'),
      },
    })
  );
  const options = new DocumentBuilder()
    .setTitle('Novaspahere - PayMe API Service')
    .setDescription('User Manager, authentication & authorization, payment, bill pay and transactionAPIs.')
    .setVersion('1.0')
    .addBearerAuth({
      in: 'header',
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'jwt',
    })
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/v1/swagger', app, document, {
    customSiteTitle: 'Payme'
  });

  //If we decide to convert the service to use microservice architecture
  // const microservice = app.connectMicroservice({
  //   transport: Transport.TCP,
  //   options: { host: 'localhost', port: microservicePort },
  // });

  //await microservice.listen().then(() => console.log(`Micro-Service is running on port: ${microservicePort}`));

  await app .listen(httpPort).then(async () => console.log(`Application is running on: ${await app.getUrl()}`));
}
bootstrap();
