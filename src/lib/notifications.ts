export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
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
            body: message,
          },
        }),
      }
    );

    const data = await res.json();
    return !!(data.messages && data.messages[0]?.id);
  } catch (err) {
    console.error('WhatsApp request failed:', err);
    return false;
  }
}

export async function sendSMSMessage(phone: string, message: string): Promise<boolean> {
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
        numbers: phone,
        message: message,
        route: 'q', // or 'v3' / 'otp' based on Fast2SMS plan
        language: 'english',
        flash: '0',
      }),
    });

    const data = await res.json();
    return data.return === true;
  } catch (err) {
    console.error('SMS request failed:', err);
    return false;
  }
}
