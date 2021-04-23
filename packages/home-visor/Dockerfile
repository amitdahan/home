FROM node:14

WORKDIR /app

COPY yarn.lock .
COPY package.json .

RUN yarn --pure-lockfile

COPY . .

RUN yarn build

EXPOSE 8081
CMD [ "yarn", "run", "start" ]