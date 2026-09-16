import type { Edition } from '../types'

/** Shared by preparation and reader settings; empty value means follow text. */
export function LabAudiobookSelect({ value, primaryLabel, editions, unavailableEditionKeys = [], onChange, className, id }: {
  value: string; primaryLabel: string; editions: Edition[]; unavailableEditionKeys?: string[];
  onChange: (value: string) => void; className?: string; id?: string;
}) {
  return <select id={id} className={className} aria-label="Audiobook" data-testid="lab-audio-edition" value={value} onChange={event => onChange(event.target.value)}>
    <option value="">Follow primary edition — {primaryLabel}</option>
    {editions.map(edition => <option key={edition.key} value={edition.key} disabled={unavailableEditionKeys.includes(edition.key)}>{edition.label}{unavailableEditionKeys.includes(edition.key) ? ' — unavailable' : ''}</option>)}
  </select>
}
