export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ reply: "Configuration Error: GEMINI_API_KEY is missing on Vercel." });
  }

  try {
    // Using stable v1 endpoint and standard flash model
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `System: You are Bitsy, an AI Agent for Sahara AI. Your tone is professional, witty, and helpful. You are assisting Henry with Web3 and AI infrastructure. Always keep responses concise.
            
            User message: ${message}`
          }]
        }]
      }),
    });

    const data = await response.json();

    // Handle Google API errors
    if (data.error) {
      console.error('Google API Error:', data.error.message);
      return res.status(500).json({ reply: `Google Error: ${data.error.message}` });
    }

    // Safely extract the AI response
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
      const reply = data.candidates[0].content.parts[0].text;
      res.status(200).json({ reply: reply });
    } else {
      res.status(500).json({ reply: "Error: AI failed to generate a response. Please check your API quota." });
    }

  } catch (error) {
    res.status(500).json({ reply: "Connection Error: Failed to reach Google AI services." });
  }
}
