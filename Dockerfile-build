#FORM node:lts-alpine3.14 + git + openssh-client
FROM site.lius.me:3000/node-base:v2

ENV GIT_REPO=git@e.coding.net:overstar/me/ddns.git \
    ROOT_PATH=/usr/src/app

# download code
ADD ./config/id_rsa /root/.ssh/
RUN chmod 600 /root/.ssh/id_rsa && \
    echo "HOST e.coding.net">>/root/.ssh/config && \
    echo "  StrictHostKeyChecking no">>/root/.ssh/config
RUN git clone $GIT_REPO $ROOT_PATH

# build package
WORKDIR $ROOT_PATH
RUN npm set registry https://registry.npm.taobao.org && \
    npm install --production

ENTRYPOINT ["npm", "start"]