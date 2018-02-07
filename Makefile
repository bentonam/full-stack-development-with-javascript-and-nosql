.DEFAULT_GOAL:= build
MAKEFLAGS = -j1
PATH := ./node_modules/.bin:$(PATH)
SHELL := /bin/bash
.PHONY: all install clean deep-clean reinstall setup build compile build-source-maps compile-source-maps watch start

all: build test

# normal npm install + install production dependencies only in the dist/node_modules directory
install:
	@npm install

# remove the build and log folders, the dist directory is not removed because this will break the docker container if it is removed since
# it is virtually linked
clean:
	@rm -rf logs dist/*

# remove all files that are ignored by git
deep-clean:
	@make clean
	@rm -rf node_modules/ dist/ npm-debug.log yarn-error.log

# reinstall the node_modules and start with a fresh node build
reinstall setup:
	@make deep-clean install

# build the source files
build compile:
	@make clean
	@babel app --source-maps --out-dir dist $(args)

# When watching for changes we can assume it's a development env
# so build files with source maps
watch:
	@make clean
	@babel app --source-maps --out-dir dist --watch

# start the api and web servers
start:
	@nodemon -e js -w dist dist/index.js;

start-watch:
	@babel app --source-maps --out-dir dist & make start

docker-build:
	@docker-compose up -d --build

docker-destroy:
	@docker-compose down -v

docker-down:
	@docker-compose down

docker-rebuild:
	@make docker-destroy docker-build

docker-restart:
	@make docker-down docker-up

docker-up:
	@docker-compose up -d
