import { NextRequest, NextResponse } from 'next/server';
import { getIchikaResponse } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { message, data } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'メッセージを入力してください' }, { status: 400 });
    }

    const response = await getIchikaResponse(message, data || []);
    return NextResponse.json({ response });
  } catch (error) {
    console.error('API chat error:', error);
    return NextResponse.json({ error: 'いちかとの通信に失敗しました' }, { status: 500 });
  }
}
