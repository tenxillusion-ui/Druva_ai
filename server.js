// DRUVA AI backend
// Run: npm install && OPENAI_API_KEY=... npm start
// Keep the API key on the server. Never put it in the Android APK.
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const OpenAI = require('openai');

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(__dirname));

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const PORT = process.env.PORT || 8080;

app.get('/health', (_req, res) => res.json({ ok: true, provider: 'openai' }));

// Text -> Image
app.post('/v1/text-to-image', async (req, res) => {
  try {
    const { prompt, size = '1024x1024', quality = 'auto' } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });
    const result = await client.images.generate({ model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1', prompt, size, quality });
    res.json({ data: result.data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e?.message || 'Image generation failed' });
  }
});

// Image -> Image. The exact image-edit options can evolve with the selected OpenAI image model.
app.post('/v1/image-to-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'image is required' });
    if (!req.body.prompt) return res.status(400).json({ error: 'prompt is required' });
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    const result = await client.images.edit({
      model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
      image: blob,
      prompt: req.body.prompt,
      size: req.body.size || '1024x1024'
    });
    res.json({ data: result.data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e?.message || 'Image edit failed' });
  }
});

// Image -> Video adapter. Video APIs/models can change independently of image APIs.
// Set OPENAI_VIDEO_ENDPOINT to the currently enabled OpenAI video endpoint for your account.
app.post('/v1/image-to-video', upload.single('image'), async (req, res) => {
  if (!process.env.OPENAI_VIDEO_ENDPOINT) {
    return res.status(501).json({ error: 'Video generation is not configured. Set OPENAI_VIDEO_ENDPOINT on the server.' });
  }
  return res.status(501).json({ error: 'Video adapter is ready for the enabled OpenAI video API in your account.' });
});

app.listen(PORT, () => console.log(`DRUVA backend listening on :${PORT}`));
