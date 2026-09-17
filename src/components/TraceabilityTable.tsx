const PAIN_POINTS: { pain: string; where: string; coverage: string }[] = [
  {
    pain: 'No decision capture — reviewers work from a spreadsheet built off a nightly CSV export',
    where: 'Screen A — screening decision panel and audit trail',
    coverage: 'Built',
  },
  {
    pain: 'No comparison tooling — the director rebuilds side-by-side decks in PowerPoint, taking days',
    where: 'Screen B — Candidate Comparison Dashboard',
    coverage: 'Built (export is a labelled placeholder)',
  },
  {
    pain: 'Duplicates go undetected until interview stage (academy vs. institute)',
    where: 'Screen A — Signals column in the queue and the duplicate banner on the detail panel',
    coverage: 'Built',
  },
  {
    pain: 'Assessment handling is manual — IT pulls results and retypes them next to the right applicant',
    where: 'Screen A — assessment block with import provenance',
    coverage: 'State demonstrated, vendor integration seeded',
  },
  {
    pain: 'One-size-fits-all form — irrelevant fields are simply ignored',
    where: 'Screen A — application answer list, tagging fields that do not apply to the programme',
    coverage: 'Illustrated; per-country form configuration described only',
  },
];

const REQUIREMENTS: { item: string; coverage: string; note: string }[] = [
  {
    item: '#1 Configurable forms per country',
    coverage: 'Described, not built',
    note: 'Full country-admin form builder is a future iteration.',
  },
  {
    item: '#3 Duplicate detection (academy / institute)',
    coverage: 'Built',
    note: 'Flag in the queue plus a linked banner on the detail panel.',
  },
  {
    item: '#6 Screening decision capture',
    coverage: 'Built',
    note: 'Decision, reviewer, timestamp, reversibility and finalization.',
  },
  {
    item: '#7 Automated assessment score import',
    coverage: 'Built as seeded state',
    note: 'No vendor call is made; the import provenance is what is being demonstrated.',
  },
  {
    item: '#8 Onboarding API handoff',
    coverage: 'Out of scope',
    note: 'A downstream screen, not part of the screening gap.',
  },
  {
    item: '#9 Screening comparison and export',
    coverage: 'Partly built',
    note: 'Comparison is real; export is a clearly-labelled non-functional placeholder.',
  },
  {
    item: '#13 Country-admin form configuration',
    coverage: 'Out of scope',
    note: 'Admin tooling is a separate surface from the reviewer workspace.',
  },
  {
    item: 'Applicant intake form',
    coverage: 'Out of scope',
    note: 'Intake already exists; it is not the demonstrated gap.',
  },
  {
    item: 'Interview scheduling',
    coverage: 'Out of scope',
    note: 'Logical next screen after screening.',
  },
];

export function TraceabilityTable() {
  return (
    <div className="traceability">
      <h2>What this prototype addresses, and where</h2>
      <p className="lede">
        Every element below traces to a pain point from the case interviews or a requirement in
        the requirements log. Where something is deliberately not built, it says so rather than
        implying it is solved.
      </p>

      <h3>Case pain points → where they are closed</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Pain point</th>
            <th>Where the prototype answers it</th>
            <th>Coverage</th>
          </tr>
        </thead>
        <tbody>
          {PAIN_POINTS.map((row) => (
            <tr key={row.pain}>
              <td>{row.pain}</td>
              <td>{row.where}</td>
              <td>
                <span className="coverage-tag">{row.coverage}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Requirements log → prototype coverage</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Requirement</th>
            <th>Coverage</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {REQUIREMENTS.map((row) => (
            <tr key={row.item}>
              <td>{row.item}</td>
              <td>
                <span className="coverage-tag">{row.coverage}</span>
              </td>
              <td>{row.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
