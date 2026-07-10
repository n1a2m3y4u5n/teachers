import { NextRequest, NextResponse } from 'next/server';
import { getMealInfo, getSchoolSchedule, isMockData } from '@/lib/neis';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  if (type === 'meal') {
    const date = searchParams.get('date') ?? undefined;
    const data = await getMealInfo(undefined, date);
    return NextResponse.json({ data, isMock: isMockData() });
  }

  if (type === 'schedule') {
    const month = searchParams.get('month') ?? undefined;
    const data = await getSchoolSchedule(undefined, month);
    return NextResponse.json({ data, isMock: isMockData() });
  }

  return NextResponse.json({ error: 'type 파라미터 필요 (meal/schedule)' }, { status: 400 });
}
