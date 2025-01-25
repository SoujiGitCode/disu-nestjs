import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import { Injectable } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';

@Injectable()
export class CsvImportService {
  constructor(private readonly businessesService: BusinessesService) { }

  async importCsv(filePath: string): Promise<void> {
    const businesses = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
          const business = this.parseRowToBusiness(row);
          businesses.push(business);
        })
        .on('end', async () => {
          for (const business of businesses) {
            try {
              await this.businessesService.create(business); // Crea las empresas directamente
            } catch (error) {
              console.error('Error creando la empresa:', error);
            }
          }
          console.log(`${businesses.length} empresas procesadas exitosamente.`);
          resolve();
        })
        .on('error', (error) => {
          console.error('Error leyendo el archivo CSV:', error);
          reject(error);
        });
    });
  }

  private parseRowToBusiness(row: any): CreateBusinessDto {
    return {
      name: row['name'],
      representative: row['representative'],
      slang: row['slang'],
      industry: row['industry'],
      address: row['address'],
      discount: row['discount'] ? parseFloat(row['discount']) : null,
      paymentMethods: row['paymentMethods']?.split(',') || [],
      notificationsEmailAddress: row['notificationsEmailAddress'],
      status: row['status'],
      ranking: row['ranking'] ? parseInt(row['ranking'], 10) : null,
      logo: row['logo'],
      images: {
        image1: row['images/image1'] || null,
        image2: row['images/image2'] || null,
        image3: row['images/image3'] || null,
        image4: row['images/image4'] || null,
        instagram: row['images/instagram'] || null,
      },
      googleMapsUrl: row['googleMapsUrl'],
      weeklySchedule: [
        { day: 'Monday', status: row['weeklySchedule/0/status'], openingHour: row['weeklySchedule/0/openingHour'], closingHour: row['weeklySchedule/0/closingHour'] },
        { day: 'Tuesday', status: row['weeklySchedule/1/status'], openingHour: row['weeklySchedule/1/openingHour'], closingHour: row['weeklySchedule/1/closingHour'] },
        { day: 'Wednesday', status: row['weeklySchedule/2/status'], openingHour: row['weeklySchedule/2/openingHour'], closingHour: row['weeklySchedule/2/closingHour'] },
        { day: 'Thursday', status: row['weeklySchedule/3/status'], openingHour: row['weeklySchedule/3/openingHour'], closingHour: row['weeklySchedule/3/closingHour'] },
        { day: 'Friday', status: row['weeklySchedule/4/status'], openingHour: row['weeklySchedule/4/openingHour'], closingHour: row['weeklySchedule/4/closingHour'] },
        { day: 'Saturday', status: row['weeklySchedule/5/status'], openingHour: row['weeklySchedule/5/openingHour'], closingHour: row['weeklySchedule/5/closingHour'] },
        { day: 'Sunday', status: row['weeklySchedule/6/status'], openingHour: row['weeklySchedule/6/openingHour'], closingHour: row['weeklySchedule/6/closingHour'] },
      ],
    };
  }
}
