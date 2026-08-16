import { NextResponse } from 'next/server';
import { register, collectDefaultMetrics } from 'prom-client';

// Initialize default metrics
collectDefaultMetrics();

export async function GET() {
  try {
    const metrics = await register.metrics();
    return new NextResponse(metrics, {
      headers: {
        'Content-Type': register.contentType,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('Metrics collection error:', error);
    return new NextResponse('Error collecting metrics', { status: 500 });
  }
}
