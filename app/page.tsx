import Link from 'next/link';
import { GraduationCap, FileText, MessageSquare, Shield, ArrowRight, CheckCircle, Clock, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-primary text-lg">Teachers</span>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            교사 포털 시작하기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* 배경 그라디언트 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#1D5A9E] to-[#0D2E5A]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-300 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
          {/* 텍스트 */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse-dot" />
              교육부 교육 공공데이터 AI활용대회 시제품
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              교사가 수업에만
              <br />
              <span className="text-blue-200">집중할 수 있도록</span>
            </h1>
            <p className="text-lg text-blue-100 mb-8 leading-relaxed">
              행정·소통·보호를 AI가 처리합니다.
              <br />
              대한민국 공립 초·중·고 교사 43만 명을 위한 플랫폼.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-semibold text-base hover:bg-blue-50 transition-colors shadow-elevated"
              >
                교사 포털 시작하기
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/admin/document"
                className="flex items-center justify-center gap-2 bg-white/15 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-medium text-base hover:bg-white/25 transition-colors border border-white/20"
              >
                공문 30초 체험
              </Link>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-white/20">
              {[
                { value: '82%', label: '행정 업무 절감' },
                { value: '30초', label: '공문 초안 생성' },
                { value: '4종', label: '법적 보호 문서' },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-blue-200 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 미리보기 카드 */}
          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-semibold text-sm">오늘의 업무 요약</span>
              </div>
              {[
                { icon: '📋', text: '공문 마감 D-1', sub: '학예회 안내 공문', color: 'bg-yellow-500/20 text-yellow-200' },
                { icon: '⚠️', text: '민원 대기 2건', sub: 'B타입 1건, D타입 1건', color: 'bg-red-500/20 text-red-200' },
                { icon: '💬', text: '상담 예약', sub: '오후 3시 박○○ 학부모', color: 'bg-blue-500/20 text-blue-200' },
                { icon: '👤', text: '출결 이상 감지', sub: '3학년 2반 김○○ 3일 연속', color: 'bg-purple-500/20 text-purple-200' },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-3 bg-white/10 rounded-lg px-3 py-2.5">
                  <span className="text-base">{item.icon}</span>
                  <div className="flex-1">
                    <div className="text-white text-xs font-medium">{item.text}</div>
                    <div className="text-blue-200 text-xs">{item.sub}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.color}`}>확인</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 핵심 가치 섹션 */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-text-primary mb-3">교사를 위한 3가지 핵심 AI</h2>
            <p className="text-text-secondary">수업 외 모든 부담을 AI가 처리합니다</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                color: 'bg-blue-50',
                iconColor: 'text-blue-600',
                borderColor: 'border-blue-100',
                title: '공문 30초',
                subtitle: '행정 업무 82% 절감',
                description: '공문 초안, 가정통신문, 수업 지도안, 수행평가 루브릭을 30초 안에 생성합니다. 교육부 공문 규정 완벽 준수.',
                features: ['공문·가정통신문 자동 생성', '수업 지도안 초안', '수행평가 루브릭', '교육자료 큐레이션'],
              },
              {
                icon: MessageSquare,
                color: 'bg-green-50',
                iconColor: 'text-green-600',
                borderColor: 'border-green-100',
                title: '민원 AI 중개',
                subtitle: '교권 침해 사전 차단',
                description: '학부모 민원을 A~D 4가지 유형으로 자동 분류하고 맞춤 대응을 제안합니다. D타입 위협 민원 즉시 감지.',
                features: ['4단계 자동 분류', 'D타입 위협 즉시 감지', '감정 분석 & 쿨다운', '법적 보호 연계'],
              },
              {
                icon: Shield,
                color: 'bg-red-50',
                iconColor: 'text-red-600',
                borderColor: 'border-red-100',
                title: '교사 보호',
                subtitle: '법적 문서 자동화',
                description: '경위서, 증거 목록, 교권보호위원회 신고 초안을 자동으로 생성합니다. 번아웃 지수 실시간 모니터링.',
                features: ['법적 보호 문서 3종', '번아웃 지수 모니터링', '학교 건강 대시보드', '상담사 연결 안내'],
              },
            ].map(card => {
              const Icon = card.icon;
              return (
                <div key={card.title} className={`rounded-2xl p-6 border ${card.borderColor} ${card.color}`}>
                  <div className={`w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-card mb-4`}>
                    <Icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">{card.title}</h3>
                  <p className="text-sm font-medium text-text-secondary mb-3">{card.subtitle}</p>
                  <p className="text-sm text-text-secondary mb-4 leading-relaxed">{card.description}</p>
                  <ul className="space-y-1.5">
                    {card.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs text-text-secondary">
                        <CheckCircle className={`w-3.5 h-3.5 ${card.iconColor} flex-shrink-0`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-elevated border border-border">
            <div className="flex justify-center gap-4 mb-6">
              <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                <Clock className="w-4 h-4 text-primary" />
                <span>하루 평균 <strong className="text-text-primary">2.3시간</strong> 절약</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                <Users className="w-4 h-4 text-primary" />
                <span>교사 <strong className="text-text-primary">43만 명</strong> 대상</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-3">지금 바로 시작하세요</h2>
            <p className="text-text-secondary mb-6">로그인 없이 모든 기능을 체험할 수 있습니다</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-primary-dark transition-colors shadow-elevated"
            >
              교사 포털 시작하기
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-xs text-text-muted mt-4">교육부 교육 공공데이터 AI활용대회 시제품</p>
          </div>
        </div>
      </section>
    </div>
  );
}
