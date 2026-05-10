"use client";

import type { AmbientStation } from "./stations";

type Props = {
  stations: AmbientStation[];
  selectedId: string;
  onChange: (stationId: string) => void;
};

export function StationSelector({ stations, selectedId, onChange }: Props) {
  return (
    <label className="flex items-center gap-2 text-xs text-[#94a3b8]" aria-label="Ambient station selector">
      <span className="uppercase tracking-wider text-[#64748b]">Station</span>
      <select
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 rounded-md border border-white/15 bg-[#0f1720] px-2 py-1 text-xs text-[#e2e8f0] outline-none focus:border-[#06b6d4]/70"
      >
        {stations.map((station) => (
          <option key={station.id} value={station.id}>
            {station.name}
          </option>
        ))}
      </select>
    </label>
  );
}
