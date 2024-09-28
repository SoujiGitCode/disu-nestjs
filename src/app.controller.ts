import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getRoot(): string {
    return 'Bienvenido a la API';
  }

  @Get('hello') // Este decorador define la ruta '/hello'
  getHello(): string {
    return this.appService.getHello();
  }
}
