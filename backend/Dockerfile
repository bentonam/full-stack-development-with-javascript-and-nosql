FROM node:9.5

# install make
RUN apt-get install make

# Install app dependencies
COPY package.json /usr/src/package.json
COPY package-lock.json /usr/src/package-lock.json
COPY Makefile /usr/src/Makefile
RUN cd /usr/src; make install

# copy the app code and set the work dir
COPY . /usr/src
WORKDIR /usr/src

# add install modules to path
ENV PATH=/usr/src/node_modules/.bin:$PATH

EXPOSE  8081

CMD ["make", "run-watch"]
