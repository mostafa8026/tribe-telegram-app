# =============================================
# ---          Create deps.json             ---
# --- Remove unnecessary lines like version ---
# =============================================
FROM endeveit/docker-jq AS deps

COPY package.json /tmp

RUN jq '{ dependencies, devDependencies, peerDependencies, scripts: (.scripts | { postinstall }) }' < /tmp/package.json > /tmp/deps.json

# ====================
# --- Build Assets ---
# ====================
FROM node:14.17.1-slim AS assets

RUN apt-get update

WORKDIR /app
COPY --from=deps /tmp/deps.json ./package.json
COPY yarn.lock .
RUN yarn install --frozen-lockfile --non-interactive

COPY apps/api ./apps/api
COPY libs/shared ./libs/shared
COPY libs/tribe-module ./libs/tribe-module
COPY *.json ./
COPY *.js ./

RUN npx nx build api --generatePackageJson

WORKDIR /app/dist/apps/api
RUN cp /app/yarn.lock .

RUN yarn install --frozen-lockfile --non-interactive
RUN yarn add @grpc/proto-loader@^0.6.2 --frozen-lockfile --non-interactive

RUN mkdir -p /assets
RUN cp -R /app/dist/apps/api/* /assets

# ===============
# --- Release ---
# ===============
FROM node:14.17.1-slim
LABEL maintainer="mostafa8026"

RUN apt-get update

RUN mkdir -p /app && \
  chown -R node:node /app

WORKDIR /app
COPY --chown=node:node --from=assets /assets .

USER node

#NODE
EXPOSE 3000

CMD node --trace-warnings ./main.js
