export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ reply: "Thiếu GEMINI_API_KEY trong Vercel Environment Variables." });
  }

  try {
    // Sử dụng endpoint v1 và model gemini-1.5-flash (phiên bản ổn định)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are Bitsy, a smart AI Agent for Sahara AI. Help Henry with Web3. Answer concisely. User: ${message}`
          }]
        }]
      }),
    });

    const data = await response.json();

    // Kiểm tra lỗi từ Google
    if (data.error) {
      return res.status(500).json({ reply: "Google Error: " + data.error.message });
    }

    // Kiểm tra cấu trúc phản hồi
    if (!data.candidates || data.candidates.length === 0) {
      return res.status(500).json({ reply: "AI không thể tạo câu trả lời. Thử lại sau nhé!" });
    }

    const reply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: reply });

  } catch (error) {
    res.status(500).json({ error: "Lỗi kết nối hệ thống." });
  }
}
