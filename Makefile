.DEFAULT_GOAL:= build
MAKEFLAGS = -j1
PATH := ./node_modules/.bin:$(PATH)
SHELL := /bin/bash
.PHONY: install clean build compile watch run

# install all the things
install:
	@npm install

# remove the contents but leave the dist directory is not removed because
# this will break the docker container if it is removed since it is
# virtually linked
clean:
	@rm -rf logs dist/*

# build the source files
build compile:
	@make clean
	@babel app --source-maps --out-dir dist $(args)

# When watching for changes we can assume it's a development env
# so build files with source maps
watch:
	@make clean
	@babel app --source-maps --out-dir dist --watch

# use nodemon to start the node process
run:
	@nodemon -e js -w dist dist/server.js;

# used to watch and start the application, primairly used in our container
run-watch:
	@babel app --source-maps --out-dir dist & make run

# docker stuff because why not
docker-build:
	@docker-compose up -d --build

docker-down:
	@docker-compose down -v

docker-rebuild:
	@make docker-down docker-build

docker-restart:
	@make docker-down docker-up

docker-up:
	@docker-compose up -d
