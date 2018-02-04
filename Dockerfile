FROM node:9.4.0

# File Author / Maintainer
MAINTAINER Aaron Benton

RUN apt-get install make

# Install app dependencies
COPY package.json /usr/src/package.json
COPY Makefile /usr/src/Makefile
RUN cd /usr/src; make install

# Bundle app source
COPY . /usr/src

WORKDIR /usr/src
RUN make build

ENV PATH=/usr/src/node_modules/.bin:$PATH

EXPOSE  8080

CMD ["make", "start"]
