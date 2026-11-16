import { ArticleChartData } from '../types/publication';

export function ArticleChart({ chart }: { chart: ArticleChartData }) {
  const maxVal = Math.max(...chart.bars.map((b) => b.value), 1);

  return (
    <div className="my-10 bg-white border border-[#E4E7EC] rounded-xl p-6 sm:p-8 shadow-xs">
      <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-[#E4E7EC]">
        <div>
          <span className="text-xs font-mono font-medium text-[#9A6F22] tracking-wide">
            {chart.figureNumber}
          </span>
          <h4 className="font-serif text-xl font-semibold text-[#0B192C] mt-1">
            {chart.title}
          </h4>
          <p className="text-sm text-[#475569] mt-1">{chart.subtitle}</p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {chart.bars.map((bar, idx) => {
          const pct = Math.max(8, Math.round((bar.value / maxVal) * 100));
          const formatted =
            bar.unit === '$'
              ? `$${bar.value.toLocaleString()}`
              : `${bar.value.toLocaleString()}${bar.unit}`;

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-4 text-sm">
                <span className="font-medium text-[#0B192C]">{bar.label}</span>
                <span className="font-mono font-semibold text-[#0B192C] tabular-nums shrink-0">
                  {formatted}
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#F1F5F9] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    idx === chart.bars.length - 1 ? 'bg-[#C49645]' : 'bg-[#0B192C]'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {bar.note && (
                <p className="text-xs text-[#475569]">{bar.note}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
