import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle, Building2, Users, MapPin, Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { saveClub, generateLoginCode } from "../../lib/adminStorage";
import TeamBrandingFields, {
  loadCoachBrandingDraft,
  clearCoachBrandingDraft,
} from "../../components/shared/TeamBrandingFields";
import CoachAutoQuestionnaire, {
  questionnaireToCoachConfig,
} from "../../components/shared/CoachAutoQuestionnaire";
import {
  categoryForNivel,
  CLUB_AUTO_MATCH_DAYS,
  CLUB_AUTO_NIVELES,
} from "../../lib/clubAuto/clubAutoCoachBridge";

const STEPS = ["Tu club", "Primer equipo", "Confirmar"];

function genId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

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

export default function ClubOnboardingPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const brandingDraft = loadCoachBrandingDraft() || {};
  const [form, setForm] = useState({
    clubName: brandingDraft.clubName || user?.clubName || "",
    abbreviation: ((brandingDraft.clubName || user?.clubName || "CLB").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase()) || "CLB",
    city: "",
    country: "España",
    teamName: brandingDraft.teamHint || "",
    season: "2025/2026",
    logo: brandingDraft.logo || "",
    primaryColor: brandingDraft.primaryColor || user?.primaryColor || "#0A36F7",
    secondaryColor: brandingDraft.secondaryColor || user?.secondaryColor || "#ffffff",
  });
  const [autoQ, setAutoQ] = useState({
    nivel: "B",
    dias_entrenamiento_semana: 3,
    dias_exactos_entrenamiento: ["Martes", "Jueves", "Viernes"],
    dia_partido: "sabado",
    acceso_gimnasio: "no",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const packedQ = useMemo(() => questionnaireToCoachConfig(autoQ), [autoQ]);
  const loginCode = generateLoginCode(form.abbreviation);
  const step1Valid = form.clubName.trim().length > 1 && form.abbreviation.trim().length >= 2;
  const step2Valid = form.teamName.trim().length > 0 && packedQ.ok;

  const handleConfirm = async () => {
    if (!packedQ.ok) {
      setError(packedQ.errors.join(" "));
      return;
    }
    setSaving(true);
    setError("");
    try {
      const clubId = genId("club");
      const teamId = genId("team");
      const category = categoryForNivel(packedQ.config.nivel);

      const club = {
        id: clubId,
        name: form.clubName.trim(),
        abbreviation: form.abbreviation.toUpperCase().slice(0, 3),
        city: form.city.trim(),
        country: form.country.trim() || "España",
        status: "activo",
        plan: user?.plan || "club-inicial",
        loginCode,
        login_code: loginCode,
        logo: form.logo || null,
        primaryColor: form.primaryColor || "#0A36F7",
        secondaryColor: form.secondaryColor || "#ffffff",
        planningMode: "auto",
        mode: "depro",
        coachConfig: packedQ.config,
        coordinator: {
          name: user?.name || "",
          email: user?.email || "",
        },
        teams: [
          {
            id: teamId,
            name: form.teamName.trim(),
            category,
            season: form.season,
            trainingDays: packedQ.config.dias_exactos_entrenamiento,
            coach: null,
            squad: [],
          },
        ],
        users: [],
        plans: [],
        created_at: new Date().toISOString(),
      };

      await saveClub(club);
      clearCoachBrandingDraft();

      const { error: updErr } = await supabase.auth.updateUser({
        data: {
          role: "club",
          clubId,
          teamId,
          teamRole: "administrador",
          managedTeamIds: [teamId],
          clubName: form.clubName.trim(),
        },
      });
      if (updErr) throw updErr;

      await refreshUser();
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setError(e.message || "No se pudo completar el alta. Inténtalo de nuevo.");
      setSaving(false);
    }
  };

  const nivelLabel = CLUB_AUTO_NIVELES.find((n) => n.id === autoQ.nivel)?.label || autoQ.nivel;
  const matchLabel = CLUB_AUTO_MATCH_DAYS.find((m) => m.id === autoQ.dia_partido)?.label || autoQ.dia_partido;

  return (
    <div className="min-h-screen bg-depro-gray-light py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="DEPRO" className="h-7 w-auto" />
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-depro-blue text-white">CLUB</span>
          </div>
        </div>

        <div className="bg-white border border-depro-border rounded-2xl p-6 md:p-8 shadow-sm">
          <h1 className="text-2xl font-black text-depro-dark mb-1">Configura tu club</h1>
          <p className="text-sm text-depro-gray mb-6">
            Identidad del club y cuestionario corto del motor automático (nivel, días, partido, gimnasio).
          </p>

          <StepHeader current={step} />

          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-depro-dark font-bold">
                <Building2 size={18} className="text-depro-blue" /> Datos del club
              </div>
              <div>
                <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1">Nombre del club *</label>
                <input
                  className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                  placeholder="Ej. CD Demo Fútbol"
                  value={form.clubName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((f) => ({
                      ...f,
                      clubName: name,
                      abbreviation: f.abbreviation === (user?.clubName || "CLB").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || !f.abbreviation
                        ? (name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "CLB")
                        : f.abbreviation,
                    }));
                  }}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1">Abreviatura *</label>
                  <input
                    maxLength={3}
                    className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                    value={form.abbreviation}
                    onChange={(e) => set("abbreviation", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1">Ciudad</label>
                  <input
                    className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1">País</label>
                  <input
                    className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                    value={form.country}
                    onChange={(e) => set("country", e.target.value)}
                  />
                </div>
              </div>
              <div className="rounded-xl bg-depro-blue/5 border border-depro-blue/15 p-4 flex items-start gap-3">
                <MapPin size={16} className="text-depro-blue mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-depro-dark">Código de club para jugadores</p>
                  <p className="text-xs text-depro-gray mt-0.5">Tus jugadores lo usarán para unirse al club y aplicar el descuento.</p>
                  <p className="mt-2 font-mono text-lg font-black text-depro-blue tracking-wider">{loginCode}</p>
                </div>
              </div>
              <TeamBrandingFields
                logo={form.logo || ""}
                primaryColor={form.primaryColor || "#0A36F7"}
                secondaryColor={form.secondaryColor || "#ffffff"}
                title="Escudo y colores del club"
                onChange={(b) => setForm((f) => ({
                  ...f,
                  logo: b.logo,
                  primaryColor: b.primaryColor,
                  secondaryColor: b.secondaryColor,
                }))}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-depro-dark font-bold">
                <Users size={18} className="text-depro-blue" /> Primer equipo + microciclo
              </div>
              <div>
                <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1">Nombre del equipo *</label>
                <input
                  className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                  placeholder="Ej. Cadete A"
                  value={form.teamName}
                  onChange={(e) => set("teamName", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1">Temporada</label>
                <input
                  className="w-full sm:w-48 border border-depro-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                  value={form.season}
                  onChange={(e) => set("season", e.target.value)}
                />
              </div>
              <div className="border-t border-depro-border pt-5">
                <p className="text-sm font-bold text-depro-dark mb-1">Cuestionario del entrenador</p>
                <p className="text-xs text-depro-gray mb-4">
                  Solo nivel, días, partido y gimnasio. La categoría del equipo se deriva del nivel.
                </p>
                <CoachAutoQuestionnaire value={autoQ} onChange={setAutoQ} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-depro-gray">Revisa los datos antes de activar tu club.</p>
              <div className="rounded-xl border border-depro-border divide-y divide-depro-border">
                <div className="p-4 flex justify-between gap-4">
                  <span className="text-xs font-bold text-depro-gray uppercase">Club</span>
                  <span className="text-sm font-bold text-depro-dark text-right">{form.clubName} ({form.abbreviation})</span>
                </div>
                <div className="p-4 flex justify-between gap-4">
                  <span className="text-xs font-bold text-depro-gray uppercase">Ubicación</span>
                  <span className="text-sm font-medium text-depro-dark text-right">
                    {[form.city, form.country].filter(Boolean).join(", ") || "—"}
                  </span>
                </div>
                <div className="p-4 flex justify-between gap-4">
                  <span className="text-xs font-bold text-depro-gray uppercase">Código jugadores</span>
                  <span className="text-sm font-mono font-black text-depro-blue">{loginCode}</span>
                </div>
                <div className="p-4 flex justify-between gap-4">
                  <span className="text-xs font-bold text-depro-gray uppercase">Equipo</span>
                  <span className="text-sm font-bold text-depro-dark text-right">
                    {form.teamName} · {categoryForNivel(autoQ.nivel)}
                  </span>
                </div>
                <div className="p-4 flex justify-between gap-4">
                  <span className="text-xs font-bold text-depro-gray uppercase">Nivel</span>
                  <span className="text-sm font-medium text-depro-dark text-right">{nivelLabel}</span>
                </div>
                <div className="p-4 flex justify-between gap-4">
                  <span className="text-xs font-bold text-depro-gray uppercase">Entrenos</span>
                  <span className="text-sm font-medium text-depro-dark text-right">
                    {(autoQ.dias_exactos_entrenamiento || []).join(", ")}
                  </span>
                </div>
                <div className="p-4 flex justify-between gap-4">
                  <span className="text-xs font-bold text-depro-gray uppercase">Partido / gym</span>
                  <span className="text-sm font-medium text-depro-dark text-right">
                    {matchLabel} · gym {autoQ.acceso_gimnasio === "si" ? "sí" : "no"}
                  </span>
                </div>
              </div>
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
              )}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-depro-border text-sm font-bold text-depro-gray hover:text-depro-dark"
              >
                <ArrowLeft size={15} /> Atrás
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                type="button"
                disabled={step === 1 ? !step1Valid : !step2Valid}
                onClick={() => setStep((s) => s + 1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold hover:bg-depro-blue-dark disabled:opacity-40"
              >
                Continuar <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={handleConfirm}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold hover:bg-depro-blue-dark disabled:opacity-60"
              >
                {saving ? <><Loader2 size={15} className="animate-spin" /> Activando…</> : <><CheckCircle size={15} /> Activar club</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
