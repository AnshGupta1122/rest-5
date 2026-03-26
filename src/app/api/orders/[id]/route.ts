import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage, sendSMSMessage } from '@/lib/notifications';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, isPaid } = body;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (isPaid !== undefined) updateData.isPaid = isPaid;

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    // Trigger notification if status changed to OUT_FOR_DELIVERY
    if (status === 'OUT_FOR_DELIVERY') {
      const orderIdShort = id.slice(-6).toUpperCase();
      const message = `*Order Update: OUT FOR DELIVERY* 🛵\n\nHi ${order.customerName}, your order *#${orderIdShort}* is out for delivery! Our rider is on the way. 🍱\n\nTrack your order here: ${process.env.NEXT_PUBLIC_BASE_URL}/orders/${id}`;
      
      // Try WhatsApp first, then SMS
      await sendWhatsAppMessage(order.customerPhone, message) || await sendSMSMessage(order.customerPhone, message);
    }

    return NextResponse.json({
      ...order,
      items: JSON.parse(order.items),
    });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...order,
      items: JSON.parse(order.items),
    });
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
