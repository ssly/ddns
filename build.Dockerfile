# FROM 
FROM node:lts-alpine3.14

# install pm2
RUN npm set registry https://registry.npm.taobao.org && \
    npm install -g pm2
