FROM ghcr.io/pnpm/pnpm:12 AS build

WORKDIR /src

COPY .nvmrc ./
RUN pnpm runtime set node "$(cat .nvmrc)" -g

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch

COPY . .
RUN pnpm install --offline --frozen-lockfile && \
  BITCART_ENV=production NODE_OPTIONS=--dns-result-order=ipv4first pnpm nx run @bitcart/checkout:build --skip-nx-cache

FROM nginx:1.29-alpine

COPY apps/checkout/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /src/apps/checkout/dist/client /usr/share/nginx/html

LABEL org.bitcart.image=checkout
ENV BITCART_API_URL=""

EXPOSE 80
