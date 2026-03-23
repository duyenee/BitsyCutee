export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

  if (!TOGETHER_API_KEY) {
    return res.status(500).json({ reply: "Configuration Error: TOGETHER_API_KEY is missing." });
  }

  try {
    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOGETHER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3-70b-chat-hf",
        messages: [
          {
            role: "system",
            content: "You are Bitsy, a smart AI Agent for Sahara AI. Your tone is professional, witty, and helpful. You are assisting Henry with Web3 and AI infrastructure. Always keep responses concise and in English."
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 512,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        repetition_penalty: 1
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ reply: `Together AI Error: ${data.error.message}` });
    }

    const reply = data.choices[0].message.content;
    res.status(200).json({ reply: reply });

  } catch (error) {
    res.status(500).json({ reply: "Connection Error: Failed to reach Together AI services." });
  }
}
