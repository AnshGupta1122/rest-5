import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

async function sendViaWhatsApp(phone: string, code: string): Promise<boolean> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) return false;

  try {
    // Format: Indian numbers need 91 prefix without +
    const waNumber = phone.startsWith('91') ? phone : `91${phone}`;

    const res = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: waNumber,
          type: 'text',
          text: {
            body: `Your OTP code is: *${code}*\n\nValid for 10 minutes. Do not share this with anyone.`,
          },
        }),
      }
    );

    const data = await res.json();
    if (data.messages && data.messages[0]?.id) {
      console.log(`OTP sent via WhatsApp to ${phone} (ID: ${data.messages[0].id})`);
      return true;
    }
    console.error('WhatsApp error:', JSON.stringify(data));
    return false;
  } catch (err) {
    console.error('WhatsApp request failed:', err);
    return false;
  }
}

async function sendViaFast2SMS(phone: string, code: string): Promise<boolean> {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) return false;

  try {
    const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message: `Your OTP code is: ${code}. Valid for 10 minutes.`,
        language: 'english',
        numbers: phone,
        flash: '0',
      }),
    });

    const data = await res.json();
    if (data.return) {
      console.log(`OTP sent via Fast2SMS to ${phone}`);
      return true;
    }
    console.error('Fast2SMS error:', data);
    return false;
  } catch (err) {
    console.error('Fast2SMS request failed:', err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone || phone.length < 10) {
      return NextResponse.json({ error: 'Valid phone number is required' }, { status: 400 });
    }

    // Generate a 4-digit OTP
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Set expiration to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Store in database
    await prisma.otpCode.upsert({
      where: { phone },
      update: { code, expiresAt },
      create: { phone, code, expiresAt }
    });

    // Try sending via available providers (WhatsApp first, then SMS)
    const sent = await sendViaWhatsApp(phone, code) || await sendViaFast2SMS(phone, code);

    if (sent) {
      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully to your phone',
      });
    }

    // Fallback: no provider configured or all failed — dev mode
    console.log(`[DEV MODE] Phone OTP for ${phone} is: ${code}`);

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully to your phone',
      mockOtp: code,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
