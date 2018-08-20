# recompose

> A simple compose-file finder utility to remove the headache from using docker-compose with a multi-file setup.

## installation

```bash
npm i -g recompose-cli

# or if you prefer yarn

yarn global add recompose-cli
```

## usage

Simply run `recompose` as you would use [docker-compose](https://docs.docker.com/compose/reference/). The only difference is that you no longer have to append a list of `-f` arguments!

Imagine a directory structure like the following. Services are organized in their own directories with each one having their own compose file declaring service-specific dependencies and details.

```
docker-compose.yml
README.md
services/
  gateway/
    docker-compose.yml
    package.json
    src/
      ...
  storage/
    docker-compose.yml
    package.json
    src/
      ...
```

Normally, you would have to run something like

```bash
docker-compose -f docker-compose.yml -f services/gateway/docker-compose.yml -f services/storage/docker-compose.yml up -d
```

but using recompose, you can simply hit

```bash
recompose up -d
```
