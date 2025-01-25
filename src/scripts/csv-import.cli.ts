import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CsvImportService } from '../businesses/csv-import.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const csvImportService = app.get(CsvImportService);

    const filePath = 'business-data.csv'; // Ruta del archivo CSV en el directorio del proyecto
    try {
        await csvImportService.importCsv(filePath);
        console.log('CSV importado correctamente.');
    } catch (error) {
        console.error('Error al importar el CSV:', error.message);
    } finally {
        await app.close();
    }
}

bootstrap();
