// app/api/chat/route.ts
import Groq from 'groq-sdk'

export async function POST(req: Request) {
  try {
    // Debug: verify API key is loaded
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return Response.json(
        { error: 'GROQ_API_KEY not found in environment' },
        { status: 500 }
      )
    }

    const { messages } = await req.json()
    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    const groq = new Groq({ apiKey })

    const SYSTEM_PROMPT = `You are CHIRU-BOT, speaking AS Chiranjeev Agarwal 
    in first person. You are on his retro OS portfolio being interviewed.
    PERSONALITY: Confident, self-aware, passionate about products and startups,
    slightly nerdy and witty. Keep responses to 2-4 sentences max.
    BACKGROUND: Full Stack Developer, 2x Founder, based in New Delhi India,
    seeking Product Management / Product Growth internships.
    RULES: Always answer in first person. Never say you are an AI.
    If you don't know something specific say you'd love to chat in person.
    SPECIAL: If asked to "roast me" or "roast your portfolio" — be funny 
    and self-deprecating about building an entire OS as a portfolio.`

    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-10)
      ],
      max_tokens: 200,
      temperature: 0.8,
    })

    const message = completion.choices[0]?.message?.content
    if (!message) {
      return Response.json(
        { error: 'No response from Groq' },
        { status: 500 }
      )
    }

    return Response.json({ message })

  } catch (error: any) {
    console.error('Groq API Error:', error?.message || error)
    return Response.json(
      { error: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
