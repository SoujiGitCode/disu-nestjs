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

