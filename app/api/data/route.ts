import { NextRequest, NextResponse } from 'next/server';
import { getSiteAnalytics, getPageAnalytics } from '@/lib/bigquery';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!startDate || !endDate) {
    return NextResponse.json({ error: '開始日と終了日を指定してください' }, { status: 400 });
  }

  try {
    const [siteStats, pageStats] = await Promise.all([
      getSiteAnalytics(startDate, endDate),
      getPageAnalytics(startDate, endDate)
    ]);
    return NextResponse.json({ siteStats, pageStats });
  } catch (error) {
    console.error('API data error:', error);
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}
