export default async function handler(req, res) {
  const { message } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  try {
    // Sử dụng endpoint v1 và model tiêu chuẩn để tránh lỗi không tìm thấy
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ reply: "Lỗi Google: " + data.error.message });
    }

    const reply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: reply });
  } catch (error) {
    res.status(500).json({ reply: "Lỗi kết nối API." });
  }
}
