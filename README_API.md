# DRUVA AI — OpenAI API setup

## 1. Backend
```bash
cd DRUVA_AI
npm install
cp .env.example .env
# Put your OpenAI API key in .env
npm start
```

The Android app must call the deployed backend URL, not OpenAI directly.

## 2. Endpoints
- `POST /v1/text-to-image` JSON `{ "prompt": "...", "size": "1024x1024" }`
- `POST /v1/image-to-image` multipart fields `image`, `prompt`, optional `size`
- `POST /v1/image-to-video` multipart fields `image`, `prompt`; configure the video adapter for the video API/model enabled on your account.

## 3. Security
Never ship `OPENAI_API_KEY` inside the Android app. Put it in the server's secret/environment configuration.

## 4. Limits and billing
OpenAI API usage is subject to the account's billing, rate limits, model availability, and safety policies. DRUVA can add your own per-user credits later.
