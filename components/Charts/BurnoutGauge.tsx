'use client';

interface BurnoutGaugeProps {
  value: number;
  size?: number;
}

export function BurnoutGauge({ value, size = 200 }: BurnoutGaugeProps) {
  const radius = (size / 2) - 20;
  const circumference = radius * Math.PI * 2;
  const dashOffset = circumference * (1 - value / 100);

  const color = value < 40 ? '#22C55E' : value < 70 ? '#F59E0B' : '#EF4444';
  const label = value < 40 ? '안정' : value < 70 ? '주의' : '위험';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* 배경 트랙 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="16"
          />
          {/* 진행 아크 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s' }}
          />
        </svg>
        {/* 중앙 수치 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{value}</span>
          <span className="text-xs font-semibold" style={{ color }}>{label}</span>
          <span className="text-xs text-text-muted">/ 100</span>
        </div>
      </div>
    </div>
  );
}
