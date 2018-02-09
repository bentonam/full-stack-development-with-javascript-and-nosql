FROM node:9.5

# File Author / Maintainer
MAINTAINER Aaron Benton

# Install app dependencies
COPY package.json /usr/frontend/package.json
COPY package-lock.json /usr/frontend/package-lock.json
RUN cd /usr/frontend; npm install

# copy the src
COPY . /usr/frontend

WORKDIR /usr/frontend

ENV NODE_ENV development
ENV PATH=/usr/frontend/node_modules/.bin:$PATH

EXPOSE 8080

CMD ["npm", "run", "dev"]
