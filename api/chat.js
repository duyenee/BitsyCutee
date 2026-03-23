export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ reply: "Lỗi: Chưa cấu hình GEMINI_API_KEY trên Vercel." });
  }

  try {
    // Sử dụng model 'gemini-1.5-flash' với đường dẫn v1beta chuẩn của Google
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are Bitsy, a smart AI Agent for Sahara AI. Help Henry with Web3. Answer concisely. User message: ${message}`
          }]
        }]
      }),
    });

    const data = await response.json();

    // Nếu vẫn báo lỗi 'not found', hệ thống sẽ tự động thử dùng model 'gemini-pro'
    if (data.error && data.error.message.includes("not found")) {
       const retryUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
       const retryRes = await fetch(retryUrl, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] }),
       });
       const retryData = await retryRes.json();
       if (retryData.candidates) {
         return res.status(200).json({ reply: retryData.candidates[0].content.parts[0].text });
       }
    }

    if (data.error) {
      return res.status(500).json({ reply: `Google AI Error: ${data.error.message}` });
    }

    if (data.candidates && data.candidates[0].content) {
      const reply = data.candidates[0].content.parts[0].text;
      res.status(200).json({ reply: reply });
    } else {
      res.status(500).json({ reply: "AI không trả về nội dung. Hãy kiểm tra lại API Key." });
    }

  } catch (error) {
    res.status(500).json({ error: "Lỗi kết nối Serverless Function." });
  }
}
