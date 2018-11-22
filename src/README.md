# Code

Esta carpeta contiene el código para todas las partes de la arquitectura de la solución, que se detalla [aqui](../docs/architecture.md), a continuación listamos qué contiene cada carpeta

* [`astus-api`](astus-api): Ejemplo e instrucciones para configurar la conexión de Astus a Kinesis
* [`controller-app`](controller-app): Código de aplicación para controladores
* [`departure_api`](departure_api): Código para recomendaciones de despacho con modelo entrenado
* [`graph-endpoint`](graph-endpoint): Maneja la base de datos de Prisma para la posición de los camiones, recomendaciones y tiempos de viaje
* [`travel_times_updater`](travel_times_updater): Script para actualizar los tiempos de viaje en Prisma con el modelo entrenado
* [`user-app`](user-app): Código de aplicación de usuario
* [`wawa-lambda`](wawa-lambda): AWS Lambda para ingestar los datos de Kinesis a Prisma
* [`wawa-lambda-cl-hist`](wawa-lambda-cl-hist`): AWS Lambda para ingestar los datos históricos a Prisma

