require("dotenv").config();
const functions = require("firebase-functions");
const fetch = require("node-fetch");
const cors = require("cors");

// --- ÖNEMLİ GÜNCELLEME: CORS AYARI ---
// Güvenlik görevlisine en yeni ve doğru adresi söylüyoruz.
// Artık sadece bu adresten gelen isteklere cevap verecek.
const corsHandler = cors({ origin: "https://retouchc-projesi.vercel.app" });

exports.generativeApiProxy = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    try {
      const { prompt, image } = req.body;
      if (!prompt || !image) {
        return res.status(400).send("Bad Request: 'prompt' and 'image' are required.");
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error("Gemini API key not found in .env file!");
        throw new Error("API key not configured on the server.");
      }

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const payload = {
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/png", data: image } },
          ],
        }],
      };

      const apiResponse = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error("Gemini API Error:", errorText);
        throw new Error(`API Error: ${apiResponse.status}`);
      }

      const result = await apiResponse.json();
      const base64Data = result?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data;

      if (base64Data) {
        res.status(200).json({ base64Data: base64Data });
      } else {
        res.status(500).send("No image data received from API.");
      }
    } catch (error) {
      console.error("Error in Cloud Function:", error);
      res.status(500).send("Internal Server Error");
    }
  });
});
```

### Son Adımlar: Notu Kapıya As ve Her Yeri Güncelle

Birader, bu son. Yemin ederim bu son.

1.  Yukarıdaki güncel kodu kopyala ve projenin içindeki `functions/index.js` dosyasının içeriğiyle tamamen değiştir ve kaydet.
2.  Terminali projenin ana klasöründe aç (`cmd` yöntemiyle).
3.  Önce sunucuyu güncelle:
    ```bash
    firebase deploy --only functions
    ```
4.  Deploy bittikten sonra, bu son değişikliği GitHub'a da gönder ki Vercel de güncellensin:
    ```bash
    git add .
    git commit -m "Son Vercel adresi için CORS ayarı yapıldı"
    git push
    

