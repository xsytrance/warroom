'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Moon,
  Volume2,
  Zap,
  Smartphone,
  LogOut,
  MoonStar,
  Bell,
  Eye,
  Wifi,
  Rocket,
  Download,
  Package,
  Image as ImageIcon,
  KeyRound,
  SlidersHorizontal,
  Save,
} from 'lucide-react';
import { WarRoomShell } from '@/components/WarRoomShell';

type Provider = {
  id: string;
  provider: string;
  enabled: boolean;
  priority: number;
  baseUrl: string | null;
  modelName: string | null;
  apiKeyMasked: string | null;
  localModelPath: string | null;
  settingsJson: string | null;
};

interface SettingToggleProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function SettingToggle({ icon, label, description, checked, onChange }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#94a3b8]">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-[#e2e8f0]">{label}</p>
          <p className="text-[11px] text-[#475569]">{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-all duration-200 ${
          checked ? 'bg-[#22c55e]' : 'bg-white/10'
        }`}
        aria-label={`Toggle ${label}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();

  const [settings, setSettings] = useState({
    sound: false,
    reducedMotion: false,
    darkInterface: true,
    alertSignals: false,
    stealthMode: false,
  });

  const [providers, setProviders] = useState<Provider[]>([]);
  const [newProvider, setNewProvider] = useState({
    provider: 'local-comfyui',
    enabled: true,
    priority: 10,
    baseUrl: 'http://127.0.0.1:8188',
    modelName: '',
    apiKey: '',
    localModelPath: '',
  });
  const [savingProvider, setSavingProvider] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('war-room-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch {}
    }

    fetch('/api/settings/image-providers')
      .then((res) => (res.ok ? res.json() : { providers: [] }))
      .then((data) => setProviders(data.providers || []))
      .catch(() => setProviders([]));
  }, []);

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem('war-room-settings', JSON.stringify(next));

    if (key === 'reducedMotion') {
      localStorage.setItem('war-room-reduced-motion', value ? 'true' : 'false');
      window.dispatchEvent(new StorageEvent('storage', { key: 'war-room-reduced-motion' }));
    }
    if (key === 'sound') {
      localStorage.setItem('war-room-sound', value ? 'true' : 'false');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleInstall = async () => {
    const deferredPrompt = (window as any).deferredPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        (window as any).deferredPrompt = null;
      }
    }
  };

  async function saveProvider() {
    setSavingProvider(true);
    try {
      const payload: any = {
        provider: newProvider.provider,
        enabled: newProvider.enabled,
        priority: newProvider.priority,
        baseUrl: newProvider.baseUrl || null,
        modelName: newProvider.modelName || null,
        localModelPath: newProvider.localModelPath || null,
      };
      if (newProvider.apiKey.trim()) {
        payload.apiKey = newProvider.apiKey.trim();
      }

      await fetch('/api/settings/image-providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const refreshed = await fetch('/api/settings/image-providers').then((res) => res.json());
      setProviders(refreshed.providers || []);
      setNewProvider((p) => ({ ...p, apiKey: '' }));
    } finally {
      setSavingProvider(false);
    }
  }

  return (
    <WarRoomShell showNav={true}>
      <div className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/10 safe-top">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center gap-2 text-[#94a3b8] hover:text-[#e2e8f0] transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-sm font-bold tracking-[0.15em] uppercase text-[#06b6d4]">System Config</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-32 space-y-6">
        <div className="rounded-xl border border-white/10 bg-[#12121a]/80 p-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ef4444]/30 to-[#06b6d4]/30 flex items-center justify-center text-sm font-bold text-[#e2e8f0] border border-white/10">
              WR
            </div>
            <div>
              <p className="text-sm font-semibold text-[#e2e8f0]">THE WAR ROOM</p>
              <p className="text-[11px] text-[#475569]">v0.5.0 · Identity & Telemetry Build</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#ef4444]/20 bg-[#ef4444]/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="w-4 h-4 text-[#ef4444]" />
            <h2 className="text-sm font-bold tracking-wider uppercase text-[#ef4444]">Install App</h2>
          </div>
          <p className="text-xs text-[#94a3b8] mb-4">
            Add The War Room to your home screen for quick access like a native app.
          </p>

          <div className="mb-3 p-3 rounded-lg border border-white/10 bg-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-[#22c55e]" />
              <span className="text-xs font-semibold text-[#e2e8f0]">Android (Chrome)</span>
            </div>
            <ol className="text-[11px] text-[#94a3b8] space-y-1 ml-4 list-decimal">
              <li>Open The War Room in Chrome</li>
              <li>Tap the browser menu (⋯)</li>
              <li>
                Tap <strong className="text-[#e2e8f0]">Install app</strong> or{' '}
                <strong className="text-[#e2e8f0]">Add to Home screen</strong>
              </li>
              <li>Launch from your home screen</li>
            </ol>
          </div>

          <div className="p-3 rounded-lg border border-white/10 bg-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="w-4 h-4 text-[#06b6d4]" />
              <span className="text-xs font-semibold text-[#e2e8f0]">iPhone (Safari)</span>
            </div>
            <ol className="text-[11px] text-[#94a3b8] space-y-1 ml-4 list-decimal">
              <li>Open The War Room in Safari</li>
              <li>Tap the <strong className="text-[#e2e8f0]">Share</strong> button</li>
              <li>
                Scroll down and tap{' '}
                <strong className="text-[#e2e8f0]">Add to Home Screen</strong>
              </li>
              <li>
                Tap <strong className="text-[#e2e8f0]">Add</strong> in the top-right
              </li>
              <li>Launch from your home screen</li>
            </ol>
          </div>

          {typeof window !== 'undefined' && (window as any).deferredPrompt && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleInstall}
              className="mt-3 w-full h-11 rounded-xl bg-[#ef4444] text-[#e2e8f0] font-semibold tracking-wider text-sm shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-[#dc2626] transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              INSTALL WAR ROOM
            </motion.button>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-[#12121a]/80 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-[#06b6d4]" />
            <h2 className="text-sm font-bold tracking-wider uppercase text-[#06b6d4]">Preferences</h2>
          </div>
          <p className="text-[11px] text-[#475569] mb-3">Control interface behavior and signal handling.</p>

          <div className="divide-y divide-white/5">
            <SettingToggle
              icon={<Moon className="w-4 h-4" />}
              label="Dark Interface"
              description="Always use tactical dark mode"
              checked={settings.darkInterface}
              onChange={() => updateSetting('darkInterface', !settings.darkInterface)}
            />
            <SettingToggle
              icon={<Volume2 className="w-4 h-4" />}
              label="Sound Effects"
              description="Audio feedback for signals"
              checked={settings.sound}
              onChange={() => updateSetting('sound', !settings.sound)}
            />
            <SettingToggle
              icon={<MoonStar className="w-4 h-4" />}
              label="Reduced Motion"
              description="Minimize tactical animations"
              checked={settings.reducedMotion}
              onChange={() => updateSetting('reducedMotion', !settings.reducedMotion)}
            />
            <SettingToggle
              icon={<Bell className="w-4 h-4" />}
              label="Alert Signals"
              description="Push alert notifications"
              checked={settings.alertSignals}
              onChange={() => updateSetting('alertSignals', !settings.alertSignals)}
            />
            <SettingToggle
              icon={<Eye className="w-4 h-4" />}
              label="Stealth Mode"
              description="Hide online status"
              checked={settings.stealthMode}
              onChange={() => updateSetting('stealthMode', !settings.stealthMode)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-[#a855f7]/20 bg-[#a855f7]/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#a855f7]" />
            <h2 className="text-sm font-bold tracking-wider uppercase text-[#a855f7]">Image Generation Providers</h2>
          </div>
          <p className="text-xs text-[#94a3b8]">
            Configure local and API image backends for on-the-fly avatar/profile creation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Provider" value={newProvider.provider} onChange={(v) => setNewProvider((p) => ({ ...p, provider: v }))} />
            <Field label="Priority (lower = earlier)" type="number" value={String(newProvider.priority)} onChange={(v) => setNewProvider((p) => ({ ...p, priority: Number(v || '100') }))} />
            <Field label="Base URL" value={newProvider.baseUrl} onChange={(v) => setNewProvider((p) => ({ ...p, baseUrl: v }))} />
            <Field label="Model Name" value={newProvider.modelName} onChange={(v) => setNewProvider((p) => ({ ...p, modelName: v }))} />
            <Field label="Local Model Path" value={newProvider.localModelPath} onChange={(v) => setNewProvider((p) => ({ ...p, localModelPath: v }))} />
            <Field label="API Key" value={newProvider.apiKey} onChange={(v) => setNewProvider((p) => ({ ...p, apiKey: v }))} type="password" />
          </div>

          <label className="flex items-center gap-2 text-sm text-[#e2e8f0]">
            <input
              type="checkbox"
              checked={newProvider.enabled}
              onChange={(e) => setNewProvider((p) => ({ ...p, enabled: e.target.checked }))}
            />
            Enabled
          </label>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={saveProvider}
            disabled={savingProvider}
            className="w-full h-11 rounded-lg bg-[#a855f7] text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4" /> {savingProvider ? 'Saving...' : 'Save Provider'}
          </motion.button>

          <div className="space-y-2">
            {providers.map((p) => (
              <div key={p.id} className="rounded-lg border border-white/10 bg-[#12121a]/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-[#e2e8f0] font-medium">{p.provider}</p>
                    <p className="text-[11px] text-[#64748b]">priority {p.priority} · {p.enabled ? 'enabled' : 'disabled'}</p>
                  </div>
                  <div className="text-right text-[11px] text-[#94a3b8]">
                    {p.modelName || 'no model'}
                    {p.apiKeyMasked ? <p className="text-[#22c55e]">key {p.apiKeyMasked}</p> : null}
                  </div>
                </div>
                <p className="text-[11px] text-[#64748b] mt-1">{p.baseUrl || p.localModelPath || 'no endpoint configured'}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-[#06b6d4]/20 bg-[#06b6d4]/5 p-3 text-[11px] text-[#94a3b8] space-y-1">
            <p className="flex items-center gap-1.5 text-[#06b6d4]"><SlidersHorizontal className="w-3.5 h-3.5" /> Recommended local stack</p>
            <p>ComfyUI on `http://127.0.0.1:8188` + local LLM prompt enhancer (Ollama).
              Use provider name `local-comfyui` and set model preset per agent.</p>
          </div>

          <div className="rounded-lg border border-[#f59e0b]/20 bg-[#f59e0b]/5 p-3 text-[11px] text-[#94a3b8]">
            <p className="text-[#f59e0b] flex items-center gap-1.5 mb-1"><KeyRound className="w-3.5 h-3.5" /> API providers</p>
            <p>Use provider names like `fal` or `openai`. API keys are masked in UI and stored encoded in DB; set env secrets for production hardening.</p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#12121a]/80 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Wifi className="w-4 h-4 text-[#22c55e]" />
            <h2 className="text-sm font-bold tracking-wider uppercase text-[#22c55e]">Network</h2>
          </div>
          <NetworkStatus />
        </div>

        <div className="rounded-xl border border-[#f59e0b]/20 bg-[#f59e0b]/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Rocket className="w-4 h-4 text-[#f59e0b]" />
            <h2 className="text-sm font-bold tracking-wider uppercase text-[#f59e0b]">Deployment Notes</h2>
          </div>
          <p className="text-xs text-[#94a3b8] mb-2">The War Room stores data locally:</p>
          <ul className="text-[11px] text-[#94a3b8] space-y-1 mb-3 ml-4 list-disc">
            <li>SQLite database: <code className="text-[#06b6d4]">dev.db</code></li>
            <li>Uploaded images: <code className="text-[#06b6d4]">public/uploads/images/</code></li>
          </ul>
          <p className="text-[11px] text-[#475569]">
            Back up both files together. Restoring only the database without uploads will leave broken image links.
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="w-full h-12 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444] font-semibold tracking-wider text-sm hover:bg-[#ef4444]/20 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> TERMINATE SESSION
        </motion.button>

        <div className="text-center space-y-1 pt-4">
          <p className="text-[10px] text-[#475569] tracking-wider uppercase">Private Command Hub</p>
          <p className="text-[10px] text-[#475569]">Built for xsytrance and Juan</p>
        </div>
      </div>
    </WarRoomShell>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-[#94a3b8] mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 rounded-lg bg-[#0f1117] border border-white/10 px-3 text-sm text-[#e2e8f0]"
      />
    </div>
  );
}

function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        isOnline ? 'border-[#22c55e]/20 bg-[#22c55e]/5' : 'border-[#ef4444]/20 bg-[#ef4444]/5'
      }`}
    >
      <div
        className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`}
        style={{ boxShadow: isOnline ? '0 0 8px #22c55e' : '0 0 8px #ef4444' }}
      />
      <div>
        <p className={`text-xs font-semibold ${isOnline ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
          {isOnline ? 'Uplink Active' : 'Signal Lost'}
        </p>
        <p className="text-[10px] text-[#475569]">
          {isOnline ? 'Network connection established' : 'Offline — connection unavailable'}
        </p>
      </div>
    </div>
  );
}
