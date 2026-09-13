#!/bin/sh
set -eu

port="${PORT:-8080}"
case "$port" in
  ''|*[!0-9]*)
    echo "PORT must be a numeric TCP port; received: $port" >&2
    exit 1
    ;;
esac

# Railway attaches the persistent volume after image creation. Make the
# mounted directory writable by the server process before supervisord starts.
chown -R atomic:atomic /data

sed "s/__RAILWAY_PORT__/${port}/g" \
  /etc/nginx/templates/atomic.conf.template \
  > /etc/nginx/conf.d/atomic.conf

exec supervisord -c /etc/supervisor/conf.d/supervisord.conf
