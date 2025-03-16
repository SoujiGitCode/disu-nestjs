import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as dotenv from 'dotenv';
import * as sgMail from '@sendgrid/mail';

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //'api' como prefijo global para todas las rutas, 
  //Esto ayuda a mantener la consistencia en las rutas y permite gestionar fácilmente las versiones de la API en el futuro
  app.setGlobalPrefix('api');

  // Aplicar filtro de excepción global en todas las rutas
  //Esto garantiza que todas las excepciones sean capturadas y manejadas de manera uniforme en toda la aplicación.
  app.useGlobalFilters(new HttpExceptionFilter());

  // Aplicar interceptor global para todas las respuestas
  //Esto permite modificar o formatear las respuestas de manera centralizad
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Habilita la validación global de parametros
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Elimina propiedades no especificadas en el DTO
    forbidNonWhitelisted: true, // Responde con un error si hay propiedades no permitidas
    transform: true, // Transforma los tipos de los datos recibidos según el DTO
  }));

  // Habilitar CORS para permitir solicitudes desde el frontend
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });


  await app.listen(4000);
}
bootstrap();
