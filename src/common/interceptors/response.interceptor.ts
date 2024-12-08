import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ApiResponse {
    message?: string;
    data?: any;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
        return next.handle().pipe(
            map((response: ApiResponse) => {
                // Obtener `message` si existe, o dejarlo como string vacío
                const message = response.message ?? '';

                // Si `data` está definido explícitamente, úsalo; si no, devuelve `null` para evitar anidamientos
                const data = response.data !== undefined ? response.data : null;

                // Retornar la estructura final
                return {
                    success: true,
                    message,
                    data,
                };
            }),
        );
    }
}
