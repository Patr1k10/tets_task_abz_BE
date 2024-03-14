import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const logger = new Logger(bootstrap.name);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get('FRONTEND_ORIGIN'),
    methods: configService.get('CRORS_METHODS'),
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Test Task ABZ')
    .setDescription('Test Task ABZ')
    .setVersion('0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, document, {
    jsonDocumentUrl: 'swagger/swagger-json',
    customSiteTitle: 'Test Task ABZ',
  });

  const server = await app.listen(configService.getOrThrow('API_PORT'));
  const address = server.address();
  if (typeof address !== 'string') {
    logger.log(`The server is running at the address: http://localhost:${address.port}`);
    logger.log(`Swagger description: http://localhost:${address.port}/swagger`);
  } else {
    logger.log(`The server is running at the address: http://localhost:${address}`);
    logger.log(`Swagger description: http://localhost:${address}/swagger`);
  }
}
bootstrap();
