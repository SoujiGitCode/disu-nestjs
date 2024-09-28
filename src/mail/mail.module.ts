import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
  providers: [MailService],
  exports: [MailService], // Exportamos el servicio para que pueda ser utilizado en otros módulos
})
export class MailModule { }
