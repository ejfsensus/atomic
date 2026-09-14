#!/bin/sh
set -eu

port="${PORT:-8080}"
backend_port=8081

case "$port" in
  ''|*[!0-9]*)
    echo "PORT must be a numeric TCP port; received: $port" >&2
    exit 1
    ;;
esac

# Railway attaches the persistent volume after image creation. Make the
# mounted directory writable by the server process before supervisord starts.
chown -R atomic:atomic /data

# Keep nginx on Railway's public PORT and move Atomic to a private port so the
# two processes do not contend for the same socket.
sed -i "s/--port 8080/--port ${backend_port}/" \
  /etc/supervisor/conf.d/supervisord.conf

sed \
  -e "s/__RAILWAY_PORT__/${port}/g" \
  -e "s/__ATOMIC_BACKEND_PORT__/${backend_port}/g" \
  /etc/nginx/templates/atomic.conf.template \
  > /etc/nginx/conf.d/atomic.conf

exec supervisord -c /etc/supervisor/conf.d/supervisord.conf
