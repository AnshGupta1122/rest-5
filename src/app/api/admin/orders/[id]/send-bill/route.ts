import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

async function sendViaWhatsApp(phone: string, text: string): Promise<boolean> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) return false;

  try {
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
            body: text,
          },
        }),
      }
    );

    const data = await res.json();
    if (data.messages && data.messages[0]?.id) return true;
    console.error('WhatsApp error:', JSON.stringify(data));
    return false;
  } catch (err) {
    console.error('WhatsApp request failed:', err);
    return false;
  }
}

async function sendViaFast2SMS(phone: string, text: string): Promise<boolean> {
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
        message: text,
        language: 'english',
        numbers: phone,
        flash: '0',
      }),
    });

    const data = await res.json();
    if (data.return) return true;
    console.error('Fast2SMS error:', data);
    return false;
  } catch (err) {
    console.error('Fast2SMS request failed:', err);
    return false;
  }
}

export async function POST(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    
    // Fetch the order
    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const parsedItems = JSON.parse(order.items);

    const billText = `*Spice Garden - Order Bill*
Order ID: #${order.id.slice(-6).toUpperCase()}
Name: ${order.customerName}
${order.type === 'DINE_IN' ? `Table: ${order.tableNumber}` : `Type: Delivery`}
Status: ${order.status.replace(/_/g, ' ')}

*Items ordered:*
${parsedItems.map((i: any) => `${i.quantity}x ${i.name} - Rs.${i.price * i.quantity}`).join('\n')}

*Total:* Rs.${order.totalAmount}
Payment: ${order.paymentMethod}
Thank you for your order!`;

    // Try sending via available providers (WhatsApp first, then SMS)
    const phone = order.customerPhone.replace(/\D/g, '');
    const sent = await sendViaWhatsApp(phone, billText) || await sendViaFast2SMS(phone, billText);

    if (sent) {
      return NextResponse.json({
        success: true,
        message: 'Bill sent successfully to customer!',
      });
    }

    console.log(`[DEV MODE] Bill for ${phone}:\n${billText}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Bill simulated (Dev Mode). Check console.',
      devMode: true
    });
  } catch (error) {
    console.error('Send bill error:', error);
    return NextResponse.json({ error: 'Failed to send bill' }, { status: 500 });
  }
}
