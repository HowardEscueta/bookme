FROM node:20-bookworm-slim

# Install PostgreSQL 15 and supervisord
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-15 \
    postgresql-client-15 \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Configure PostgreSQL for local connections
RUN echo "host all all 0.0.0.0/0 md5" >> /etc/postgresql/15/main/pg_hba.conf && \
    sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/15/main/postgresql.conf

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy prisma config and schema, generate client
COPY prisma.config.ts ./
COPY prisma/schema.prisma ./prisma/
COPY .env ./
RUN npx prisma generate

# Copy source code
COPY . .

# Build Next.js
ENV NODE_ENV=production
RUN npm run build

# Copy configs
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 3000

VOLUME ["/var/lib/postgresql/15/main"]

CMD ["/app/start.sh"]
