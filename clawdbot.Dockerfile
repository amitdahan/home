FROM node:22-alpine

RUN apk add --no-cache bash curl git python3 make g++

ARG CLAWDBOT_VERSION=2026.1.24-3

ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_AUDIT=false
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_PREFER_OFFLINE=true

RUN npm install -g "clawdbot@${CLAWDBOT_VERSION}"

ENV HOME=/home/node
WORKDIR /home/node

RUN mkdir -p /home/node/.clawdbot /home/node/clawd \
  && chown -R node:node /home/node

USER node

EXPOSE 18789

CMD ["clawdbot", "gateway", "--port", "18789"]
