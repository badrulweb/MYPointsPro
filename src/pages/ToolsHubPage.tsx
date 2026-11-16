import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from '../lib/router';

type ToolTab = 'zero-apr' | 'valuations' | 'utilization' | 'optimizer';

export function ToolsHubPage() {
  const [activeTool, setActiveTool] = useState<ToolTab>(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('tool');
    if (t === 'zero-apr' || t === 'valuations' || t === 'utilization' || t === 'optimizer') {
      return t;
    }
    return 'zero-apr';
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('tool');
    if (t === 'zero-apr' || t === 'valuations' || t === 'utilization' || t === 'optimizer') {
      setActiveTool(t);
    }
  }, []);

  // 1. 0% APR Balance Transfer State
  const [btBalance, setBtBalance] = useState(6000);
  const [btCurrentApr, setBtCurrentApr] = useState(23.5);
  const [btPromoMonths, setBtPromoMonths] = useState(18);
  const [btFeePct, setBtFeePct] = useState(3);

  const transferFeeDollars = btBalance * (btFeePct / 100);
  const totalPostFeeBalance = btBalance + transferFeeDollars;
  const safePayMonths = Math.max(1, btPromoMonths - 1);
  const requiredMonthlyBuffer = totalPostFeeBalance / safePayMonths;
  const monthlyRate = btCurrentApr / 100 / 12;
  let simBal = btBalance;
  let cumulativeStandardInterest = 0;
  for (let m = 0; m < safePayMonths && simBal > 0; m++) {
    const interest = simBal * monthlyRate;
    cumulativeStandardInterest += interest;
    simBal = Math.max(0, simBal + interest - requiredMonthlyBuffer);
  }
  const netSavings = Math.max(0, cumulativeStandardInterest - transferFeeDollars);

  // 2. Points & Miles CPP Calculator State
  const [ptsRequired, setPtsRequired] = useState(65000);
  const [cashPrice, setCashPrice] = useState(1680);
  const [awardTaxes, setAwardTaxes] = useState(95);
  const [baselineTarget, setBaselineTarget] = useState(1.85);

  const netCashValue = Math.max(0, cashPrice - awardTaxes);
  const realizedCpp = ptsRequired > 0 ? (netCashValue / ptsRequired) * 100 : 0;
  const cashbackOpportunityCost = ptsRequired * 0.01;
  const valueGainOverCashback = netCashValue - cashbackOpportunityCost;

  // 3. Credit Utilization Simulator State
  const [lines, setLines] = useState([
    { id: 1, name: 'Primary Everyday Line', limit: 6500, balance: 1450 },
    { id: 2, name: 'Travel Rewards Line', limit: 9000, balance: 620 },
    { id: 3, name: 'Legacy Starter Line', limit: 2500, balance: 0 },
  ]);

  const totalLimit = lines.reduce((acc, l) => acc + Math.max(0, l.limit), 0);
  const totalBalance = lines.reduce((acc, l) => acc + Math.max(0, l.balance), 0);
  const aggUtilization = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;
  const maxCardUtil = lines.reduce((max, l) => {
    const u = l.limit > 0 ? (l.balance / l.limit) * 100 : 0;
    return Math.max(max, u);
  }, 0);
  const targetNinePctBalance = totalLimit * 0.089;
  const paydownForOptimal = Math.max(0, totalBalance - targetNinePctBalance);

  // 4. Annual Rewards & Fee Optimizer State
  const [spendDining, setSpendDining] = useState(450);
  const [spendGrocery, setSpendGrocery] = useState(650);
  const [spendTravel, setSpendTravel] = useState(300);
  const [spendOther, setSpendOther] = useState(1200);
  const [travelCreditsUsed, setTravelCreditsUsed] = useState(200);

  const annualDining = spendDining * 12;
  const annualGrocery = spendGrocery * 12;
  const annualTravel = spendTravel * 12;
  const annualOther = spendOther * 12;

  const flat2AnnualNet = (annualDining + annualGrocery + annualTravel + annualOther) * 0.02;
  const tieredCashbackNet =
    Math.min(annualGrocery, 6000) * 0.06 +
    Math.max(0, annualGrocery - 6000) * 0.01 +
    annualDining * 0.03 +
    annualTravel * 0.02 +
    annualOther * 0.015 -
    95;
  const travelEcosystemNet =
    ((annualDining + annualTravel) * 3 + annualGrocery * 2 + annualOther * 1.5) * 0.0185 +
    travelCreditsUsed -
    395;

  const optimizerRank = [
    { label: 'Flat 2% Universal Cashback ($0 Fee)', value: flat2AnnualNet },
    { label: 'Tiered Supermarket & Dining ($95 Fee)', value: tieredCashbackNet },
    { label: 'Transferable Travel Ecosystem ($395 Fee w/ Credits)', value: travelEcosystemNet },
  ].sort((a, b) => b.value - a.value);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
      <div className="pb-8 border-b border-[#E4E7EC]">
        <div className="text-xs font-semibold text-[#9A6F22] mb-2">
          Analytical Toolkit
        </div>
        <h1
          className="font-serif font-semibold text-[#0B192C]"
          style={{ fontSize: 'clamp(2rem, 3.4vw, 2.85rem)' }}
        >
          Credit &amp; Rewards Financial Calculators
        </h1>
        <p className="mt-3 text-base text-[#475569] max-w-2xl">
          Verify promotional debt savings, cents-per-point award value, statement utilization targets, and annual fee break-evens using transparent assumptions.
        </p>

        <div className="mt-7 inline-flex flex-wrap gap-1 p-1 bg-white border border-[#E4E7EC] rounded-xl">
          {[
            { id: 'zero-apr', label: '0% APR Payoff Planner' },
            { id: 'valuations', label: 'Points CPP Calculator' },
            { id: 'utilization', label: 'Utilization Simulator' },
            { id: 'optimizer', label: 'Annual Fee Optimizer' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTool(tab.id as ToolTab)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTool === tab.id
                  ? 'bg-[#0B192C] text-white'
                  : 'text-[#475569] hover:text-[#0B192C]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tool 1: 0% APR Balance Transfer */}
      {activeTool === 'zero-apr' && (
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 card-elevated p-6 sm:p-8 space-y-5">
            <h2 className="font-serif text-xl font-semibold text-[#0B192C]">
              Transfer Inputs
            </h2>
            <div>
              <label className="block text-xs font-medium text-[#475569] mb-1.5">
                Current Revolving Balance ($)
              </label>
              <input
                type="number"
                min={100}
                step={100}
                value={btBalance}
                onChange={(e) => setBtBalance(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm font-mono tabular-nums bg-[#F7F8FA] border border-[#E4E7EC]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1.5">
                  Current APR (%)
                </label>
                <input
                  type="number"
                  min={1}
                  max={36}
                  step={0.5}
                  value={btCurrentApr}
                  onChange={(e) => setBtCurrentApr(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm font-mono tabular-nums bg-[#F7F8FA] border border-[#E4E7EC]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1.5">
                  0% Promo Window (mo)
                </label>
                <input
                  type="number"
                  min={6}
                  max={24}
                  value={btPromoMonths}
                  onChange={(e) => setBtPromoMonths(Number(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm font-mono tabular-nums bg-[#F7F8FA] border border-[#E4E7EC]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#475569] mb-1.5">
                Upfront Balance Transfer Fee (%)
              </label>
              <input
                type="number"
                min={0}
                max={6}
                step={0.5}
                value={btFeePct}
                onChange={(e) => setBtFeePct(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm font-mono tabular-nums bg-[#F7F8FA] border border-[#E4E7EC]"
              />
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#0B192C] text-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-[#E5C17B]">
                Amortization Summary (N − 1 Buffer Rule)
              </div>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-white/15">
                <div>
                  <div className="text-xs text-slate-300">Required Monthly Payment</div>
                  <div className="font-mono text-2xl font-semibold text-white tabular-nums mt-1">
                    ${Math.ceil(requiredMonthlyBuffer).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Clears in {safePayMonths} months
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-300">Upfront Transfer Fee</div>
                  <div className="font-mono text-2xl font-semibold text-white tabular-nums mt-1">
                    ${Math.round(transferFeeDollars).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Post-fee total: ${Math.round(totalPostFeeBalance).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-300">Net Interest Saved</div>
                  <div className="font-mono text-2xl font-semibold text-[#E5C17B] tabular-nums mt-1">
                    ${Math.round(netSavings).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    After deducting {btFeePct}% fee
                  </div>
                </div>
              </div>

              <p className="mt-6 text-sm text-slate-300 leading-relaxed">
                By dividing your post-fee balance (${Math.round(totalPostFeeBalance).toLocaleString()}) across {safePayMonths} billing cycles instead of the full {btPromoMonths} months, you retain a 30-day clearing buffer before standard variable APR interest applies.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <Link
                to="/article/anatomy-of-0-percent-apr-balance-transfers"
                className="font-semibold text-[#E5C17B] hover:underline"
              >
                Read: The Quiet Arithmetic of 0% APR Balance Transfers
              </Link>
              <Link to="/category/zero-apr" className="text-slate-300 hover:text-white">
                0% APR Hub
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tool 2: Points & Miles CPP Calculator */}
      {activeTool === 'valuations' && (
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 card-elevated p-6 sm:p-8 space-y-5">
            <h2 className="font-serif text-xl font-semibold text-[#0B192C]">
              Redemption Parameters
            </h2>
            <div>
              <label className="block text-xs font-medium text-[#475569] mb-1.5">
                Points or Miles Required
              </label>
              <input
                type="number"
                min={1000}
                step={1000}
                value={ptsRequired}
                onChange={(e) => setPtsRequired(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm font-mono tabular-nums bg-[#F7F8FA] border border-[#E4E7EC]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1.5">
                  Cash Fare / Rate ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={cashPrice}
                  onChange={(e) => setCashPrice(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm font-mono tabular-nums bg-[#F7F8FA] border border-[#E4E7EC]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1.5">
                  Award Taxes &amp; Fees ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={awardTaxes}
                  onChange={(e) => setAwardTaxes(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm font-mono tabular-nums bg-[#F7F8FA] border border-[#E4E7EC]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#475569] mb-1.5">
                Target Program Benchmark (¢/pt)
              </label>
              <input
                type="number"
                min={0.4}
                max={5}
                step={0.05}
                value={baselineTarget}
                onChange={(e) => setBaselineTarget(Number(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm font-mono tabular-nums bg-[#F7F8FA] border border-[#E4E7EC]"
              />
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#0B192C] text-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-[#E5C17B]">
                Redemption Yield Audit
              </div>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-white/15">
                <div>
                  <div className="text-xs text-slate-300">Realized Value</div>
                  <div className="font-mono text-2xl font-semibold text-[#E5C17B] tabular-nums mt-1">
                    {realizedCpp.toFixed(2)}¢ / pt
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Target: {baselineTarget.toFixed(2)}¢
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-300">Net Cash Replaced</div>
                  <div className="font-mono text-2xl font-semibold text-white tabular-nums mt-1">
                    ${Math.round(netCashValue).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    After ${awardTaxes} award fees
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-300">Surplus vs. 1¢ Cash</div>
                  <div className="font-mono text-2xl font-semibold text-white tabular-nums mt-1">
                    {valueGainOverCashback >= 0 ? '+' : '-'}$
                    {Math.abs(Math.round(valueGainOverCashback)).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Compared to 1.00¢ cash floor
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-[#132844] border border-white/10 text-sm text-slate-200">
                <strong className="text-[#E5C17B]">Editorial Verdict: </strong>
                {realizedCpp >= baselineTarget
                  ? `Strong redemption (${realizedCpp.toFixed(2)}¢ exceeds your ${baselineTarget.toFixed(2)}¢ benchmark). Proceed with partner transfer once live award space is verified.`
                  : realizedCpp >= 1.25
                  ? `Moderate value (${realizedCpp.toFixed(2)}¢). Compare against a fixed 1.25¢ travel portal checkout where you also earn qualifying flight miles.`
                  : `Below benchmark (${realizedCpp.toFixed(2)}¢). Consider paying the cash fare and preserving points for higher-leverage awards.`}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <Link
                to="/valuations"
                className="font-semibold text-[#E5C17B] hover:underline"
              >
                Inspect Monthly Valuation Index
              </Link>
              <Link
                to="/article/transferable-points-versus-fixed-portals"
                className="text-slate-300 hover:text-white"
              >
                Read Transfer Guide
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tool 3: Credit Utilization Simulator */}
      {activeTool === 'utilization' && (
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 card-elevated p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl font-semibold text-[#0B192C]">
                Revolving Credit Lines
              </h2>
              <button
                type="button"
                onClick={() =>
                  setLines((prev) => [
                    ...prev,
                    { id: Date.now(), name: `Card Line ${prev.length + 1}`, limit: 3000, balance: 0 },
                  ])
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E4E7EC] bg-[#F7F8FA] hover:border-[#C49645] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Line</span>
              </button>
            </div>

            <div className="space-y-4">
              {lines.map((line) => {
                const util = line.limit > 0 ? (line.balance / line.limit) * 100 : 0;
                return (
                  <div
                    key={line.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-4 border-b border-[#F1F5F9]"
                  >
                    <div className="sm:col-span-4">
                      <label className="block text-xs text-[#475569] mb-1">Account Label</label>
                      <input
                        type="text"
                        value={line.name}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((l) => (l.id === line.id ? { ...l, name: e.target.value } : l))
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg text-sm bg-[#F7F8FA] border border-[#E4E7EC]"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs text-[#475569] mb-1">Credit Limit ($)</label>
                      <input
                        type="number"
                        min={100}
                        step={100}
                        value={line.limit}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((l) =>
                              l.id === line.id ? { ...l, limit: Number(e.target.value) || 0 } : l
                            )
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg text-sm font-mono tabular-nums bg-[#F7F8FA] border border-[#E4E7EC]"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs text-[#475569] mb-1">Statement Balance ($)</label>
                      <input
                        type="number"
                        min={0}
                        step={50}
                        value={line.balance}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((l) =>
                              l.id === line.id ? { ...l, balance: Number(e.target.value) || 0 } : l
                            )
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg text-sm font-mono tabular-nums bg-[#F7F8FA] border border-[#E4E7EC]"
                      />
                    </div>
                    <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 pb-1.5">
                      <span className="font-mono text-xs font-semibold tabular-nums text-[#0B192C]">
                        {util.toFixed(1)}%
                      </span>
                      {lines.length > 1 && (
                        <button
                          type="button"
                          aria-label="Remove account line"
                          onClick={() => setLines((prev) => prev.filter((l) => l.id !== line.id))}
                          className="p-1.5 text-[#475569] hover:text-rose-700 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#0B192C] text-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-[#E5C17B]">
                Bureau Reporting Snapshot
              </div>
              <div className="mt-5 space-y-5 pb-6 border-b border-white/15">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-slate-300">Aggregate Utilization</span>
                  <span className="font-mono text-2xl font-semibold tabular-nums text-white">
                    {aggUtilization.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-slate-300">Highest Individual Line</span>
                  <span className="font-mono text-lg font-medium tabular-nums text-white">
                    {maxCardUtil.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-slate-300">Paydown to Reach &lt;9%</span>
                  <span className="font-mono text-lg font-semibold tabular-nums text-[#E5C17B]">
                    ${Math.ceil(paydownForOptimal).toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="mt-5 text-sm text-slate-300 leading-relaxed">
                {aggUtilization < 9 && maxCardUtil < 10
                  ? 'Optimal Zone: Both your aggregate and individual line ratios sit inside the prime scoring bracket (<9%).'
                  : aggUtilization < 30
                  ? `Healthy Range: Paying down $${Math.ceil(paydownForOptimal).toLocaleString()} three days before statement close moves your profile into the peak <9% tier.`
                  : `Elevated Utilization: Ratios above 30% actively weigh down credit scores. Target $${Math.ceil(paydownForOptimal).toLocaleString()} in pre-close payments.`}
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 text-xs">
              <Link
                to="/article/statement-closing-date-utilization-playbook"
                className="font-semibold text-[#E5C17B] hover:underline"
              >
                Read: Statement Closing Date Utilization Playbook
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tool 4: Annual Rewards & Fee Optimizer */}
      {activeTool === 'optimizer' && (
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 card-elevated p-6 sm:p-8 space-y-4">
            <h2 className="font-serif text-xl font-semibold text-[#0B192C]">
              Monthly Household Spend
            </h2>
            {[
              { label: 'Supermarkets & Groceries ($/mo)', val: spendGrocery, set: setSpendGrocery },
              { label: 'Dining & Restaurants ($/mo)', val: spendDining, set: setSpendDining },
              { label: 'Flights, Hotels & Transit ($/mo)', val: spendTravel, set: setSpendTravel },
              { label: 'Bills, Retail & Other ($/mo)', val: spendOther, set: setSpendOther },
              { label: 'Natural Travel Credits Used ($/yr)', val: travelCreditsUsed, set: setTravelCreditsUsed },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-xs font-medium text-[#475569] mb-1">
                  {field.label}
                </label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={field.val}
                  onChange={(e) => field.set(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-lg text-sm font-mono tabular-nums bg-[#F7F8FA] border border-[#E4E7EC]"
                />
              </div>
            ))}
          </div>

          <div className="lg:col-span-7 bg-[#0B192C] text-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-[#E5C17B]">
                Net Annual Archetype Comparison (After Annual Fees)
              </div>
              <div className="mt-6 space-y-5">
                {optimizerRank.map((row, idx) => {
                  const maxNet = Math.max(...optimizerRank.map((r) => r.value), 1);
                  const width = Math.max(8, Math.round((row.value / maxNet) * 100));
                  return (
                    <div key={row.label} className="space-y-1.5">
                      <div className="flex items-baseline justify-between gap-4 text-sm">
                        <span className={idx === 0 ? 'font-semibold text-white' : 'text-slate-300'}>
                          {idx + 1}. {row.label}
                        </span>
                        <span className="font-mono font-semibold tabular-nums text-[#E5C17B]">
                          ${Math.round(row.value).toLocaleString()}/yr
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-[#132844]">
                        <div
                          className={`h-full rounded-full ${idx === 0 ? 'bg-[#C49645]' : 'bg-slate-400'}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-6 text-sm text-slate-300 leading-relaxed">
                Travel ecosystem modeling values flexible transferable points at our conservative 1.85¢ baseline minus a $395 annual fee offset only by credits you confirmed you would spend naturally.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <Link
                to="/article/annual-fee-break-even-framework"
                className="font-semibold text-[#E5C17B] hover:underline"
              >
                Read: Annual Fee Break-Even Framework
              </Link>
              <Link to="/category/cashback" className="text-slate-300 hover:text-white">
                Cashback Hub
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
