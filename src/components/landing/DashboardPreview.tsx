const categories = [
  { name: "Food", amount: 320, color: "bg-budgetu-accent-light", percent: 25 },
  { name: "Rent", amount: 850, color: "bg-budgetu-accent-mid", percent: 66 },
  { name: "Transport", amount: 120, color: "bg-budgetu-accent-deep", percent: 9 },
];

export default function DashboardPreview() {
  return (
    <section>
      {/* Header row */}
      <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-budgetu-heading mb-1">
            Your Dashboard
          </h2>
          <p className="text-sm text-budgetu-muted">February 2026</p>
        </div>
        <div className="grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-right">
          <span className="text-[0.8125rem] text-budgetu-muted">
            Budget remaining
          </span>
          <span className="text-xl font-bold text-budgetu-positive">$435</span>
          <span className="text-[0.8125rem] text-budgetu-muted">
            Total budget
          </span>
          <span className="text-[0.9375rem] font-semibold text-budgetu-heading">
            $2,000
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <div className="bg-budgetu-surface-alt border border-border rounded-xl p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-base font-bold text-budgetu-heading">
              Spending by Category
            </h3>
            <span className="text-budgetu-accent text-base font-semibold">
              $
            </span>
          </div>
          <ul className="space-y-3.5">
            {categories.map((cat) => (
              <li key={cat.name}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-[0.9375rem] font-medium text-budgetu-heading">
                    {cat.name}
                  </span>
                  <span className="text-[0.9375rem] font-medium text-budgetu-heading">
                    ${cat.amount}
                  </span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${cat.color}`}
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Monthly Overview */}
        <div className="bg-budgetu-surface-alt border border-border rounded-xl p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-base font-bold text-budgetu-heading">
              Monthly Overview
            </h3>
            <div className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-budgetu-positive">
              <span aria-hidden>↑</span>
              Spending down 12%
            </div>
          </div>
          <div className="flex gap-3 min-h-[180px]">
            <div className="flex flex-col justify-between text-xs text-budgetu-muted">
              <span>2000</span>
              <span>1500</span>
              <span>1000</span>
            </div>
            <div
              className="flex-1 bg-budgetu-surface border border-dashed border-border rounded-lg"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </section>
  );
}
