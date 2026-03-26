import { prisma } from '@/lib/prisma';
import { signCustomerToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone, name } = await request.json();

    if (!phone || phone.length < 10) {
      return NextResponse.json({ error: 'Valid phone number is required' }, { status: 400 });
    }

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Find or create customer
    await prisma.customer.upsert({
      where: { phone },
      update: { name: name.trim() },
      create: { phone, name: name.trim() }
    });

    // Sign JWT
    const token = await signCustomerToken({ phone });

    return NextResponse.json({ success: true, token, phone, name: name.trim() });
  } catch (error) {
    console.error('Quick login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
