import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { name, email, subject, message } = await req.json()

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  try {
    // Check if Resend API key is available
    const resendKey = process.env.RESEND_API_KEY
    
    if (resendKey) {
      const { Resend } = await import('resend')
      const resend = new Resend(resendKey)

      await resend.emails.send({
        from: 'CHIRU-OS <onboarding@resend.dev>',
        to: 'chiranjeev.agarwal@gmail.com',
        subject: `[CHIRU-OS] ${subject || 'New Contact Message'}`,
        html: `
          <div style="font-family: monospace; background: #0a0f0a; color: #00ff41; padding: 24px; border: 2px solid #00ff41;">
            <h2 style="color: #00ff41; border-bottom: 1px solid #003300; padding-bottom: 12px;">
              📡 NEW TRANSMISSION FROM CHIRU-OS
            </h2>
            <p><strong style="color: #ffb300;">FROM:</strong> ${name} (${email})</p>
            <p><strong style="color: #ffb300;">SUBJECT:</strong> ${subject || 'No subject'}</p>
            <hr style="border: 1px solid #003300; margin: 16px 0;" />
            <div style="color: #00b32c; white-space: pre-wrap;">${message}</div>
            <hr style="border: 1px solid #003300; margin: 16px 0;" />
            <p style="color: #004400; font-size: 12px;">
              Sent from CHIRU-OS Portfolio • ${new Date().toISOString()}
            </p>
          </div>
        `
      })
    } else {
      // No API key — just log
      console.log('[CONTACT] Email would be sent:', { name, email, subject, message })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[CONTACT] Email error:', error)
    // Still return success so user has good UX
    return NextResponse.json({ success: true })
  }
}
