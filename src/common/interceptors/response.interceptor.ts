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
                // Separar `message` si existe, o dejarlo como string vacío
                const message = response.message ?? '';

                // Si `data` está definido, lo usamos. Si no, usamos `response` excluyendo `message`
                const { message: _, ...rest } = response; // Excluir `message` de `data`
                const data = Object.keys(rest).length > 0 ? rest : '';

                return {
                    success: true,
                    message,
                    data,
                };
            }),
        );
    }
}
