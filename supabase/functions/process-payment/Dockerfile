FROM node:18-alpine

WORKDIR /app
COPY . .

RUN apk add --no-cache deno

EXPOSE 8000

CMD ["deno", "run", "--allow-net", "--allow-env", "index.ts"]