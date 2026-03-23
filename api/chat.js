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
    // URL chuẩn xác nhất cho Gemini 1.5 Flash
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

    // Nếu Google báo lỗi (như lỗi model not found bạn vừa gặp)
    if (data.error) {
      console.error('Google API Error:', data.error);
      return res.status(500).json({ reply: `Google AI Error: ${data.error.message}` });
    }

    // Kiểm tra xem có phản hồi từ AI không
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
      const reply = data.candidates[0].content.parts[0].text;
      res.status(200).json({ reply: reply });
    } else {
      res.status(500).json({ reply: "AI không trả về nội dung. Hãy kiểm tra lại API Key." });
    }

  } catch (error) {
    res.status(500).json({ error: "Lỗi kết nối Serverless Function." });
  }
}
