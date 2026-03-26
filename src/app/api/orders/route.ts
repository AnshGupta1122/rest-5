import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, customerEmail, customerAddress, tableNumber, type, items, paymentMethod, notes } = body;

    if (!customerName || !customerPhone || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate total from actual menu prices
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({ where: { id: item.id } });
      if (!menuItem) {
        return NextResponse.json({ error: `Menu item not found: ${item.id}` }, { status: 400 });
      }
      if (!menuItem.isAvailable) {
        return NextResponse.json({ error: `${menuItem.name} is currently unavailable` }, { status: 400 });
      }
      totalAmount += menuItem.price * item.quantity;
      orderItems.push({
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        isVeg: menuItem.isVeg,
      });
    }

    const order = await prisma.order.create({
      data: {
        type: type || 'DINE_IN',
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        customerAddress: customerAddress || null,
        tableNumber: tableNumber || null,
        items: JSON.stringify(orderItems),
        totalAmount,
        paymentMethod: paymentMethod || 'UPI',
        notes: notes || null,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const timeFilter = searchParams.get('timeFilter');

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    if (timeFilter) {
      if (timeFilter === 'TODAY') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        where.createdAt = { gte: startOfDay };
      } else if (timeFilter === 'YESTERDAY') {
        const startOfYesterday = new Date();
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        startOfYesterday.setHours(0, 0, 0, 0);
        const endOfYesterday = new Date(startOfYesterday);
        endOfYesterday.setHours(23, 59, 59, 999);
        where.createdAt = { gte: startOfYesterday, lte: endOfYesterday };
      } else if (timeFilter === 'LAST_10_DAYS') {
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
        tenDaysAgo.setHours(0, 0, 0, 0);
        where.createdAt = { gte: tenDaysAgo };
      }
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const ordersWithParsedItems = orders.map((order) => ({
      ...order,
      items: JSON.parse(order.items),
    }));

    return NextResponse.json(ordersWithParsedItems);
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
