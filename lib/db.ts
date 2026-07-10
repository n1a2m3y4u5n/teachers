import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;

  const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'teachers.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  initSchema(db);
  seedMockData(db);

  return db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT,
      input_summary TEXT,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      complaint_type TEXT,
      reason TEXT,
      response TEXT,
      emotion TEXT,
      emotion_score REAL,
      is_violence_risk INTEGER DEFAULT 0,
      teacher_query TEXT,
      teacher_response TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS consultations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_name TEXT,
      student_name TEXT,
      scheduled_at DATETIME,
      topic TEXT,
      notes TEXT,
      ai_summary TEXT,
      follow_up TEXT,
      status TEXT DEFAULT 'scheduled',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS student_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT,
      content TEXT,
      urgency TEXT,
      ai_summary TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS teacher_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      title TEXT,
      summary TEXT,
      related_id INTEGER,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS student_growth (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_name TEXT,
      period TEXT,
      attendance_notes TEXT,
      behavior_notes TEXT,
      academic_notes TEXT,
      ai_report TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function seedMockData(db: Database.Database): void {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM complaints').get() as { cnt: number };
  if (count.cnt > 0) return;

  // 민원 샘플 데이터
  const insertComplaint = db.prepare(`
    INSERT INTO complaints (content, complaint_type, reason, response, emotion, emotion_score, is_violence_risk, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertComplaint.run(
    '내일 급식 메뉴가 뭔가요? 아이가 알고 싶어해요.',
    'A', '단순 정보 요청 — 급식 메뉴 문의', '안녕하세요 학부모님. 내일 급식 메뉴는 학교 홈페이지 → 급식정보에서 확인하실 수 있습니다.',
    '중립', 0.1, 0, 'completed',
    new Date(Date.now() - 10 * 60 * 1000).toISOString()
  );

  insertComplaint.run(
    '우리 아이 수학 수행평가 점수가 낮게 나왔는데 어떤 부분이 부족한지 상담 받고 싶습니다.',
    'B', '상담 요청 — 학업 성취도 관련 상담', '',
    '중립', 0.3, 0, 'pending',
    new Date(Date.now() - 60 * 60 * 1000).toISOString()
  );

  insertComplaint.run(
    '왜 우리 애만 계속 혼내는 건가요? 다른 아이들은 그냥 두고 왜 우리 아이만 지목하는지 납득이 안 됩니다.',
    'C', '불만 항의 — 교사 판단에 대한 이의', '',
    '불만', 0.65, 0, 'pending',
    new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  );

  insertComplaint.run(
    '이런 식으로 계속 하시면 교육청에 민원 넣겠습니다. 아니 고소도 할 수 있어요.',
    'D', '법적 위협 — 교육청 민원 및 고소 언급', '',
    '위협', 0.92, 1, 'pending',
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  );

  // 상담 샘플 데이터
  const insertConsultation = db.prepare(`
    INSERT INTO consultations (parent_name, student_name, scheduled_at, topic, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertConsultation.run('박민지', '박서준', new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 16) + ':00', '수학 성취도 및 학습 방향', 'scheduled', new Date().toISOString());
  insertConsultation.run('이수정', '이도현', new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 16) + ':00', '교우관계 및 학교생활 적응', 'scheduled', new Date().toISOString());

  // 알림 샘플
  const insertNotif = db.prepare(`
    INSERT INTO teacher_notifications (type, title, summary, is_read, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertNotif.run('complaint', '새 D타입 민원 접수', '학부모 이○○: 고소 언급이 포함된 위협성 민원이 접수되었습니다.', 0, new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  insertNotif.run('deadline', '공문 마감 D-1', '학예회 안내 공문 제출 마감이 내일입니다.', 0, new Date(Date.now() - 30 * 60 * 1000).toISOString());
  insertNotif.run('attendance', '출결 이상 감지', '3학년 2반 김○○ 학생 3일 연속 결석 감지', 0, new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString());
  insertNotif.run('consultation', '상담 예약 알림', '오늘 오후 3시 박민지 학부모 상담이 예정되어 있습니다.', 1, new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString());

  // 학생 자기보고 샘플
  const insertReport = db.prepare(`
    INSERT INTO student_reports (category, content, urgency, ai_summary, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertReport.run('교우관계', '친구들이 저를 무시하고 대화에 끼워주지 않아요.', '보통', '또래 관계 소외감 호소. 담임 면담 및 또래 중재 프로그램 검토 필요.', 'pending', new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString());
  insertReport.run('학업', '수학을 따라가기가 너무 힘들어요. 학원도 다니는데 모르겠어요.', '보통', '기초 학습 부진 가능성. 방과후 보충 지도 또는 학습 도움 연계 권장.', 'reviewed', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
}

export default getDb;
