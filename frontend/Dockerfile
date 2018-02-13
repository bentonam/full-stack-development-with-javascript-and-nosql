FROM node:9.5

# install make
RUN apt-get install make

# Install app dependencies
COPY package.json /usr/frontend/package.json
COPY package-lock.json /usr/frontend/package-lock.json
COPY Makefile /usr/frontend/Makefile
RUN cd /usr/frontend; make install

# copy the app code and set the work dir
COPY . /usr/frontend
WORKDIR /usr/frontend

# add installed modules to path
ENV NODE_ENV development
ENV PATH=/usr/frontend/node_modules/.bin:$PATH

EXPOSE 8080

CMD ["make", "run"]
