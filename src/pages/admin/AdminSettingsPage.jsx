import { useState } from "react";
import { Save, Shield, Bell, Globe, Check } from "lucide-react";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    businessName: "Jose Football Training Systems",
    email: "jose@admin.com",
    phone: "+34 600 000 000",
    website: "josefootball.com",
    notifyNewApplication: true,
    notifyPayment: true,
    notifyWeeklyReport: false,
    defaultPlan: "Premium",
  });

  const handle = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-white mb-1">Settings</h1>
        <p className="text-gray-400 text-sm">General configuration of your admin panel</p>
      </div>

      <div className="space-y-6">
        {/* Business info */}
        <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Globe size={18} className="text-purple-400" />
            <h2 className="font-bold text-white">Business Information</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: "Business Name", key: "businessName", placeholder: "Jose Football Training Systems" },
              { label: "Contact Email", key: "email", placeholder: "jose@yourdomain.com" },
              { label: "Phone", key: "phone", placeholder: "+34 600 000 000" },
              { label: "Website", key: "website", placeholder: "yourwebsite.com" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">{f.label}</label>
                <input
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="admin-input w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Bell size={18} className="text-brand-400" />
            <h2 className="font-bold text-white">Notifications</h2>
          </div>
          <div className="space-y-3">
            {[
              { key: "notifyNewApplication", label: "New application received", desc: "Get notified when someone applies from the website" },
              { key: "notifyPayment", label: "Payment received", desc: "Notify when a client payment is processed" },
              { key: "notifyWeeklyReport", label: "Weekly summary report", desc: "Receive a summary of all client activity each Monday" },
            ].map((n) => (
              <div key={n.key} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/3 transition-colors">
                <button
                  onClick={() => setForm({ ...form, [n.key]: !form[n.key] })}
                  className={`w-10 h-6 rounded-full transition-all flex-shrink-0 mt-0.5 relative ${
                    form[n.key] ? "bg-purple-500" : "bg-gray-700"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                      form[n.key] ? "left-5" : "left-1"
                    }`}
                  />
                </button>
                <div>
                  <div className="text-sm font-medium text-white">{n.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{n.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield size={18} className="text-pitch-400" />
            <h2 className="font-bold text-white">Security</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Current Password</label>
              <input type="password" placeholder="••••••••" className="admin-input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
              <input type="password" placeholder="••••••••" className="admin-input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm New Password</label>
              <input type="password" placeholder="••••••••" className="admin-input w-full" />
            </div>
          </div>
        </div>

        <button
          onClick={handle}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all ${
            saved
              ? "bg-pitch-500 text-white"
              : "bg-purple-500 hover:bg-purple-400 text-white"
          }`}
        >
          {saved ? <><Check size={18} /> Saved!</> : <><Save size={18} /> Save Settings</>}
        </button>
      </div>
    </div>
  );
}
