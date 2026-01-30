import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

/**
 * Bootstrap the NestJS application
 */
async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  // Create the application
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Get config service
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  // Set global prefix
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('NestJS Blog API')
    .setDescription(
      `
      A RESTful Blog API built with NestJS featuring:
      - **Posts**: Create, read, update, delete blog posts with tags
      - **Categories**: Manage blog categories
      - **Comments**: Add and manage comments on posts
      
      ## Features
      - JSON file-based data persistence
      - Pagination support for list endpoints
      - Search and filtering capabilities
      - Input validation with class-validator
      
      ## Example Requests
      
      ### Create a Post
      \`\`\`json
      POST /api/posts
      {
        "title": "Getting Started with NestJS",
        "content": "NestJS is a progressive Node.js framework...",
        "author": "John Doe",
        "tags": ["nestjs", "typescript"]
      }
      \`\`\`
      
      ### Search Posts
      \`\`\`
      GET /api/posts?search=nestjs&page=1&pageSize=10
      \`\`\`
    `,
    )
    .setVersion('1.0')
    .addTag('Posts', 'Blog post management')
    .addTag('Categories', 'Category management')
    .addTag('Comments', 'Comment management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Start the server
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
