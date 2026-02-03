import { AppModule } from './app.module';
import { Logger, ValidationPipe, VERSION_NEUTRAL, VersioningType } from '@nestjs/common';
import { ConfigProvider } from '@sravni/nest-utils/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSION_NEUTRAL,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableShutdownHooks();

  const configService: ConfigProvider = app.get(ConfigProvider);
  const port = configService.get('PORT') || 3001;
  const isProduction = configService.get('ENV') === 'production';

  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Autosend Service API')
      .setDescription('API for autosend scheduling')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('swagger', app, document);
  }

  await app.listen(port);

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

process.on('unhandledRejection', (reason, promise) => {
  Logger.log({
    level: 'error',
    message: 'SERVER ERROR',
    meta: {
      reason,
      promise,
    },
  });
});

process.on('uncaughtException', (error) => {
  Logger.log({
    level: 'error',
    message: 'SERVER ERROR',
    exception: error,
  });
});
