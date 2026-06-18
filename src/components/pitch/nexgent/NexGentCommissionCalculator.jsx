import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Calculator, TrendingUp, Building2, Crown, Globe } from "lucide-react";

const COMMISSION_RATE = 0.07;
const ACCENT = "#0A36F7";

const TIER_ICONS = { segunda: Building2, primera: TrendingUp, elite: Crown, custom: Globe };

function formatEuro(n, locale) {
  return new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function NexGentCommissionCalculator() {
  const { t, i18n } = useTranslation("nexgentPitch");
  const locale = i18n.language?.startsWith("es") ? "es" : "en";

  const tiers = t("commission.tiers", { returnObjects: true });
  const [tierId, setTierId] = useState("primera");
  const [projectValue, setProjectValue] = useState(650000);
  const [includeSetup, setIncludeSetup] = useState(true);
  const [setupFee, setSetupFee] = useState(180000);
  const [annualLicense, setAnnualLicense] = useState(320000);
  const [years, setYears] = useState(3);

  const selectedTier = Array.isArray(tiers) ? tiers.find((t) => t.id === tierId) : null;

  const applyTier = (id) => {
    const tier = tiers?.find((t) => t.id === id);
    if (!tier) return;
    setTierId(id);
    setSetupFee(tier.setupDefault);
    setAnnualLicense(tier.annualDefault);
    setProjectValue(tier.setupDefault + tier.annualDefault * 3);
  };

  const totalContract = useMemo(() => {
    if (includeSetup) return setupFee + annualLicense * years;
    return projectValue;
  }, [includeSetup, setupFee, annualLicense, years, projectValue]);

  const commission = totalContract * COMMISSION_RATE;
  const monthlyEquiv = commission / 12;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: ACCENT }}>
            <Calculator size={20} />
          </div>
          <div>
            <h3 className="font-black text-lg text-gray-900">{t("commission.title")}</h3>
            <p className="text-sm text-gray-500">{t("commission.desc")}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">{t("commission.tierLabel")}</label>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {Array.isArray(tiers) && tiers.map((tier) => {
              const Icon = TIER_ICONS[tier.id] ?? Building2;
              const active = tierId === tier.id;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => applyTier(tier.id)}
                  className={`text-left rounded-xl border p-3 transition-all ${active ? "border-blue-300 bg-blue-50 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <Icon size={16} className={active ? "text-blue-600" : "text-gray-400"} />
                  <div className={`text-xs font-black mt-1.5 ${active ? "text-gray-900" : "text-gray-700"}`}>{tier.name}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{tier.range}</div>
                </button>
              );
            })}
          </div>
          {selectedTier && (
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">{selectedTier.note}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIncludeSetup(true)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${includeSetup ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500"}`}
          >
            {t("commission.modeDetailed")}
          </button>
          <button
            type="button"
            onClick={() => setIncludeSetup(false)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${!includeSetup ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500"}`}
          >
            {t("commission.modeSimple")}
          </button>
        </div>

        {includeSetup ? (
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{t("commission.setup")}</label>
              <input
                type="range"
                min={50000}
                max={2000000}
                step={10000}
                value={setupFee}
                onChange={(e) => setSetupFee(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="text-sm font-black text-gray-900 mt-1">{formatEuro(setupFee, locale)}</div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{t("commission.annual")}</label>
              <input
                type="range"
                min={80000}
                max={1200000}
                step={10000}
                value={annualLicense}
                onChange={(e) => setAnnualLicense(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="text-sm font-black text-gray-900 mt-1">{formatEuro(annualLicense, locale)}{t("commission.perYear")}</div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{t("commission.contractYears")}</label>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="text-sm font-black text-gray-900 mt-1">{years} {t("commission.years")}</div>
            </div>
          </div>
        ) : (
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{t("commission.totalProject")}</label>
            <input
              type="range"
              min={150000}
              max={5000000}
              step={25000}
              value={projectValue}
              onChange={(e) => setProjectValue(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="text-lg font-black text-gray-900 mt-1">{formatEuro(projectValue, locale)}</div>
          </div>
        )}

        <div className="rounded-xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${ACCENT}, #0520a0)` }}>
          <div className="grid sm:grid-cols-3 gap-4 text-center sm:text-left">
            <div>
              <div className="text-xs opacity-80 font-semibold uppercase">{t("commission.totalContract")}</div>
              <div className="text-2xl font-black mt-1">{formatEuro(totalContract, locale)}</div>
            </div>
            <div>
              <div className="text-xs opacity-80 font-semibold uppercase">{t("commission.rate")}</div>
              <div className="text-2xl font-black mt-1">7%</div>
            </div>
            <div className="sm:text-right">
              <div className="text-xs opacity-80 font-semibold uppercase">{t("commission.yourCommission")}</div>
              <div className="text-3xl font-black mt-1 text-green-300">{formatEuro(commission, locale)}</div>
              <div className="text-[10px] opacity-70 mt-1">{t("commission.monthlyEquiv", { amount: formatEuro(monthlyEquiv, locale) })}</div>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 leading-relaxed border-t border-gray-100 pt-4">{t("commission.disclaimer")}</p>
      </div>
    </div>
  );
}
