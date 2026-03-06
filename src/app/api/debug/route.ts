export async function GET() {
  const apiKey = process.env.GROQ_API_KEY
  
  return Response.json({
    hasKey: !!apiKey,
    keyPrefix: apiKey ? apiKey.substring(0, 8) : 'NOT FOUND',
    keyLength: apiKey ? apiKey.length : 0,
    nodeEnv: process.env.NODE_ENV
  })
}
