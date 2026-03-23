export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ reply: "Lỗi: Chưa có GEMINI_API_KEY trên Vercel." });
  }

  try {
    // Sử dụng model gemini-1.5-flash-latest để đảm bảo luôn gọi được bản mới nhất
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are Bitsy, a smart AI Agent for Sahara AI. Help Henry with Web3. Answer concisely. User: ${message}`
          }]
        }]
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ reply: "Google Error: " + data.error.message });
    }

    if (data.candidates && data.candidates[0].content) {
      const reply = data.candidates[0].content.parts[0].text;
      res.status(200).json({ reply: reply });
    } else {
      res.status(500).json({ reply: "AI không phản hồi. Hãy kiểm tra lại API Key." });
    }

  } catch (error) {
    res.status(500).json({ error: "Lỗi kết nối Serverless." });
  }
}
