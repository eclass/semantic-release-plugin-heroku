# @eclass/semantic-release-heroku-deploy

[![npm](https://img.shields.io/npm/v/@eclass/semantic-release-heroku-deploy.svg)](https://www.npmjs.com/package/@eclass/semantic-release-heroku-deploy)
[![build](https://img.shields.io/travis/eclass/semantic-release-heroku-deploy.svg)](https://travis-ci.org/eclass/semantic-release-heroku-deploy)
[![downloads](https://img.shields.io/npm/dt/@eclass/semantic-release-heroku-deploy.svg)](https://www.npmjs.com/package/@eclass/semantic-release-heroku-deploy)
[![dependencies](https://img.shields.io/david/eclass/semantic-release-heroku-deploy.svg)](https://david-dm.org/eclass/semantic-release-heroku-deploy)
[![devDependency Status](https://img.shields.io/david/dev/eclass/semantic-release-heroku-deploy.svg)](https://david-dm.org/eclass/semantic-release-heroku-deploy#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/github/eclass/semantic-release-heroku-deploy/badge.svg?branch=master)](https://coveralls.io/github/eclass/semantic-release-heroku-deploy?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/f84f0bcb39c9a5c5fb99/maintainability)](https://codeclimate.com/github/eclass/semantic-release-heroku-deploy/maintainability)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

> [semantic-release](https://github.com/semantic-release/semantic-release) plugin to deploy apps to heroku via api.

| Step               | Description                                                   |
|--------------------|---------------------------------------------------------------|
| `verifyConditions` | Verify the presence of the `CUSTOM_ENV` environment variable. |
| `publish`          | Deploy app.                                                   |

## Install

```bash
npm i -D @eclass/semantic-release-heroku-deploy
```

## Usage

The plugin can be configured in the [**semantic-release** configuration file](https://github.com/semantic-release/semantic-release/blob/caribou/docs/usage/configuration.md#configuration):

```json
{
  "plugins": [
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git",
    "@semantic-release/gitlab",
    "@eclass/semantic-release-heroku-deploy"
  ]
}
```

## Configuration

### Environment variables

| Variable         | Description                                                       |
| ---------------- | ----------------------------------------------------------------- |
| `HEROKU_API_KEY` | Create a [new authorization](https://dashboard.heroku.com/account/applications/authorizations/new) or use a [personal api key](https://dashboard.heroku.com/account). I recommend using a new authorization. |

### Options

| Variable     | Description                    |
| ------------ | ------------------------------ |
| `appName`    | The heroku app name. Required. |

### Examples

```json
{
  "plugins": [
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git",
    "@semantic-release/gitlab",
    [
      "@eclass/semantic-release-heroku-deploy",
      {
        "appName": "mystic-wind-83"
      }
    ]
  ]
}
```

```yml
# .gitlab-ci.yml
release:
  image: node:alpine
  stage: release
  script:
    - npx semantic-release
  only:
    - master
```

```yml
# .travis.yml
language: node_js
cache:
  directories:
    - ~/.npm
node_js:
  - "12"
stages:
  - test
  - name: deploy
    if: branch = master
jobs:
  include:
    - stage: test
      script: npm t
    - stage: deploy
      script: npx semantic-release

```

## License

[MIT](https://tldrlegal.com/license/mit-license)
