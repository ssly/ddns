#FORM node:lts-alpine3.14
FROM node:lts-alpine3.14

ENV ROOT_PATH=/usr/src/app

# download code
ADD . $ROOT_PATH

# build package
WORKDIR $ROOT_PATH
RUN npm set registry https://registry.npm.taobao.org && \
    npm install --production

ENTRYPOINT ["npm", "start"]