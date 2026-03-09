const Groq = require("groq-sdk");
const { createClient } = require("@supabase/supabase-js");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { messages, systemPrompt, userId } = req.body;
    if (!messages || !systemPrompt) {
      return res.status(400).json({ error: "Missing messages or systemPrompt" });
    }

    if (userId) {
      const today = new Date().toISOString().split("T")[0];
      const { data: usage } = await supabase
        .from("usage")
        .select("count")
        .eq("user_id", userId)
        .eq("date", today)
        .single();
      const currentCount = usage?.count || 0;
      if (currentCount >= 50) {
        return res.status(429).json({ error: "Limite diário de 50 mensagens atingido. Tente amanhã!" });
      }
      await supabase.from("usage").upsert({
        user_id: userId,
        date: today,
        count: currentCount + 1,
      }, { onConflict: "user_id,date" });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-14),
      ],
      max_tokens: 1024,
      temperature: 0.75,
    });

    const reply = completion.choices[0]?.message?.content || "";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
};
