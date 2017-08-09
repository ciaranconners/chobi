# Chobi

> Supercharged Photo Album
http://159.203.128.16:8080/

## Team

  - __Product Owner__: Scott Rudiger
  - __Scrum Master__: Kenneth Marshall
  - __Development Team Members__: Kevin MacFarlane, Placid Rodrigues

## Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Tasks](#tasks)
1. [Team](#team)
1. [Contributing](#contributing)

## Usage

> Some usage instructions

## Requirements

- Node 3.x
- Mongod 3.2.13
- Webpack
- Bower


## Development

### Installing Dependencies

From within the root directory:

```sh
sudo npm install -g bower
npm run bundle
```

### Start nodemon

```sh
npm run start-dev
```

## Legacy Group Instructions

> - Sign up for a Cloudinary API key
> - Create a mongoose URI
> - Create a config-env.js file in server/lib/ and enter credentials, e.g.:

```sh
exports.cloudinary = {
  NAME: '',
  API_KEY: '',
  API_SECRET: '',
};

exports.mongooseUri = 'mongodb://localhost/example';
```

### Roadmap

View the project roadmap [here](https://github.com/hrr24-gallifrey/chobi/issues)


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
