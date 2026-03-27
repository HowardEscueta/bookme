#!/bin/bash
set -e

PGBIN="/usr/lib/postgresql/15/bin"
PGDATA="/var/lib/postgresql/15/main"

# Ensure log file exists with correct permissions
touch /var/log/postgresql.log
chown postgres:postgres /var/log/postgresql.log

# Ensure run directory exists
mkdir -p /var/run/postgresql
chown postgres:postgres /var/run/postgresql

# Start PostgreSQL using the Debian-packaged config
echo "Starting PostgreSQL..."
su - postgres -c "$PGBIN/pg_ctl -D $PGDATA -o '-c config_file=/etc/postgresql/15/main/postgresql.conf' start -w -l /var/log/postgresql.log"

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
until su - postgres -c "pg_isready -q"; do
  sleep 1
done
echo "PostgreSQL is ready."

# Create user and database if they don't exist
su - postgres -c "psql -tc \"SELECT 1 FROM pg_roles WHERE rolname='bookme'\" | grep -q 1 || psql -c \"CREATE USER bookme WITH PASSWORD 'bookme';\""
su - postgres -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname='bookme'\" | grep -q 1 || psql -c \"CREATE DATABASE bookme OWNER bookme;\""
su - postgres -c "psql -d bookme -c \"GRANT ALL ON SCHEMA public TO bookme;\""

# Run Prisma migrations
echo "Running migrations..."
cd /app
DATABASE_URL="postgresql://bookme:bookme@localhost:5432/bookme?schema=public" npx prisma migrate deploy 2>&1 || echo "No migrations to apply yet."
echo "Migrations done."

# Stop PostgreSQL (supervisord will manage it from here)
su - postgres -c "$PGBIN/pg_ctl -D $PGDATA stop -w"

# Copy static files for standalone mode
cp -r /app/public /app/.next/standalone/public 2>/dev/null || true
cp -r /app/.next/static /app/.next/standalone/.next/static 2>/dev/null || true

# Start supervisord (manages both PostgreSQL and Next.js)
echo "Starting services via supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
