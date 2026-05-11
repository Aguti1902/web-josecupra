import { useState, useRef } from "react";
import {
  Video,
  FileText,
  Upload,
  Search,
  Filter,
  Trash2,
  Download,
  ExternalLink,
  Play,
  Clock,
  HardDrive,
  Tag,
  Users,
  CheckCircle,
  X,
  Plus,
} from "lucide-react";
import { mediaLibrary as initialMedia } from "../../data/mockData";

const CATEGORIES = ["todos", "video", "pdf"];
const TAG_OPTIONS = [
  "técnica", "físico", "táctica", "prevención", "portero",
  "velocidad", "control", "pase", "posesión", "presión",
  "club", "mensual", "plan", "avanzado", "intermedio", "principiante",
];

function TagBadge({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-depro-blue/10 text-depro-blue">
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-depro-red">
          <X size={10} />
        </button>
      )}
    </span>
  );
}

function MediaCard({ item, onDelete, clients }) {
  const isVideo = item.type === "video";
  const assignedCount = item.assignedTo?.length ?? 0;

  return (
    <div className="bg-white border border-depro-border rounded-xl overflow-hidden hover:shadow-card transition-shadow group">
      {/* Thumbnail / Preview */}
      <div className="relative h-36 bg-depro-gray-light flex items-center justify-center">
        {isVideo ? (
          <div className="flex flex-col items-center gap-2 text-depro-gray">
            <div className="w-12 h-12 rounded-full bg-depro-blue/10 flex items-center justify-center">
              <Play size={24} className="text-depro-blue ml-1" />
            </div>
            <span className="text-xs font-medium">{item.duration}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-depro-gray">
            <FileText size={32} className="text-depro-red/60" />
            <span className="text-xs font-medium">{item.pages} págs.</span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
            isVideo
              ? "bg-depro-blue text-white"
              : "bg-depro-red text-white"
          }`}>
            {isVideo ? "VIDEO" : "PDF"}
          </span>
        </div>
        <button
          onClick={() => onDelete(item.id)}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-white rounded-lg border border-depro-border text-depro-gray hover:text-depro-red hover:border-depro-red"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-depro-dark text-sm leading-tight line-clamp-2">
          {item.title}
        </h3>

        <div className="flex flex-wrap gap-1">
          {item.tags.map((t) => (
            <TagBadge key={t} label={t} />
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-depro-gray">
          <span className="flex items-center gap-1">
            <HardDrive size={11} />
            {item.size}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {item.uploadedAt}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-depro-border">
          <span className="text-xs text-depro-gray flex items-center gap-1">
            <Users size={11} />
            {assignedCount === 0
              ? "Sin asignar"
              : `${assignedCount} cliente${assignedCount > 1 ? "s" : ""}`}
          </span>
          <div className="flex gap-1">
            <a
              href={item.url}
              className="p-1.5 rounded-lg border border-depro-border text-depro-gray hover:text-depro-blue hover:border-depro-blue transition-colors"
              title="Ver"
            >
              <ExternalLink size={13} />
            </a>
            <button
              className="p-1.5 rounded-lg border border-depro-border text-depro-gray hover:text-depro-blue hover:border-depro-blue transition-colors"
              title="Descargar"
            >
              <Download size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadModal({ onClose, onUpload }) {
  const [form, setForm] = useState({
    title: "",
    type: "video",
    tags: [],
    file: null,
  });
  const [tagInput, setTagInput] = useState("");
  const fileRef = useRef();

  const addTag = (t) => {
    const tag = t.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
    }
    setTagInput("");
  };

  const handleSubmit = () => {
    if (!form.title) return;
    onUpload({
      id: `m${Date.now()}`,
      type: form.type,
      title: form.title,
      tags: form.tags,
      duration: form.type === "video" ? "—" : undefined,
      pages: form.type === "pdf" ? "—" : undefined,
      size: form.file ? `${(form.file.size / 1048576).toFixed(1)} MB` : "—",
      uploadedAt: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }),
      uploadedBy: "Admin",
      url: "#",
      assignedTo: [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-depro w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b border-depro-border">
          <h2 className="font-bold text-depro-dark text-lg">Subir nuevo archivo</h2>
          <button onClick={onClose} className="text-depro-gray hover:text-depro-dark">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-depro-dark mb-1">Tipo</label>
            <div className="flex gap-3">
              {["video", "pdf"].map((t) => (
                <button
                  key={t}
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`flex-1 py-2 rounded-lg border font-medium text-sm capitalize transition-colors ${
                    form.type === t
                      ? "bg-depro-blue border-depro-blue text-white"
                      : "border-depro-border text-depro-gray hover:border-depro-blue"
                  }`}
                >
                  {t === "video" ? <Video size={14} className="inline mr-1" /> : <FileText size={14} className="inline mr-1" />}
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-depro-dark mb-1">Título *</label>
            <input
              className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              placeholder="Ej. Control orientado · nivel avanzado"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-depro-dark mb-1">Etiquetas</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {form.tags.map((t) => (
                <TagBadge
                  key={t}
                  label={t}
                  onRemove={() => setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }))}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                placeholder="Escribe y pulsa Enter o elige abajo"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag(tagInput)}
              />
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {TAG_OPTIONS.filter((t) => !form.tags.includes(t)).slice(0, 10).map((t) => (
                <button
                  key={t}
                  onClick={() => addTag(t)}
                  className="px-2 py-0.5 rounded-full text-xs border border-depro-border text-depro-gray hover:border-depro-blue hover:text-depro-blue transition-colors"
                >
                  + {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-depro-dark mb-1">Archivo</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-depro-border rounded-xl p-6 text-center cursor-pointer hover:border-depro-blue transition-colors"
            >
              <Upload size={24} className="mx-auto text-depro-gray mb-2" />
              {form.file ? (
                <p className="text-sm text-depro-dark font-medium">{form.file.name}</p>
              ) : (
                <p className="text-sm text-depro-gray">Haz clic para seleccionar un archivo</p>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept={form.type === "video" ? "video/*" : ".pdf"}
              onChange={(e) => setForm((f) => ({ ...f, file: e.target.files[0] }))}
            />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-depro-border">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-depro-border text-depro-gray font-medium text-sm hover:border-depro-dark hover:text-depro-dark transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.title}
            className="flex-1 py-2.5 rounded-xl bg-depro-blue text-white font-semibold text-sm hover:bg-depro-blue-dark transition-colors disabled:opacity-40"
          >
            Subir archivo
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState(initialMedia);
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const filtered = media.filter((m) => {
    const matchType = filter === "todos" || m.type === filter;
    const matchSearch =
      !search ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.tags.some((t) => t.includes(search.toLowerCase()));
    return matchType && matchSearch;
  });

  const handleDelete = (id) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleUpload = (item) => {
    setMedia((prev) => [item, ...prev]);
  };

  const totalSize = media.reduce((acc, m) => {
    const mb = parseFloat(m.size);
    return acc + (isNaN(mb) ? 0 : mb);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-depro-dark">Biblioteca de medios</h1>
          <p className="text-depro-gray text-sm mt-0.5">
            Gestiona vídeos y PDFs para asignar a clientes
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-depro-blue text-white font-semibold rounded-xl hover:bg-depro-blue-dark transition-colors text-sm"
        >
          <Upload size={16} />
          Subir archivo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total archivos", value: media.length, icon: HardDrive, color: "text-depro-blue" },
          { label: "Vídeos", value: media.filter((m) => m.type === "video").length, icon: Video, color: "text-depro-blue" },
          { label: "PDFs", value: media.filter((m) => m.type === "pdf").length, icon: FileText, color: "text-depro-red" },
          { label: "Espacio usado", value: `${totalSize.toFixed(0)} MB`, icon: HardDrive, color: "text-depro-gray" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-depro-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} className={color} />
              <span className="text-xs text-depro-gray">{label}</span>
            </div>
            <p className="text-2xl font-bold text-depro-dark">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-depro-gray" />
          <input
            className="w-full pl-9 pr-4 py-2.5 border border-depro-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
            placeholder="Buscar por título o etiqueta…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-colors border ${
                filter === c
                  ? "bg-depro-blue border-depro-blue text-white"
                  : "border-depro-border text-depro-gray hover:border-depro-blue hover:text-depro-blue"
              }`}
            >
              {c === "todos" ? "Todos" : c === "video" ? "Vídeos" : "PDFs"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-depro-gray">
          <HardDrive size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No se encontraron archivos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <MediaCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onUpload={handleUpload} />
      )}
    </div>
  );
}
