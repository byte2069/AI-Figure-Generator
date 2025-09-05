# AI Figure Generator (fixed)
- Client upload via `@vercel/blob/client` **with** `handleUploadUrl: "/api/blob"`
- `/api/blob` uses `handleUpload` to sign and complete uploads (no serverless body limit)
- Default aspect ratio 1:1

## Run
```bash
npm i
echo REPLICATE_API_TOKEN=YOUR_TOKEN > .env.local
npm run dev
```

## Deploy
Add env on Vercel: `REPLICATE_API_TOKEN`.
