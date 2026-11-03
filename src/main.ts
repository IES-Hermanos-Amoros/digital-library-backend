import { Request, Response, NextFunction } from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { sessionConfig } from './config/session.config';
import { corsOptions } from './config/cors.config';
import { globalValidationPipe } from './config/validation.config';
import { Logger } from '@nestjs/common';
import { healthCorsMiddleware } from './config/health-cors.middleware';
import * as fs from 'fs';

async function bootstrap() {
  // Configure HTTPS through environment variables
  const httpsActive = process.env.HTTPS_ACTIVE === 'true';

  let httpsOptions: {
    key: Buffer;
    cert: Buffer;
  } | undefined;

  if (httpsActive) {
    const keyPath = process.env.HTTPS_KEY_PATH;
    const certPath = process.env.HTTPS_CERT_PATH;

    if (!keyPath || !certPath) {
      throw new Error(
        'HTTPS is enabled, but HTTPS_KEY_PATH or HTTPS_CERT_PATH is missing.',
      );
    }

    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
      throw new Error(
        `HTTPS certificate files not found. Key: ${keyPath}, Certificate: ${certPath}`,
      );
    }

    httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };

    Logger.log('🔒 HTTPS enabled', 'NestApplication');
  } else {
    Logger.log('ℹ️ HTTPS disabled; starting with HTTP', 'NestApplication');
  }

  // Start the application with the selected HTTP/HTTPS configuration
  const app = await NestFactory.create(
    AppModule,
    httpsOptions ? { httpsOptions } : {},
  );

  // Middleware CORS abierto solo para /health
  app.use('/health', healthCorsMiddleware);

  // Configure session middleware
  app.use(sessionConfig);

  // Enable CORS
  app.enableCors(corsOptions);

  // Set global route prefix for all application routes
  app.setGlobalPrefix('api');

  // Enable validation of application DTOs
  app.useGlobalPipes(globalValidationPipe);

  // Enable HTTP request logging in console for development and testing environments
  if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test') {
    app.useLogger(new Logger());
  }

  // Remove X-Powered-By header from responses
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.removeHeader('X-Powered-By');
    next();
  });

  // Start the application on the configured port
  const port = process.env.PORT || 3000;
  const protocol = httpsActive ? 'https' : 'http';

  await app.listen(port);

  Logger.log(
    `🚀 ${process.env.NAME} Backend running on port ${port}`,
    'NestApplication',
  );

  Logger.log(
    `✅ Server ready on ${protocol}://localhost:${port}/`,
    'NestApplication',
  );
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
