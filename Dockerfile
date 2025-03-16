FROM node:20-alpine AS build

WORKDIR /app

COPY . /app/

RUN npm install -g pnpm \
    && pnpm install --frozen-lockfile \
    && pnpm build


FROM node:20-alpine

EXPOSE 3000

WORKDIR /app

COPY --from=build /app/.output /app/.output
COPY --from=build /app/package.json /app/

CMD ["node", ".output/server/index.mjs"]
