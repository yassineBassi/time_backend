import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Time api')
    .setDescription('Time API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe({
    stopAtFirstError: true,
    whitelist: true, 
    transform: true,
    transformOptions: {
      enableImplicitConversion: true
    },
    exceptionFactory: (errors) => new BadRequestException(errors) 
  }));

  useContainer(app.select(AppModule), {fallbackOnErrors: true}); 

  await app.listen(3000);
}
bootstrap();
