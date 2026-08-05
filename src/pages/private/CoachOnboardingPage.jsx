import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle, Building2, Loader2, Trophy,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { saveClub } from "../../lib/adminStorage";
import {
  CLUB_AUTO_NIVELES,
  CLUB_AUTO_MATCH_DAYS,
  categoryForNivel,
} from "../../lib/clubAuto/clubAutoCoachBridge";
import TeamBrandingFields, {
  loadCoachBrandingDraft,
  clearCoachBrandingDraft,
} from "../../components/shared/TeamBrandingFields";
import CoachAutoQuestionnaire, {
  questionnaireToCoachConfig,
} from "../../components/shared/CoachAutoQuestionnaire";

const STEPS = ["Tu equipo", "Microciclo", "Confirmar"];

function StepHeader({ current }) {
  return (
    <div className="mb-8 flex items-center justify-between">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                done ? "bg-depro-green text-white" : active ? "bg-depro-blue text-white shadow-depro" : "bg-depro-gray-light text-depro-gray"
              }`}>
                {done ? <CheckCircle size={15} /> : n}
              </div>
              <span className={`text-xs font-bold hidden sm:inline ${active ? "text-depro-dark" : "text-depro-gray"}`}>{label}</span>
            </div>
            {n !== STEPS.length && <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${done ? "bg-depro-green" : "bg-depro-border"}`} />}
          </div>
        );
      })}
    </div>
  );
}

function genId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function initialForm(user) {
  const draft = loadCoachBrandingDraft() || {};
  return {
    teamName: draft.teamHint || draft.clubName || "",
    season: "2025/2026",
    logo: draft.logo || "",
    primaryColor: draft.primaryColor || user?.primaryColor || "#0A36F7",
    secondaryColor: draft.secondaryColor || user?.secondaryColor || "#ffffff",
  };
}

/**
 * Cuestionario corto del documento + escudo/colores del registro.
 * nivel A/B/C · 2/3/4 · días exactos · partido · gimnasio · branding opcional.
 */
