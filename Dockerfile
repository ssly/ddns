#FORM node:lts-alpine3.14 + pm2
FROM nas.lius.me:3002/build:node

# set env
ENV ROOT_PATH=/usr/src/app

# copy files
ADD dist $ROOT_PATH
ADD package.json $ROOT_PATH
ADD ecosystem.config.js $ROOT_PATH

WORKDIR $ROOT_PATH
RUN npm install --production

ENTRYPOINT ["npm", "start"]