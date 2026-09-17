import { useEffect, useReducer } from 'react';
import type { Decision, View } from './types';
import { createInitialState, workspaceReducer, type WorkspaceState } from './lib/reducer';
import { CYCLE_LABEL, REVIEWER_NAME, TODAY } from './data/seed';
import { formatDate } from './lib/selectors';
import { ScreeningWorkspace } from './screens/ScreeningWorkspace';
import { ComparisonDashboard } from './screens/ComparisonDashboard';
import { TraceabilityTable } from './components/TraceabilityTable';

const STORAGE_KEY = 'rrw-prototype-state-v1';
const VIEWS: View[] = ['screening', 'comparison', 'traceability'];

/** Views are addressable as #/screening, #/comparison, #/traceability so a reviewer
 *  can be sent straight to the comparison dashboard for a calibration session. */
function viewFromHash(): View | null {
  const raw = window.location.hash.replace(/^#\/?/, '');
  return (VIEWS as string[]).includes(raw) ? (raw as View) : null;
}

/**
 * State lives in the browser for the session (PRD §10). It is mirrored to
 * sessionStorage purely so an accidental refresh mid-demo does not wipe the
 * decisions a reviewer has just recorded — the source of truth is still memory.
 */
function loadState(): WorkspaceState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
    if (!Array.isArray(parsed.applicants) || parsed.applicants.length === 0) {
      return createInitialState();
    }
    const base = { ...createInitialState(), ...parsed };
    const fromHash = viewFromHash();
    return fromHash ? { ...base, view: fromHash } : base;
  } catch {
    const base = createInitialState();
    const fromHash = viewFromHash();
    return fromHash ? { ...base, view: fromHash } : base;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(workspaceReducer, null, loadState);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* in-memory only is fine; the prototype does not depend on storage */
    }
  }, [state]);

  const go = (view: View) => {
    dispatch({ type: 'setView', view });
    if (window.location.hash !== `#/${view}`) window.location.hash = `#/${view}`;
  };

  useEffect(() => {
    const onHashChange = () => {
      const view = viewFromHash();
      if (view) dispatch({ type: 'setView', view });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navItems: { view: View; label: string; count?: number }[] = [
    { view: 'screening', label: 'Screening workspace' },
    { view: 'comparison', label: 'Comparison dashboard', count: state.comparisonIds.length },
    { view: 'traceability', label: 'What this covers' },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <h1>Registration &amp; Recruitment Workspace</h1>
          <span className="app-sub">
            {CYCLE_LABEL} · prototype · seeded pool snapshot {formatDate(TODAY)} · anything you
            record is stamped with the current time
          </span>
        </div>

        <nav className="app-nav" aria-label="Primary">
          {navItems.map((item) => (
            <button
              key={item.view}
              className={`nav-btn ${state.view === item.view ? 'active' : ''}`}
              onClick={() => go(item.view)}
            >
              {item.label}
              {item.count ? <span className="nav-count">{item.count}</span> : null}
            </button>
          ))}
        </nav>

        <div className="app-user">
          <span className="user-chip" title="Prototype: no authentication or roles are implemented">
            Signed in as <strong>{REVIEWER_NAME}</strong> · Reviewer
          </span>
          <button className="btn small ghost" onClick={() => dispatch({ type: 'reset' })}>
            Reset demo data
          </button>
        </div>
      </header>

      <main className="app-main">
        {state.view === 'screening' && (
          <ScreeningWorkspace
            applicants={state.applicants}
            comparisonIds={state.comparisonIds}
            selectedId={state.selectedId}
            onSelect={(id) => dispatch({ type: 'select', id })}
            onDecide={(id, decision: Decision) => dispatch({ type: 'decide', id, decision })}
            onReverse={(id) => dispatch({ type: 'reverse', id })}
            onFinalize={(id) => dispatch({ type: 'finalize', id })}
            onSaveNotes={(id, notes) => dispatch({ type: 'saveNotes', id, notes })}
            onAddToComparison={(id) => dispatch({ type: 'addToComparison', id })}
            onOpenComparison={() => go('comparison')}
          />
        )}

        {state.view === 'comparison' && (
          <ComparisonDashboard
            applicants={state.applicants}
            comparisonIds={state.comparisonIds}
            onRemove={(id) => dispatch({ type: 'removeFromComparison', id })}
            onBackToScreening={() => go('screening')}
            onAddShortlisted={() =>
              state.applicants
                .filter((a) => a.status === 'Shortlisted')
                .forEach((a) => dispatch({ type: 'addToComparison', id: a.id }))
            }
          />
        )}

        {state.view === 'traceability' && <TraceabilityTable />}
      </main>

      <footer className="app-footer">
        <p className="app-footer__note">
          Front-end demonstration of product and UX decisions — in-memory seeded data, no backend,
          no authentication, no vendor integration. Scores stand in for the automated assessment
          import.
        </p>
        <p className="app-footer__credit">
          Made by <strong>elfandrifitrah</strong> for SQE case study assignment
        </p>
      </footer>
    </div>
  );
}
