# Deploy Atomic on Railway

This repository's default Dockerfile target is prepared for a single Railway
service: the React web app, nginx proxy, and Atomic server run together. The
knowledge base remains private to the service by storing SQLite data on a
Railway Volume.

## Railway setup

1. Create an empty Railway project and add a service from your fork and branch.
   Railway detects the root `Dockerfile` automatically.
2. Add a Volume to the service at `/data`. This is required: it stores the
   registry, atoms, embeddings, settings, and API tokens. Run exactly one
   replica while using SQLite.
3. In the service variables, set:

   ```text
   ATOMIC_SETUP_TOKEN=<a long random secret>
   PUBLIC_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
   ```

   Generate a public domain first, then set `PUBLIC_URL` to that domain. It
   enables correct external URLs for OAuth and MCP clients. Keep
   `ATOMIC_SETUP_TOKEN` secret; it is used only to claim a new instance.
4. Configure `/health` as the Railway healthcheck. The container listens on
   Railway's injected `PORT` and forwards the check to Atomic's server.
5. Deploy only when you are ready. Open the generated domain and complete the
   setup wizard with `ATOMIC_SETUP_TOKEN`.

## Operational notes

- SQLite requires the `/data` volume. Do not scale this service above one
  replica or mount the same data volume in a second Atomic process.
- Railway's volume-backed services may have brief downtime during redeploys;
  this protects the database from concurrent writers.
- Configure an AI provider in the Atomic setup wizard after the first start.
  Provider API keys are saved within the private data volume rather than baked
  into the image.
- Back up the `/data` volume before destructive changes. Atomic's bundled
  Litestream configuration can be adapted for off-platform backups if needed.

## Local image validation

```bash
docker build --target railway -t atomic-railway .
docker run --rm -p 8080:8080 -e PORT=8080 -e ATOMIC_SETUP_TOKEN=local-test \
  -v atomic-data:/data atomic-railway
```

Visit `http://localhost:8080/health` to confirm readiness.
