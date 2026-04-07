import { NextRequest, NextResponse } from 'next/server';
import { getSiteAnalytics } from '@/lib/bigquery';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!startDate || !endDate) {
    return NextResponse.json({ error: '開始日と終了日を指定してください' }, { status: 400 });
  }

  try {
    const data = await getSiteAnalytics(startDate, endDate);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API data error:', error);
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}
