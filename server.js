const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(__dirname));

const PORT = process.env.PORT || 8080;

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "DRUVA AI" });
});

app.post("/v1/text-to-image", async (req, res) => {
  try {
    const { prompt, size = "1024x1024" } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const HF_TOKEN = process.env.HF_TOKEN;

    if (!HF_TOKEN) {
      return res.status(500).json({
        error: "HF_TOKEN is missing in Render Environment"
      });
    }

    const dimensions = {
      "1024x1024": [1024, 1024],
      "1024x1792": [1024, 1792],
      "1792x1024": [1792, 1024]
    };

    const [width, height] =
      dimensions[size] || dimensions["1024x1024"];

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            width,
            height
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face error:", errorText);

      return res.status(response.status).json({
        error: errorText
      });
    }

    const imageBuffer = Buffer.from(
      await response.arrayBuffer()
    );

    const imageBase64 = imageBuffer.toString("base64");

    res.json({
      data: [
        {
          url: `data:image/png;base64,${imageBase64}`
        }
      ]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message || "Image generation failed"
    });
  }
});

app.listen(PORT, () => {
  console.log(`DRUVA AI running on port ${PORT}`);
});
