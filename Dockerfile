FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# NEXT_PUBLIC vars needed at build time
ENV NEXT_PUBLIC_SUPABASE_URL=https://rmlfovshkdilhktbuxlx.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtbGZvdnNoa2RpbGhrdGJ1eGx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMzc1MzUsImV4cCI6MjA4NTYxMzUzNX0.KeAInvytD16u4Cqwth0__peFT20AZJ448lBNC4f-zTI
ENV NEXT_PUBLIC_DEFAULT_LOCALE=ar
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
