#FORM node:lts-alpine3.14 + pm2
FROM nas.liuxyz.com:3002/base/node:1.0.0

# set env
ENV ROOT_PATH=/usr/src/app

# copy files
ADD dist $ROOT_PATH/dist
ADD package.json $ROOT_PATH
ADD ecosystem.config.js $ROOT_PATH

WORKDIR $ROOT_PATH
RUN npm install --production

# 暴露端口8000
EXPOSE 8000

ENTRYPOINT ["npm", "run", "start:docker"]