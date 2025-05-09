FROM node:22-slim AS base
# ENV PNPM_HOME="/pnpm"
# ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm cli build:prod
ENV NODE_OPTIONS --max_old_space_size=8192
RUN pnpm core build:prod
CMD ["node", "/app/packages/cli/dist/cli.js"]
