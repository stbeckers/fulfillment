[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest

## Description

Sample application for the coding tasks for Software Engineer Backend @ fulfillmenttools.

## Installation

```bash
$ yarn install
```

## Configuration

To run the application effectively please provide a .env file in the root directory with the following information.

```bash
FULFILLMENT_API_URL=<FULFILLMENTTOOLS_API_URL>
IDENTITY_URL=<AUTHENTICATION_URL_FOR_IDENTITY_TOOLKIT>
CLIENT_ID=<LOGIN>
CLIENT_SECRET=<PASSWORD>
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## Stay in touch

- Author - [Steven Beckers](https://github.com/stbeckers)
