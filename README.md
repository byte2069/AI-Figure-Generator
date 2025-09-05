# AI Figure Generator (full)
- Next.js 14 (App Router) + Replicate
- Client upload via `@vercel/blob/client`
- Default aspect ratio 1:1 (UI đã bỏ lựa chọn)

## Run locally
```bash
npm i
echo REPLICATE_API_TOKEN=YOUR_TOKEN > .env.local
npm run dev
```

## Deploy
- Add `REPLICATE_API_TOKEN` in Vercel → Project → Settings → Environment Variables.
- Add your domain (e.g. ai.datnh.info) with CNAME to the Vercel DNS target.
