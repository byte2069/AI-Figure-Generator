# AI Figure Generator (clientToken version)

- Client upload uses `clientToken` flow (GET /api/blob → { clientToken } → upload)
- `/api/blob` returns signed token for @vercel/blob/client
- Default aspect ratio = 1:1

## Run
```bash
npm i
echo REPLICATE_API_TOKEN=YOUR_TOKEN > .env.local
npm run dev
```

## Deploy
- Add env var `REPLICATE_API_TOKEN` in Vercel project settings.
- Deploy project. Upload image ≤15MB works.
