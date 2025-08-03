import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Obținerea comenzilor
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*');

    if (error) throw error;

    // Calcularea statisticilor
    const pendingOrders = orders.filter(order => 
      order.status === 'processing'
    ).length;

    return NextResponse.json({
      success: true,
      stats: {
        // Alte statistici...
        pendingOrders: pendingOrders
      }
    });
  } catch (error) {
    console.error('Eroare la obținerea statisticilor:', error);
    return NextResponse.json(
      { success: false, message: 'Eroare la obținerea statisticilor' },
      { status: 500 }
    );
  }
} 