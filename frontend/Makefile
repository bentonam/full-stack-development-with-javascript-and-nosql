.DEFAULT_GOAL:= build
MAKEFLAGS = -j1
PATH := ./node_modules/.bin:$(PATH)
SHELL := /bin/bash
.PHONY: install clean build watch run lint

# install all the things
install:
	@npm install

# remove the contents of dist/* but leave the dist directory
# since it is virtually linked through docker
clean:
	@rm -rf logs dist/*

# build the source files
build:
	@make clean
	@node build/build.js

# When watching for changes we can assume it's a development
# env so build files with source maps
watch:
	@make clean
	@babel app --source-maps --out-dir dist --watch

# use nodemon to start the node process
run:
	@webpack-dev-server --inline --progress --config build/webpack.dev.conf.js

# lint js and vue files
lint:
	@eslint --ext .js,.vue src
