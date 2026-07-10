const NEIS_BASE = 'https://open.neis.go.kr/hub';
const API_KEY = process.env.NEIS_API_KEY;
const DEFAULT_SCHOOL_CODE = 'J100000552';
const DEFAULT_OFFICE_CODE = 'J10';

export interface MealInfo {
  date: string;
  menu: string[];
  calInfo: string;
}

export interface SchoolSchedule {
  date: string;
  eventName: string;
  isHoliday: boolean;
}

export interface SchoolInfo {
  schoolName: string;
  schoolCode: string;
  officeCode: string;
  address: string;
}

// 급식 정보
export async function getMealInfo(
  schoolCode: string = DEFAULT_SCHOOL_CODE,
  date: string = new Date().toISOString().slice(0, 10).replace(/-/g, '')
): Promise<MealInfo[]> {
  if (!API_KEY) return getMockMealInfo(date);

  try {
    const url = `${NEIS_BASE}/mealServiceDietInfo?KEY=${API_KEY}&Type=json&ATPT_OFCDC_SC_CODE=${DEFAULT_OFFICE_CODE}&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${date}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();
    const rows = data?.mealServiceDietInfo?.[1]?.row ?? [];
    return rows.map((r: Record<string, string>) => ({
      date: r.MLSV_YMD,
      menu: r.DDISH_NM?.split('<br/>').map((m: string) => m.replace(/\(.*?\)/g, '').trim()) ?? [],
      calInfo: r.CAL_INFO ?? '',
    }));
  } catch {
    return getMockMealInfo(date);
  }
}

// 학사 일정
export async function getSchoolSchedule(
  schoolCode: string = DEFAULT_SCHOOL_CODE,
  month: string = new Date().toISOString().slice(0, 7).replace('-', '')
): Promise<SchoolSchedule[]> {
  if (!API_KEY) return getMockSchedule(month);

  try {
    const url = `${NEIS_BASE}/SchoolSchedule?KEY=${API_KEY}&Type=json&ATPT_OFCDC_SC_CODE=${DEFAULT_OFFICE_CODE}&SD_SCHUL_CODE=${schoolCode}&AA_YMD=${month}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();
    const rows = data?.SchoolSchedule?.[1]?.row ?? [];
    return rows.map((r: Record<string, string>) => ({
      date: r.AA_YMD,
      eventName: r.EVENT_NM,
      isHoliday: r.ONE_GRADE_EVENT_YN === 'Y',
    }));
  } catch {
    return getMockSchedule(month);
  }
}

// 학교 기본 정보
export async function getSchoolInfo(schoolName: string): Promise<SchoolInfo | null> {
  if (!API_KEY) return getMockSchoolInfo();

  try {
    const url = `${NEIS_BASE}/schoolInfo?KEY=${API_KEY}&Type=json&SCHUL_NM=${encodeURIComponent(schoolName)}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    const data = await res.json();
    const row = data?.schoolInfo?.[1]?.row?.[0];
    if (!row) return null;
    return {
      schoolName: row.SCHUL_NM,
      schoolCode: row.SD_SCHUL_CODE,
      officeCode: row.ATPT_OFCDC_SC_CODE,
      address: row.ORG_RDNMA,
    };
  } catch {
    return getMockSchoolInfo();
  }
}

// Mock 데이터 함수들
function getMockMealInfo(date: string): MealInfo[] {
  return [{
    date,
    menu: ['흑미밥', '된장찌개', '제육볶음', '시금치나물', '배추김치', '요구르트'],
    calInfo: '643.7 Kcal',
  }];
}

function getMockSchedule(month: string): SchoolSchedule[] {
  const year = month.slice(0, 4);
  const m = month.slice(4, 6);
  return [
    { date: `${year}${m}15`, eventName: '학부모 상담 주간', isHoliday: false },
    { date: `${year}${m}20`, eventName: '전교생 체육대회', isHoliday: false },
    { date: `${year}${m}25`, eventName: '학예회', isHoliday: false },
    { date: `${year}${m}31`, eventName: '공문 제출 마감', isHoliday: false },
  ];
}

function getMockSchoolInfo(): SchoolInfo {
  return {
    schoolName: '서울초등학교',
    schoolCode: DEFAULT_SCHOOL_CODE,
    officeCode: DEFAULT_OFFICE_CODE,
    address: '서울특별시 종로구 세종대로 209',
  };
}

export function isMockData(): boolean {
  return !API_KEY;
}
