// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('EduLearn API')
    .setDescription('API pour la plateforme EduLearn')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Exposer la documentation
  SwaggerModule.setup('api/docs', app, document);

  // Sauvegarder le JSON OpenAPI dans un fichier
  fs.writeFileSync('./swagger-spec.json', JSON.stringify(document, null, 2));

  await app.listen(3001);
  console.log('🚀 Server: http://localhost:3001');
  console.log('📚 Swagger UI: http://localhost:3001/api/docs');
  console.log('📄 OpenAPI JSON: http://localhost:3001/api/docs-json');
  console.log('💾 JSON file saved: ./swagger-spec.json');
}
bootstrap();