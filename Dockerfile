# ---- 빌드 스테이지 ----
FROM node:20-alpine AS builder

# better-sqlite3 네이티브 모듈 컴파일에 필요한 빌드 도구
RUN apk add --no-cache python3 make g++ libc6-compat

WORKDIR /app

COPY package*.json ./
# 네이티브 모듈을 Linux용으로 재컴파일
RUN npm ci

COPY . .

# 빌드 시 더미 API 키 설정 (런타임엔 시크릿으로 주입됨)
ENV ANTHROPIC_API_KEY=build-placeholder
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---- 런타임 스테이지 ----
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DB_PATH=/data/teachers.db

# standalone 빌드 결과물 복사
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# better-sqlite3 네이티브 모듈 (standalone에 포함되지 않으므로 명시적 복사)
COPY --from=builder /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=builder /app/node_modules/bindings ./node_modules/bindings
COPY --from=builder /app/node_modules/file-uri-to-path ./node_modules/file-uri-to-path

# /data 볼륨 마운트 포인트
RUN mkdir -p /data

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
