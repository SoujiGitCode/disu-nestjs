import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
        return next.handle().pipe(
            map((response) => {
                let message = null;
                let responseData: Record<string, any> = {};

                // Verificar si 'response' es un objeto y tiene una propiedad 'message'
                if (typeof response === 'object' && response !== null) {
                    if ('message' in response) {
                        message = (response as Record<string, unknown>).message;

                        // Si 'response' tiene una propiedad 'data', reemplazarla con su contenido
                        if ('data' in response) {
                            responseData = (response as Record<string, unknown>).data as Record<string, any>;
                        } else {
                            const { message: _, ...rest } = response;
                            responseData = rest;
                        }
                    } else {
                        responseData = response as Record<string, any>;
                    }
                }

                return {
                    success: true,
                    message: message,
                    data: Object.keys(responseData).length > 0 ? responseData : null,
                };
            }),
        );
    }
}
