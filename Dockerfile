#FORM node
FROM node:18-alpine3.18

# set env
ENV ROOT_PATH=/usr/src/app
ENV TZ="Asia/Shanghai"

# copy files
ADD server $ROOT_PATH/server
ADD client $ROOT_PATH/client
ADD package.json $ROOT_PATH
ADD ecosystem.config.cjs $ROOT_PATH

WORKDIR $ROOT_PATH
RUN npm config set registry https://registry.npmmirror.com
RUN npm install --production

# 暴露端口8000
EXPOSE 8000

ENTRYPOINT ["npm", "run", "start:docker"]

# 打包之后不会生成的本地，所以需要 --push 推送到远端
# docker buildx build --platform linux/amd64,linux/arm64 -t ddns:2.0.0 . --builder mybuilder --push

# 检查一下是不是koa包太大，打包出来多了200M