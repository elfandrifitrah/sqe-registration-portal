import type { Country, Program, QueueFilters, QueueMode, SortBy, Status } from '../types';
import { PROGRAM_LABEL, PROGRAMS, STATUS_ORDER } from '../lib/selectors';

interface FilterBarProps {
  filters: QueueFilters;
  onFilterChange: (patch: Partial<QueueFilters>) => void;
  sortBy: SortBy;
  onSortChange: (sortBy: SortBy) => void;
  mode: QueueMode;
  onModeChange: (mode: QueueMode) => void;
  countries: Country[];
  resultCount: number;
  totalCount: number;
  onClear: () => void;
  /** Calibration mode shows the whole pool, so the working filters are paused. */
  filtersPaused: boolean;
}

export function FilterBar({
  filters,
  onFilterChange,
  sortBy,
  onSortChange,
  mode,
  onModeChange,
  countries,
  resultCount,
  totalCount,
  onClear,
  filtersPaused,
}: FilterBarProps) {
  const activeFilters =
    filters.country !== 'All' ||
    filters.program !== 'All' ||
    filters.status !== 'All' ||
    filters.duplicateOnly ||
    filters.scoreMin !== '' ||
    filters.scoreMax !== '' ||
    filters.search !== '';

  return (
    <div className="filter-bar">
      <fieldset className="filter-fields" disabled={filtersPaused}>
      <div className="filter-row">
        <input
          className="search-input"
          type="search"
          placeholder="Search name or email…"
          aria-label="Search applicants by name or email"
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
        />
        <select
          aria-label="Filter by country"
          value={filters.country}
          onChange={(e) => onFilterChange({ country: e.target.value as Country | 'All' })}
        >
          <option value="All">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by program"
          value={filters.program}
          onChange={(e) => onFilterChange({ program: e.target.value as Program | 'All' })}
        >
          <option value="All">All programs</option>
          {PROGRAMS.map((p) => (
            <option key={p} value={p}>
              {PROGRAM_LABEL[p]}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by status"
          value={filters.status}
          onChange={(e) => onFilterChange({ status: e.target.value as Status | 'All' })}
        >
          <option value="All">All statuses</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-row">
        <label className="score-range">
          Assessment score
          <input
            type="number"
            min={0}
            max={100}
            placeholder="min"
            aria-label="Minimum assessment score"
            value={filters.scoreMin}
            onChange={(e) => onFilterChange({ scoreMin: e.target.value })}
          />
          <span className="dash">–</span>
          <input
            type="number"
            min={0}
            max={100}
            placeholder="max"
            aria-label="Maximum assessment score"
            value={filters.scoreMax}
            onChange={(e) => onFilterChange({ scoreMax: e.target.value })}
          />
        </label>

        <label className="check">
          <input
            type="checkbox"
            checked={filters.duplicateOnly}
            onChange={(e) => onFilterChange({ duplicateOnly: e.target.checked })}
          />
          Duplicates only
        </label>

        <label className="sort-select">
          Sort
          <select
            aria-label="Sort queue"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortBy)}
          >
            <option value="date">Applied date</option>
            <option value="score">Assessment score</option>
            <option value="status">Status</option>
          </select>
        </label>

        <button className="btn ghost" onClick={onClear} disabled={!activeFilters}>
          Clear filters
        </button>
      </div>
      </fieldset>

      <div className="filter-row calibration-row">
        <label className="check calibration-toggle">
          <input
            type="checkbox"
            checked={mode === 'snapshot'}
            onChange={(e) => onModeChange(e.target.checked ? 'snapshot' : 'rolling')}
          />
          <strong>Calibration mode</strong> — view the full pool instead of the rolling intake
        </label>
        <span className="result-count">
          {filtersPaused
            ? `Showing all ${totalCount} applications in the pool`
            : `${resultCount} of ${totalCount} applications`}
        </span>
      </div>
    </div>
  );
}
