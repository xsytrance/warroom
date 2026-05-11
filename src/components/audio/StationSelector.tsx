"use client";

import type { AmbientStation } from "./stations";

type Props = {
  stations: AmbientStation[];
  selectedId: string;
  onChange: (stationId: string) => void;
};

export function StationSelector({ stations, selectedId, onChange }: Props) {
  const agentStations = stations.filter((station) => station.isAgentStation);
  const ambientStations = stations.filter((station) => !station.isAgentStation);

  return (
    <label className="flex items-center gap-2 text-xs text-[#94a3b8]" aria-label="Ambient station selector">
      <span className="uppercase tracking-wider text-[#64748b]">Station</span>
      <select
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 rounded-md border border-white/15 bg-[#0f1720] px-2 py-1 text-xs text-[#e2e8f0] outline-none focus:border-[#06b6d4]/70"
      >
        {agentStations.length > 0 && (
          <optgroup label="Agent Stations">
            {agentStations.map((station) => (
              <option key={station.id} value={station.id}>
                {`📡 ${station.name}${station.fallbackActive ? " (fallback)" : ""}`}
              </option>
            ))}
          </optgroup>
        )}

        {ambientStations.length > 0 && (
          <optgroup label="Ambient Stations">
            {ambientStations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </optgroup>
        )}
      </select>
    </label>
  );
}
