export default async function handler(req, res) {
  // Chỉ cho phép phương thức POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  // Lấy API Key từ biến môi trường Vercel
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ reply: "Lỗi: Thiếu GEMINI_API_KEY trong Vercel Environment Variables." });
  }

  try {
    // Gọi API của Google Gemini (Model 1.5 Flash cực nhanh và miễn phí)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are Bitsy, a smart AI Agent for Sahara AI. You help Henry with Web3 and mechatronics. Answer concisely. User says: ${message}`
          }]
        }]
      }),
    });

    const data = await response.json();

    // Kiểm tra nếu có lỗi từ phía Google
    if (data.error) {
      return res.status(500).json({ reply: "Google AI Error: " + data.error.message });
    }

    // Lấy nội dung phản hồi từ cấu trúc dữ liệu của Gemini
    const reply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: reply });

  } catch (error) {
    res.status(500).json({ error: "Không thể kết nối với não bộ Gemini." });
  }
}
