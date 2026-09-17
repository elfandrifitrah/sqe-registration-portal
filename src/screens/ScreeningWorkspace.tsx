import { useMemo, useState } from 'react';
import type { Applicant, Decision, QueueFilters, QueueMode, SortBy } from '../types';
import {
  buildQueue,
  calibrationSnapshot,
  countriesInUse,
  duplicatePartner,
  emptyFilters,
  formatDate,
  sortApplicants,
} from '../lib/selectors';
import { TODAY } from '../data/seed';
import { FilterBar } from '../components/FilterBar';
import { QueueTable } from '../components/QueueTable';
import { ApplicantDetail } from '../components/ApplicantDetail';
import { DecisionPanel } from '../components/DecisionPanel';

interface ScreeningWorkspaceProps {
  applicants: Applicant[];
  comparisonIds: string[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDecide: (id: string, decision: Decision) => void;
  onReverse: (id: string) => void;
  onFinalize: (id: string) => void;
  onSaveNotes: (id: string, notes: string) => void;
  onAddToComparison: (id: string) => void;
  onOpenComparison: () => void;
}

/**
 * Screen A — Reviewer Screening Workspace (required screen).
 *
 * Three panes: filterable queue, applicant detail, and a decisions & signals rail.
 * Built for volume: dense rows, both manual steps (duplicate checking and assessment
 * lookup) surfaced in the list itself so neither needs a click to discover.
 */
export function ScreeningWorkspace({
  applicants,
  comparisonIds,
  selectedId,
  onSelect,
  onDecide,
  onReverse,
  onFinalize,
  onSaveNotes,
  onAddToComparison,
  onOpenComparison,
}: ScreeningWorkspaceProps) {
  const [filters, setFilters] = useState<QueueFilters>(emptyFilters);
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [mode, setMode] = useState<QueueMode>('rolling');

  const queue = useMemo(() => buildQueue(applicants, filters, sortBy), [applicants, filters, sortBy]);
  const pool = useMemo(() => sortApplicants(applicants, sortBy), [applicants, sortBy]);
  const countries = useMemo(() => countriesInUse(applicants), [applicants]);
  const snapshot = useMemo(() => calibrationSnapshot(applicants, TODAY), [applicants]);

  // Rolling mode is the working queue (filters apply). Calibration mode is the whole
  // pool, unfiltered, so a reviewer calibrates against everything they have.
  const visible = mode === 'snapshot' ? pool : queue;

  // Selection survives filtering: a reviewer can decide a record and keep it open
  // even if the new status pushes it out of the current filter.
  const selected = applicants.find((a) => a.id === selectedId) ?? null;
  const partner = selected ? duplicatePartner(applicants, selected) : undefined;

  const patchFilters = (patch: Partial<QueueFilters>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  return (
    <div className="workspace">
      <section className="queue-pane" aria-label="Application queue">
        <div className="pane-head">
          <h2>Screening queue</h2>
          <span className="pane-sub">
            {mode === 'rolling'
              ? 'Rolling intake — newest applications first, no cycle cut-off'
              : `Pool snapshot as of ${formatDate(TODAY)} — the full current pool, for calibration`}
          </span>
        </div>

        <FilterBar
          filters={filters}
          onFilterChange={patchFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
          mode={mode}
          onModeChange={setMode}
          countries={countries}
          resultCount={queue.length}
          totalCount={applicants.length}
          onClear={() => {
            setFilters(emptyFilters);
            setSortBy('date');
          }}
          filtersPaused={mode === 'snapshot'}
        />

        {mode === 'snapshot' && (
          <div className="calibration-strip">
            <span className="strip-label">
              Calibration view — {snapshot.poolSize} applications in the {formatDate(TODAY)} pool
            </span>
            {snapshot.byStatus.map((s) => (
              <span key={s.status} className={`strip-chip status-${s.status.toLowerCase().replace(/\s+/g, '-')}`}>
                {s.status}: {s.count}
              </span>
            ))}
            <span className="strip-chip">Decided: {snapshot.decided}</span>
            <p className="strip-note">
              Same records, framed as a pool to calibrate against rather than a queue to drain —
              the working filters are paused while this is on. Decisions taken here still apply to
              the live application.
            </p>
          </div>
        )}

        <QueueTable
          applicants={visible}
          selectedId={selectedId}
          comparisonIds={comparisonIds}
          onSelect={onSelect}
        />
      </section>

      <section className="detail-pane" aria-label="Applicant detail">
        {selected ? (
          <ApplicantDetail
            key={selected.id}
            applicant={selected}
            partner={partner}
            onOpenPartner={onSelect}
            onSaveNotes={onSaveNotes}
          />
        ) : (
          <div className="empty-state">
            <h3>No application selected</h3>
            <p>Pick an application from the queue to see its details, signals and decision panel.</p>
          </div>
        )}
      </section>

      {selected ? (
        <DecisionPanel
          applicant={selected}
          comparisonIds={comparisonIds}
          onDecide={onDecide}
          onReverse={onReverse}
          onFinalize={onFinalize}
          onAddToComparison={onAddToComparison}
          onOpenComparison={onOpenComparison}
        />
      ) : (
        <aside className="decision-panel" aria-label="Decision and signals">
          <div className="empty-state small">
            <p>Decisions and signals appear here once an application is selected.</p>
          </div>
        </aside>
      )}
    </div>
  );
}