export default function CoachOnboardingPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(() => initialForm(user));
  const [autoQ, setAutoQ] = useState({
    nivel: "B",
    dias_entrenamiento_semana: 3,
    dias_exactos_entrenamiento: ["Lunes", "Miércoles", "Viernes"],
    dia_partido: "sabado",
    acceso_gimnasio: "no",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const packedQ = useMemo(() => questionnaireToCoachConfig(autoQ), [autoQ]);
  const step1Valid = form.teamName.trim().length > 0;
  const step2Valid = packedQ.ok;

  const handleConfirm = async () => {
    if (!packedQ.ok) {
      setError(packedQ.errors.join(" "));
      return;
    }
    setSaving(true);
    setError("");
    try {
      const cfg = packedQ.config;
      const clubId = genId("coach_club");
      const teamId = genId("coach_team");
      const category = categoryForNivel(cfg.nivel);

      const club = {
        id: clubId,
        name: `${user?.name || "Entrenador"} · DEPRO Coach`,
        abbreviation: (user?.name || "EC").trim().slice(0, 2).toUpperCase(),
        city: "",
        country: "",
        status: "activo",
        plan: user?.plan || "coach-starter",
        isSoloCoach: true,
        planningMode: "auto",
        mode: "depro",
        coachConfig: cfg,
        logo: form.logo || null,
        primaryColor: form.primaryColor || "#0A36F7",
        secondaryColor: form.secondaryColor || "#ffffff",
        coordinator: null,
        teams: [
          {
            id: teamId,
            name: form.teamName.trim(),
            category,
            season: form.season,
            trainingDays: cfg.dias_exactos_entrenamiento,
            coach: { name: user?.name || "", email: user?.email || "" },
            squad: [],
          },
        ],
        plans: [],
        created_at: new Date().toISOString(),
      };

      await saveClub(club);
      clearCoachBrandingDraft();

      const { error: updErr } = await supabase.auth.updateUser({
        data: { role: "club", clubId, teamId, teamRole: "entrenador" },
      });
      if (updErr) throw updErr;

      await refreshUser();
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setError(e.message || "No se pudo completar el alta. Inténtalo de nuevo.");
      setSaving(false);
    }
  };

  const matchLabel = CLUB_AUTO_MATCH_DAYS.find((m) => m.id === autoQ.dia_partido)?.label || autoQ.dia_partido;
  const nivelLabel = CLUB_AUTO_NIVELES.find((n) => n.id === autoQ.nivel)?.label || autoQ.nivel;

  return (
    <div className="min-h-screen bg-depro-gray-light py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="DEPRO" className="h-7 w-auto" />
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-depro-blue text-white">COACH AUTO</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-depro-border shadow-card p-6 md:p-8">
          <StepHeader current={step} />

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-black text-depro-dark mb-2">Tu equipo</h2>
              <p className="text-depro-gray text-sm mb-6">
                Solo lo esencial. El motor automático genera el microciclo A/B/C según tu calendario.
              </p>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <Building2 size={12} /> Nombre de tu equipo *
                  </label>
                  <input
                    type="text"
                    value={form.teamName}
                    onChange={(e) => set("teamName", e.target.value)}
                    className="admin-input w-full"
                    placeholder="Ej. Juvenil A"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">Temporada</label>
                  <input type="text" value={form.season} onChange={(e) => set("season", e.target.value)} className="admin-input w-full sm:w-48" />
                </div>
                <TeamBrandingFields
                  logo={form.logo || ""}
                  primaryColor={form.primaryColor || "#0A36F7"}
                  secondaryColor={form.secondaryColor || "#ffffff"}
                  title="Escudo y colores del equipo"
                  onChange={(b) => setForm((f) => ({
                    ...f,
                    logo: b.logo,
                    primaryColor: b.primaryColor,
                    secondaryColor: b.secondaryColor,
                  }))}
                />
              </div>
              <div className="mt-8 flex justify-end">
                <button onClick={() => setStep(2)} disabled={!step1Valid} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  Continuar <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-black text-depro-dark mb-2 flex items-center gap-2">
                <Trophy size={22} className="text-depro-blue" /> Tu microciclo
              </h2>
              <p className="text-depro-gray text-sm mb-6">
                Cuestionario corto del documento: nivel, días, partido y gimnasio.
              </p>
              <CoachAutoQuestionnaire value={autoQ} onChange={setAutoQ} />
              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(1)} className="btn-ghost flex items-center gap-2"><ArrowLeft size={16} /> Atrás</button>
                <button onClick={() => setStep(3)} disabled={!step2Valid} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  Continuar <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-black text-depro-dark mb-2">Confirma tu configuración</h2>
              <p className="text-depro-gray text-sm mb-6">
                Activaremos el motor automático: calentamiento → balón → protocolo → tarea principal.
              </p>
              <div className="bg-depro-gray-light rounded-2xl p-5 space-y-2 text-sm">
                <div className="flex justify-between items-center gap-3">
                  <span className="text-depro-gray">Equipo</span>
                  <span className="font-bold text-depro-dark flex items-center gap-2">
                    {form.logo && <img src={form.logo} alt="" className="w-7 h-7 rounded-lg object-contain bg-white border border-depro-border" />}
                    <span className="inline-block w-3 h-3 rounded-full border border-depro-border" style={{ backgroundColor: form.primaryColor || "#0A36F7" }} />
                    {form.teamName}
                  </span>
                </div>
                <div className="flex justify-between"><span className="text-depro-gray">Nivel</span><span className="font-bold text-depro-dark">{nivelLabel}</span></div>
                <div className="flex justify-between"><span className="text-depro-gray">Entrenamientos/semana</span><span className="font-bold text-depro-dark">{autoQ.dias_entrenamiento_semana}</span></div>
                <div className="flex justify-between gap-4"><span className="text-depro-gray shrink-0">Días</span><span className="font-bold text-depro-dark text-right">{(autoQ.dias_exactos_entrenamiento || []).join(", ")}</span></div>
                <div className="flex justify-between"><span className="text-depro-gray">Partido</span><span className="font-bold text-depro-dark">{matchLabel}</span></div>
                <div className="flex justify-between"><span className="text-depro-gray">Gimnasio</span><span className="font-bold text-depro-dark">{autoQ.acceso_gimnasio === "si" ? "Sí" : "No"}</span></div>
                <div className="flex justify-between"><span className="text-depro-gray">Modo</span><span className="font-bold text-depro-blue">Automático</span></div>
              </div>
              {error && (
                <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>
              )}
              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(2)} disabled={saving} className="btn-ghost flex items-center gap-2 disabled:opacity-50"><ArrowLeft size={16} /> Atrás</button>
                <button onClick={handleConfirm} disabled={saving || !packedQ.ok} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Creando panel...</> : <>Crear mi panel <CheckCircle size={16} /></>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
