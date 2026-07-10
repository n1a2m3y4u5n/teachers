interface TypeBadgeProps {
  type: 'A' | 'B' | 'C' | 'D';
  size?: 'sm' | 'md';
}

const TYPE_CONFIG = {
  A: { label: 'A타입', desc: '정보 요청', className: 'badge-a' },
  B: { label: 'B타입', desc: '상담 요청', className: 'badge-b' },
  C: { label: 'C타입', desc: '불만·항의', className: 'badge-c' },
  D: { label: 'D타입', desc: '법적 위험', className: 'badge-d' },
};

export function TypeBadge({ type, size = 'md' }: TypeBadgeProps) {
  const config = TYPE_CONFIG[type];
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full ${config.className} ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
      }`}
    >
      {config.label}
      {size === 'md' && <span className="font-normal opacity-75">· {config.desc}</span>}
    </span>
  );
}
