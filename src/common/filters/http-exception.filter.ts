import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception.getStatus ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse = exception.getResponse();
        const message = typeof exceptionResponse === 'string' ? exceptionResponse : exceptionResponse['message'];

        response.status(status).json({
            success: false,
            statusCode: status,
            message,
            error: exceptionResponse['error'] || 'Unknown error',
        });
    }
}
