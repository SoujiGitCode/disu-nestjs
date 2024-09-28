# Configuración Inicial

Antes de iniciar la aplicación, asegúrate de completar los siguientes pasos:

## Prerrequisitos
- Tener **Node.js** instalado en tu máquina local (versión 18 o superior).
- Tener **PostgreSQL** instalado y en ejecución en tu máquina local.

## Configuración de la Base de Datos
1. Crear una base de datos en PostgreSQL con el nombre: `disu-nestjs`.

## Creación del Archivo `.env`
1. En la raíz del proyecto, crea un archivo llamado `.env`.
2. Copia y pega la siguiente configuración en el archivo `.env`, completando los valores según tu entorno:

```env
DB_HOST=          # Dirección del host de la base de datos (ej. localhost)
DB_PORT=          # Puerto de la base de datos (ej. 5432)
DB_USERNAME=      # Usuario de la base de datos (ej. postgres)
DB_PASSWORD=      # Contraseña del usuario de la base de datos
DB_DATABASE=disu-nestjs  # Nombre de la base de datos
SENDGRID_API_KEY= # API key de SendGrid para el envío de correos electrónicos
SECRET_KEY_JWT=   # Clave secreta para la firma de los JWT

## Git Clone

https://github.com/SoujiGitCode/disu-nestjs/


## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```


## Postman doc

https://documenter.getpostman.com/view/28256778/2sAXqzVxRM

## Formato de las Respuestas de la API

Las respuestas de la API siguen un formato estándar que incluye los siguientes campos:

- **success**: Indica si la solicitud fue exitosa (`true` o `false`).
- **message**: Proporciona información adicional sobre la respuesta, como errores o confirmaciones.
- **data**: Contiene los datos devueltos por la API. Puede ser `null` en caso de errores o respuestas sin datos adicionales.
- **statusCode** (solo en errores): El código de estado HTTP correspondiente al error.
- **error** (solo en errores): Descripción del error.

