FROM node:22-alpine

RUN apk add --no-cache bash curl git python3 make g++

RUN npm install -g clawdbot@latest

ENV HOME=/home/node
WORKDIR /home/node

RUN mkdir -p /home/node/.clawdbot /home/node/clawd \
  && chown -R node:node /home/node

USER node

EXPOSE 18789

CMD ["clawdbot", "gateway", "--port", "18789"]
