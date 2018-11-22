# Grapql Endpoint intallation

This serivce handles all the storge for the application, the position of the buses and the recomendations

## Requirements

1. [NodeJS](https://nodejs.org/en/download/)
2. [Yarn](https://yarnpkg.com/lang/en/)
2. [docker](https://www.docker.com)

## Intallation

To install this project you first need to run the command

`docker-compose up -d`

This will create the prisma server.

Then you need to run

`yarn start`

This will expose the necessary, info for the apps to run on the port 4000.