FROM registry.yc.prod.infra.sravni.market/repub/node/v20-alpine:latest AS base

EXPOSE 9034

WORKDIR /app

COPY package.json yarn.lock ./

# ---- Dependencies ----
FROM base AS build

RUN yarn --ignore-engines --frozen-lockfile
COPY . .
RUN yarn build
RUN yarn --production --ignore-engines

# ---- Release ----
FROM base AS release

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

CMD yarn start:prod
