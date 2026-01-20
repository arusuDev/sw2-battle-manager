// ============================================
// HP/MPバー共通コンポーネント
// ============================================

interface StatBarProps {
  label: string;
  current: number;
  max: number;
  color: string;
  showButtons?: boolean;
  onIncrement?: (delta: number) => void;
  increments?: number[];
  decrements?: number[];
  decrementColor?: string;
  incrementColor?: string;
}

export const StatBar = ({
  label,
  current,
  max,
  color,
  showButtons = false,
  onIncrement,
  increments = [1, 5],
  decrements = [-5, -1],
  decrementColor = 'bg-red-950/50 active:bg-red-800/60 text-red-300',
  incrementColor = 'bg-emerald-950/50 active:bg-emerald-800/60 text-emerald-300',
}: StatBarProps) => {
  const percent = max > 0 ? Math.max(0, (current / max) * 100) : 0;
  
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-0.5">
        <span className="text-stone-500">{label}</span>
        <span className={current <= 0 ? 'text-red-400' : 'text-stone-300'}>
          {current}/{max}
        </span>
      </div>
      <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percent}%` }}
        />
      </div>
      
      {showButtons && onIncrement && (
        <div className="flex gap-1 mt-1">
          {decrements.map(n => (
            <button
              key={n}
              onClick={(e) => {
                e.stopPropagation();
                onIncrement(n);
              }}
              className={`flex-1 py-1 text-xs rounded ${decrementColor}`}
            >
              {n}
            </button>
          ))}
          {increments.map(n => (
            <button
              key={n}
              onClick={(e) => {
                e.stopPropagation();
                onIncrement(n);
              }}
              className={`flex-1 py-1 text-xs rounded ${incrementColor}`}
            >
              +{n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
