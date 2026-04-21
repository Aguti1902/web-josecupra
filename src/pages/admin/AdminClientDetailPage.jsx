import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Video,
  FileText,
  MessageSquare,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Upload,
  ChevronDown,
  ChevronUp,
  Star,
  Save,
  Clock,
  Target,
  Flame,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

/* ── Helpers ─────────────────────────────────────────────────────── */
const INTENSITY_OPTIONS = ["Low", "Medium", "High", "Maximum"];
const TYPE_OPTIONS = ["Technical", "Physical", "Tactical", "Recovery", "Match"];
const typeColor = {
  Technical: "#0ea5e9",
  Physical: "#f59e0b",
  Recovery: "#22c55e",
  Tactical: "#a855f7",
  Match: "#ef4444",
};
const intensityColor = {
  Low: "#22c55e",
  Medium: "#f59e0b",
  High: "#ef4444",
  Maximum: "#dc2626",
};

/* ── WEEK PLAN TAB ───────────────────────────────────────────────── */
function PlanTab({ clientId }) {
  const { clientPlans, updateSession, addSession, deleteSession, addExercise, updateExercise, deleteExercise } = useAdmin();
  const plan = clientPlans[clientId] || [];
  const [selectedDay, setSelectedDay] = useState(0);
  const [editingSession, setEditingSession] = useState(null); // { dayIdx, sessionIdx }
  const [editingExercise, setEditingExercise] = useState(null); // { dayIdx, sessionIdx, exIdx }
  const [expandedSession, setExpandedSession] = useState(null);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(null); // sessionIdx

  const [sessionDraft, setSessionDraft] = useState({});
  const [exerciseDraft, setExerciseDraft] = useState({});
  const [newSession, setNewSession] = useState({
    title: "",
    duration: "60 min",
    intensity: "Medium",
    type: "Technical",
    objective: "",
    status: "upcoming",
    exercises: [],
  });
  const [newExercise, setNewExercise] = useState({
    name: "",
    duration: "15 min",
    sets: "3",
    reps: "5",
    description: "",
    tips: "",
    videoUrl: "",
  });

  const day = plan[selectedDay];

  const startEditSession = (dayIdx, sessionIdx) => {
    const s = plan[dayIdx].sessions[sessionIdx];
    setSessionDraft({ ...s });
    setEditingSession({ dayIdx, sessionIdx });
  };

  const saveSession = () => {
    updateSession(clientId, editingSession.dayIdx, editingSession.sessionIdx, sessionDraft);
    setEditingSession(null);
  };

  const startEditExercise = (dayIdx, sessionIdx, exIdx) => {
    const ex = plan[dayIdx].sessions[sessionIdx].exercises[exIdx];
    setExerciseDraft({ ...ex });
    setEditingExercise({ dayIdx, sessionIdx, exIdx });
  };

  const saveExercise = () => {
    updateExercise(clientId, editingExercise.dayIdx, editingExercise.sessionIdx, editingExercise.exIdx, exerciseDraft);
    setEditingExercise(null);
  };

  const handleAddSession = () => {
    addSession(clientId, selectedDay, { ...newSession });
    setNewSession({ title: "", duration: "60 min", intensity: "Medium", type: "Technical", objective: "", status: "upcoming", exercises: [] });
    setShowAddSession(false);
  };

  const handleAddExercise = (sessionIdx) => {
    addExercise(clientId, selectedDay, sessionIdx, { ...newExercise });
    setNewExercise({ name: "", duration: "15 min", sets: "3", reps: "5", description: "", tips: "", videoUrl: "" });
    setShowAddExercise(null);
  };

  return (
    <div className="space-y-6">
      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {plan.map((d, i) => (
          <button
            key={d.shortDay}
            onClick={() => { setSelectedDay(i); setExpandedSession(null); setShowAddSession(false); }}
            className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl border transition-all ${
              selectedDay === i
                ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                : "border-white/10 text-gray-400 hover:text-white bg-gray-900/50"
            }`}
          >
            <span className="text-xs font-bold">{d.shortDay}</span>
            <span className="text-xs">{d.date}</span>
            <span className="text-xs text-gray-600">{d.sessions.length} session{d.sessions.length !== 1 ? "s" : ""}</span>
          </button>
        ))}
      </div>

      {/* Day header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white text-lg">{day?.day} <span className="text-gray-500 font-normal text-sm">— {day?.date}</span></h3>
        <button
          onClick={() => setShowAddSession(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-sm font-semibold transition-all"
        >
          <Plus size={15} /> Add Session
        </button>
      </div>

      {/* Add session form */}
      {showAddSession && (
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 space-y-4">
          <h4 className="font-semibold text-white">New Session</h4>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              placeholder="Session title"
              value={newSession.title}
              onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
              className="admin-input"
            />
            <input
              placeholder="Duration (e.g. 90 min)"
              value={newSession.duration}
              onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })}
              className="admin-input"
            />
            <select
              value={newSession.type}
              onChange={(e) => setNewSession({ ...newSession, type: e.target.value })}
              className="admin-input"
            >
              {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              value={newSession.intensity}
              onChange={(e) => setNewSession({ ...newSession, intensity: e.target.value })}
              className="admin-input"
            >
              {INTENSITY_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <textarea
            placeholder="Session objective"
            rows={2}
            value={newSession.objective}
            onChange={(e) => setNewSession({ ...newSession, objective: e.target.value })}
            className="admin-input w-full resize-none"
          />
          <div className="flex gap-2">
            <button onClick={handleAddSession} className="admin-btn-primary flex items-center gap-2">
              <Check size={15} /> Add Session
            </button>
            <button onClick={() => setShowAddSession(false)} className="admin-btn-ghost flex items-center gap-2">
              <X size={15} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sessions */}
      {day?.sessions.length === 0 && !showAddSession && (
        <div className="text-center py-10 text-gray-500">
          No sessions this day. Add one above.
        </div>
      )}

      {day?.sessions.map((session, sIdx) => {
        const isEditing = editingSession?.dayIdx === selectedDay && editingSession?.sessionIdx === sIdx;
        const isExpanded = expandedSession === sIdx;
        const color = typeColor[session.type] || "#a855f7";

        return (
          <div key={session.id} className="rounded-2xl border border-white/10 bg-gray-900/50 overflow-hidden">
            {/* Session header */}
            <div className="flex items-center gap-3 p-4">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="grid sm:grid-cols-2 gap-2">
                      <input
                        value={sessionDraft.title}
                        onChange={(e) => setSessionDraft({ ...sessionDraft, title: e.target.value })}
                        className="admin-input text-sm"
                        placeholder="Title"
                      />
                      <input
                        value={sessionDraft.duration}
                        onChange={(e) => setSessionDraft({ ...sessionDraft, duration: e.target.value })}
                        className="admin-input text-sm"
                        placeholder="Duration"
                      />
                      <select
                        value={sessionDraft.type}
                        onChange={(e) => setSessionDraft({ ...sessionDraft, type: e.target.value })}
                        className="admin-input text-sm"
                      >
                        {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <select
                        value={sessionDraft.intensity}
                        onChange={(e) => setSessionDraft({ ...sessionDraft, intensity: e.target.value })}
                        className="admin-input text-sm"
                      >
                        {INTENSITY_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                    <textarea
                      value={sessionDraft.objective}
                      onChange={(e) => setSessionDraft({ ...sessionDraft, objective: e.target.value })}
                      className="admin-input w-full resize-none text-sm"
                      rows={2}
                      placeholder="Objective"
                    />
                    <div className="flex gap-2">
                      <button onClick={saveSession} className="admin-btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3">
                        <Save size={13} /> Save
                      </button>
                      <button onClick={() => setEditingSession(null)} className="admin-btn-ghost flex items-center gap-1.5 text-xs py-1.5 px-3">
                        <X size={13} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: color + "20", color }}>
                        {session.type}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: intensityColor[session.intensity] + "20", color: intensityColor[session.intensity] }}>
                        {session.intensity}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={11} />{session.duration}</span>
                    </div>
                    <div className="font-semibold text-white">{session.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{session.objective}</div>
                  </div>
                )}
              </div>
              {!isEditing && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => startEditSession(selectedDay, sIdx)}
                    className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => deleteSession(clientId, selectedDay, sIdx)}
                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={() => setExpandedSession(isExpanded ? null : sIdx)}
                    className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              )}
            </div>

            {/* Exercises */}
            {isExpanded && (
              <div className="border-t border-white/5 p-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Exercises ({session.exercises.length})</span>
                  <button
                    onClick={() => setShowAddExercise(sIdx)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/20 font-semibold transition-all"
                  >
                    <Plus size={12} /> Add Exercise
                  </button>
                </div>

                {session.exercises.map((ex, eIdx) => {
                  const isEditingEx =
                    editingExercise?.dayIdx === selectedDay &&
                    editingExercise?.sessionIdx === sIdx &&
                    editingExercise?.exIdx === eIdx;

                  return (
                    <div key={eIdx} className="bg-gray-800/60 rounded-xl p-3 border border-white/5">
                      {isEditingEx ? (
                        <div className="space-y-2">
                          <div className="grid sm:grid-cols-2 gap-2">
                            <input
                              value={exerciseDraft.name}
                              onChange={(e) => setExerciseDraft({ ...exerciseDraft, name: e.target.value })}
                              className="admin-input text-sm"
                              placeholder="Exercise name"
                            />
                            <input
                              value={exerciseDraft.duration}
                              onChange={(e) => setExerciseDraft({ ...exerciseDraft, duration: e.target.value })}
                              className="admin-input text-sm"
                              placeholder="Duration"
                            />
                            <input
                              value={exerciseDraft.sets}
                              onChange={(e) => setExerciseDraft({ ...exerciseDraft, sets: e.target.value })}
                              className="admin-input text-sm"
                              placeholder="Sets"
                            />
                            <input
                              value={exerciseDraft.reps}
                              onChange={(e) => setExerciseDraft({ ...exerciseDraft, reps: e.target.value })}
                              className="admin-input text-sm"
                              placeholder="Reps / duration"
                            />
                          </div>
                          <textarea
                            value={exerciseDraft.description}
                            onChange={(e) => setExerciseDraft({ ...exerciseDraft, description: e.target.value })}
                            className="admin-input w-full resize-none text-sm"
                            rows={2}
                            placeholder="Description"
                          />
                          <textarea
                            value={exerciseDraft.tips}
                            onChange={(e) => setExerciseDraft({ ...exerciseDraft, tips: e.target.value })}
                            className="admin-input w-full resize-none text-sm"
                            rows={2}
                            placeholder="Coaching tips"
                          />
                          <input
                            value={exerciseDraft.videoUrl}
                            onChange={(e) => setExerciseDraft({ ...exerciseDraft, videoUrl: e.target.value })}
                            className="admin-input text-sm"
                            placeholder="Video URL (YouTube, Vimeo...)"
                          />
                          <div className="flex gap-2">
                            <button onClick={saveExercise} className="admin-btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3">
                              <Save size={13} /> Save
                            </button>
                            <button onClick={() => setEditingExercise(null)} className="admin-btn-ghost flex items-center gap-1.5 text-xs py-1.5 px-3">
                              <X size={13} /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 flex-shrink-0 mt-0.5">
                            {eIdx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white text-sm">{ex.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {ex.duration} · {ex.sets} sets · {ex.reps}
                            </div>
                            {ex.description && (
                              <div className="text-xs text-gray-400 mt-1 leading-relaxed">{ex.description}</div>
                            )}
                            {ex.tips && (
                              <div className="text-xs text-purple-300 mt-1">💡 {ex.tips}</div>
                            )}
                            {ex.videoUrl && ex.videoUrl !== "#" && (
                              <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-400 hover:underline mt-1 block">
                                🎬 Video link
                              </a>
                            )}
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => startEditExercise(selectedDay, sIdx, eIdx)}
                              className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => deleteExercise(clientId, selectedDay, sIdx, eIdx)}
                              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add exercise form */}
                {showAddExercise === sIdx && (
                  <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 space-y-2">
                    <h5 className="text-sm font-semibold text-purple-300">New Exercise</h5>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <input placeholder="Exercise name" value={newExercise.name} onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })} className="admin-input text-sm" />
                      <input placeholder="Duration (e.g. 15 min)" value={newExercise.duration} onChange={(e) => setNewExercise({ ...newExercise, duration: e.target.value })} className="admin-input text-sm" />
                      <input placeholder="Sets (e.g. 3)" value={newExercise.sets} onChange={(e) => setNewExercise({ ...newExercise, sets: e.target.value })} className="admin-input text-sm" />
                      <input placeholder="Reps / duration" value={newExercise.reps} onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })} className="admin-input text-sm" />
                    </div>
                    <textarea placeholder="Description" rows={2} value={newExercise.description} onChange={(e) => setNewExercise({ ...newExercise, description: e.target.value })} className="admin-input w-full resize-none text-sm" />
                    <textarea placeholder="Coaching tips (shown to player)" rows={2} value={newExercise.tips} onChange={(e) => setNewExercise({ ...newExercise, tips: e.target.value })} className="admin-input w-full resize-none text-sm" />
                    <input placeholder="Video URL (YouTube, Vimeo, Drive...)" value={newExercise.videoUrl} onChange={(e) => setNewExercise({ ...newExercise, videoUrl: e.target.value })} className="admin-input text-sm" />
                    <div className="flex gap-2">
                      <button onClick={() => handleAddExercise(sIdx)} className="admin-btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3">
                        <Check size={13} /> Add Exercise
                      </button>
                      <button onClick={() => setShowAddExercise(null)} className="admin-btn-ghost flex items-center gap-1.5 text-xs py-1.5 px-3">
                        <X size={13} /> Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── CONTENT TAB ─────────────────────────────────────────────────── */
function ContentTab({ clientId }) {
  const { clientContent, addVideo, deleteVideo, addPdf, deletePdf } = useAdmin();
  const content = clientContent[clientId] || { videos: [], pdfs: [] };
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [showAddPdf, setShowAddPdf] = useState(false);
  const [videoForm, setVideoForm] = useState({ title: "", url: "", size: "", session: "" });
  const [pdfForm, setPdfForm] = useState({ title: "", url: "", size: "" });

  const handleAddVideo = () => {
    if (!videoForm.title) return;
    addVideo(clientId, videoForm);
    setVideoForm({ title: "", url: "", size: "", session: "" });
    setShowAddVideo(false);
  };

  const handleAddPdf = () => {
    if (!pdfForm.title) return;
    addPdf(clientId, pdfForm);
    setPdfForm({ title: "", url: "", size: "" });
    setShowAddPdf(false);
  };

  return (
    <div className="space-y-8">
      {/* Videos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white">Training Videos</h3>
            <p className="text-xs text-gray-500 mt-0.5">{content.videos.length} videos uploaded</p>
          </div>
          <button
            onClick={() => setShowAddVideo(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-sm font-semibold transition-all"
          >
            <Upload size={15} /> Upload Video
          </button>
        </div>

        {showAddVideo && (
          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 mb-4 space-y-3">
            <h4 className="font-semibold text-white text-sm">Add Video</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              <input placeholder="Video title" value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} className="admin-input" />
              <input placeholder="Session / context (optional)" value={videoForm.session} onChange={(e) => setVideoForm({ ...videoForm, session: e.target.value })} className="admin-input" />
              <input placeholder="URL (YouTube, Vimeo, Drive...)" value={videoForm.url} onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })} className="admin-input sm:col-span-2" />
              <input placeholder="File size (e.g. 45 MB)" value={videoForm.size} onChange={(e) => setVideoForm({ ...videoForm, size: e.target.value })} className="admin-input" />
            </div>
            {/* Simulated drag/drop zone */}
            <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-6 text-center hover:border-purple-500/50 transition-colors cursor-pointer">
              <Upload size={24} className="text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Drag & drop or <span className="text-purple-400 font-semibold">browse</span></p>
              <p className="text-xs text-gray-600 mt-1">MP4, MOV, AVI up to 2GB</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddVideo} className="admin-btn-primary flex items-center gap-2">
                <Check size={15} /> Save Video
              </button>
              <button onClick={() => setShowAddVideo(false)} className="admin-btn-ghost flex items-center gap-2">
                <X size={15} /> Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {content.videos.map((v) => (
            <div key={v.id} className="flex items-center gap-4 p-4 bg-gray-900/50 border border-white/10 rounded-2xl group hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0">
                <Video size={20} className="text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm">{v.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {v.session && <span className="mr-2">📋 {v.session}</span>}
                  {v.size && <span className="mr-2">💾 {v.size}</span>}
                  <span>📅 {v.uploadedAt}</span>
                </div>
              </div>
              {v.url && v.url !== "#" && (
                <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-400 hover:underline flex-shrink-0">
                  Open ↗
                </a>
              )}
              <button
                onClick={() => deleteVideo(clientId, v.id)}
                className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          {content.videos.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">No videos uploaded yet.</div>
          )}
        </div>
      </div>

      {/* PDFs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white">Documents & PDFs</h3>
            <p className="text-xs text-gray-500 mt-0.5">{content.pdfs.length} documents shared</p>
          </div>
          <button
            onClick={() => setShowAddPdf(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-300 text-sm font-semibold transition-all"
          >
            <Upload size={15} /> Upload PDF
          </button>
        </div>

        {showAddPdf && (
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5 mb-4 space-y-3">
            <h4 className="font-semibold text-white text-sm">Add PDF / Document</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              <input placeholder="Document title" value={pdfForm.title} onChange={(e) => setPdfForm({ ...pdfForm, title: e.target.value })} className="admin-input sm:col-span-2" />
              <input placeholder="URL (Drive, Dropbox...)" value={pdfForm.url} onChange={(e) => setPdfForm({ ...pdfForm, url: e.target.value })} className="admin-input" />
              <input placeholder="File size (e.g. 1.2 MB)" value={pdfForm.size} onChange={(e) => setPdfForm({ ...pdfForm, size: e.target.value })} className="admin-input" />
            </div>
            <div className="border-2 border-dashed border-yellow-500/30 rounded-xl p-6 text-center hover:border-yellow-500/50 transition-colors cursor-pointer">
              <FileText size={24} className="text-yellow-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Drag & drop or <span className="text-yellow-400 font-semibold">browse</span></p>
              <p className="text-xs text-gray-600 mt-1">PDF, DOCX, XLSX up to 50MB</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddPdf} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold text-sm transition-all">
                <Check size={15} /> Save Document
              </button>
              <button onClick={() => setShowAddPdf(false)} className="admin-btn-ghost flex items-center gap-2">
                <X size={15} /> Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {content.pdfs.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-4 bg-gray-900/50 border border-white/10 rounded-2xl group hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0">
                <FileText size={20} className="text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm">{p.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {p.size && <span className="mr-2">💾 {p.size}</span>}
                  <span>📅 {p.uploadedAt}</span>
                </div>
              </div>
              {p.url && p.url !== "#" && (
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-yellow-400 hover:underline flex-shrink-0">
                  Open ↗
                </a>
              )}
              <button
                onClick={() => deletePdf(clientId, p.id)}
                className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          {content.pdfs.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">No documents uploaded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── FEEDBACK TAB ────────────────────────────────────────────────── */
function FeedbackTab({ clientId }) {
  const { clientFeedback, addFeedback, deleteFeedback } = useAdmin();
  const feedbacks = clientFeedback[clientId] || [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    week: "",
    message: "",
    rating: 8,
    nextFocus: "",
    adjustments: "",
  });

  const handleAdd = () => {
    if (!form.message) return;
    const weekNum = feedbacks.length + 1;
    addFeedback(clientId, {
      week: form.week || `Week ${weekNum}`,
      message: form.message,
      rating: parseInt(form.rating),
      nextFocus: form.nextFocus,
      adjustments: form.adjustments
        ? form.adjustments.split("\n").filter(Boolean)
        : [],
    });
    setForm({ week: "", message: "", rating: 8, nextFocus: "", adjustments: "" });
    setShowForm(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white">Coach Feedback</h3>
          <p className="text-xs text-gray-500 mt-0.5">{feedbacks.length} reviews sent</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pitch-500/15 hover:bg-pitch-500/25 border border-pitch-500/25 text-pitch-300 text-sm font-semibold transition-all"
        >
          <Plus size={15} /> New Review
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-pitch-500/20 bg-pitch-500/5 p-5 space-y-3">
          <h4 className="font-semibold text-white text-sm">Write Weekly Review</h4>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              placeholder="Week label (e.g. Week 16)"
              value={form.week}
              onChange={(e) => setForm({ ...form, week: e.target.value })}
              className="admin-input"
            />
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-400 whitespace-nowrap">Rating: {form.rating}/10</label>
              <input
                type="range" min={1} max={10} value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className="flex-1 accent-pitch-500"
              />
            </div>
          </div>
          <textarea
            placeholder="Write your feedback for this player..."
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="admin-input w-full resize-none"
          />
          <textarea
            placeholder="Adjustments made (one per line)"
            rows={3}
            value={form.adjustments}
            onChange={(e) => setForm({ ...form, adjustments: e.target.value })}
            className="admin-input w-full resize-none"
          />
          <input
            placeholder="Next week's focus"
            value={form.nextFocus}
            onChange={(e) => setForm({ ...form, nextFocus: e.target.value })}
            className="admin-input"
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="admin-btn-primary flex items-center gap-2">
              <Check size={15} /> Send Feedback
            </button>
            <button onClick={() => setShowForm(false)} className="admin-btn-ghost flex items-center gap-2">
              <X size={15} /> Cancel
            </button>
          </div>
        </div>
      )}

      {feedbacks.map((fb) => (
        <div key={fb.id} className="rounded-2xl border border-white/10 bg-gray-900/50 p-5 group hover:border-white/20 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-semibold text-white">{fb.week}</div>
              <div className="text-xs text-gray-500">{fb.date}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {Array(5).fill(0).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.round(fb.rating / 2) ? "fill-yellow-400 text-yellow-400" : "text-gray-700"}
                  />
                ))}
                <span className="text-xs text-gray-400 ml-1">{fb.rating}/10</span>
              </div>
              <button
                onClick={() => deleteFeedback(clientId, fb.id)}
                className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed mb-3">{fb.message}</p>
          {fb.adjustments?.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-bold text-gray-400 mb-1.5">Adjustments</div>
              <div className="space-y-1">
                {fb.adjustments.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                    <Check size={11} className="text-pitch-400 flex-shrink-0" />
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}
          {fb.nextFocus && (
            <div className="bg-pitch-500/10 border border-pitch-500/20 rounded-xl px-3 py-2 text-xs">
              <span className="text-pitch-400 font-semibold">Next focus: </span>
              <span className="text-gray-300">{fb.nextFocus}</span>
            </div>
          )}
        </div>
      ))}

      {feedbacks.length === 0 && !showForm && (
        <div className="text-center py-10 text-gray-500 text-sm">No feedback sent yet.</div>
      )}
    </div>
  );
}

/* ── PROFILE TAB ─────────────────────────────────────────────────── */
function ProfileTab({ client }) {
  const accent = client.club?.primaryColor || "#a855f7";
  const info = [
    { label: "Full Name", value: client.name },
    { label: "Email", value: client.email },
    { label: "Role", value: client.role },
    { label: "Plan", value: client.plan },
    { label: "Club", value: client.club?.name },
    { label: "Joined", value: client.joinedDate },
    client.age && { label: "Age", value: client.age },
    client.level && { label: "Level", value: client.level },
    client.trainingDays && { label: "Training Days / Week", value: client.trainingDays },
    client.players && { label: "Squad Size", value: `${client.players} players` },
    client.objective && { label: "Objective", value: client.objective },
  ].filter(Boolean);

  return (
    <div className="space-y-6 max-w-xl">
      {/* Club branding preview */}
      <div
        className="rounded-2xl p-6 border"
        style={{ borderColor: accent + "30", background: `linear-gradient(135deg, ${accent}12 0%, transparent 100%)` }}
      >
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Club Branding (as seen by client)</div>
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg"
            style={{ backgroundColor: accent + "25", color: accent }}
          >
            {client.club?.logo}
          </div>
          <div>
            <div className="text-xl font-black text-white">{client.club?.name}</div>
            <div className="text-sm font-bold mt-1" style={{ color: accent }}>{client.plan} Plan</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-5 h-5 rounded-full border-2 border-white/20" style={{ backgroundColor: client.club?.primaryColor }} title="Primary" />
              {client.club?.secondaryColor && (
                <div className="w-5 h-5 rounded-full border-2 border-white/20" style={{ backgroundColor: client.club?.secondaryColor }} title="Secondary" />
              )}
              {client.club?.accentColor && (
                <div className="w-5 h-5 rounded-full border-2 border-white/20" style={{ backgroundColor: client.club?.accentColor }} title="Accent" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-2xl border border-white/10 bg-gray-900/50 overflow-hidden">
        {info.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 px-5 py-3.5 ${i < info.length - 1 ? "border-b border-white/5" : ""}`}
          >
            <div className="text-xs font-semibold text-gray-500 w-36 flex-shrink-0">{item.label}</div>
            <div className="text-sm text-white">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── MAIN PAGE ───────────────────────────────────────────────────── */
const TABS = [
  { key: "plan", label: "Weekly Plan", icon: Calendar },
  { key: "content", label: "Content", icon: Video },
  { key: "feedback", label: "Feedback", icon: MessageSquare },
  { key: "profile", label: "Profile", icon: Target },
];

export default function AdminClientDetailPage() {
  const { id } = useParams();
  const clientId = parseInt(id);
  const { clients } = useAdmin();
  const [activeTab, setActiveTab] = useState("plan");

  const client = clients.find((c) => c.id === clientId);
  if (!client) {
    return (
      <div className="p-8 text-center text-gray-400">
        Client not found.{" "}
        <Link to="/admin/clients" className="text-purple-400 hover:underline">← Back</Link>
      </div>
    );
  }

  const accent = client.club?.primaryColor || "#a855f7";

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Back */}
      <Link
        to="/admin/clients"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={15} /> All Clients
      </Link>

      {/* Client header */}
      <div
        className="rounded-3xl p-6 border mb-8"
        style={{ borderColor: accent + "30", background: `linear-gradient(135deg, ${accent}10 0%, transparent 100%)` }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black flex-shrink-0 shadow-lg"
            style={{ backgroundColor: accent + "25", color: accent }}
          >
            {client.club?.logo}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xl font-black text-white">{client.name}</div>
            <div className="text-gray-400 text-sm">{client.club?.name}</div>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: accent + "20", color: accent }}>
                {client.plan}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 capitalize">
                {client.role}
              </span>
              {client.level && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">{client.level}</span>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-400">{client.email}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900/50 border border-white/10 rounded-2xl p-1.5 mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0 transition-all ${
              activeTab === tab.key
                ? "text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
            style={activeTab === tab.key ? { backgroundColor: accent, boxShadow: `0 0 20px ${accent}40` } : {}}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "plan" && <PlanTab clientId={clientId} />}
      {activeTab === "content" && <ContentTab clientId={clientId} />}
      {activeTab === "feedback" && <FeedbackTab clientId={clientId} />}
      {activeTab === "profile" && <ProfileTab client={client} />}
    </div>
  );
}
