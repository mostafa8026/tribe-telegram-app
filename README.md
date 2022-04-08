[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# TribeTelegramApp

This repository integrate Tribe api (https://www.npmjs.com/package/@tribeplatform/gql-client) with telegram.

## How to start developing

Fist copy .env.sample to .env file and fill it with propert values. You can simple create a database and provide it's name inside `TYPEORM_DATABASE`, set `TYPEORM_SYNCHRONIZE` to true and then start the api with `yarn dev` for a dev server. Navigate to http://localhost:3333/. The app will automatically reload if you change any of the source files.

NOTE: use `yarn run commit` to commit your changes. this repo is commitizen friendly.

## Build

Run `yarn build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.
