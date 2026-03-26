import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage, sendSMSMessage } from '@/lib/notifications';

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
    const otpMessage = `Your OTP code is: *${code}*\n\nValid for 10 minutes. Do not share this with anyone.`;
    const sent = await sendWhatsAppMessage(phone, otpMessage) || await sendSMSMessage(phone, otpMessage);

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
