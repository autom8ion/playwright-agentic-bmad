// Turns a k6 --summary-export JSON into markdown for the GitHub Actions job summary.
// Usage: node perf/summary-markdown.mjs perf/results/api-baseline.json [dashboard-url] >> "$GITHUB_STEP_SUMMARY"
import { readFileSync } from 'node:fs';

const [file, dashboardUrl] = process.argv.slice(2);
const { metrics } = JSON.parse(readFileSync(file, 'utf8'));
const byName = ([a], [b]) => a.localeCompare(b);

// A metric with no samples (e.g. an endpoint never reached) has no stats; show a dash instead of crashing.
const ms = (v) => (v == null ? '–' : `${v.toFixed(0)} ms`);
const pct = (v) => (v == null ? '–' : `${(v * 100).toFixed(2)}%`);
const isDuration = (name) => name.startsWith('http_req_duration') || name.startsWith('iteration_duration');

// k6 marks each threshold true when it was crossed (failed).
const thresholdRows = [];
for (const [name, m] of Object.entries(metrics).sort(byName)) {
  for (const [expr, crossed] of Object.entries(m.thresholds ?? {})) {
    const stat = expr.match(/^([a-z]+(?:\(\d+(?:\.\d+)?\))?)/)?.[1];
    const value = stat === 'rate' ? m.value : m[stat];
    const shown = stat === 'rate' ? pct(value) : isDuration(name) ? ms(value) : (value ?? '–');
    thresholdRows.push(`| \`${name}\` | \`${expr}\` | ${shown} | ${crossed ? '❌ fail' : '✅ pass'} |`);
  }
}
const failed = thresholdRows.filter((r) => r.includes('❌')).length;

const endpointRows = Object.entries(metrics)
  .sort(byName)
  .filter(([name]) => name.startsWith('http_req_duration{name:'))
  .map(([name, m]) => {
    const endpoint = name.slice('http_req_duration{name:'.length, -1);
    return `| ${endpoint} | ${ms(m.avg)} | ${ms(m.med)} | ${ms(m['p(90)'])} | ${ms(m['p(95)'])} | ${ms(m.max)} |`;
  });

const reqs = metrics.http_reqs;
const lines = [
  `## k6 API baseline (NFR3): ${failed ? `❌ ${failed} threshold(s) crossed` : '✅ all thresholds passed'}`,
  '',
  `**${reqs.count}** requests at **${reqs.rate.toFixed(1)}/s**, ` +
    `**${metrics.iterations.count}** iterations, ` +
    `errors **${pct(metrics.http_req_failed.value)}**, checks **${pct(metrics.checks.value)}**`,
  '',
  '### Thresholds',
  '| Metric | Threshold | Actual | Result |',
  '|---|---|---|---|',
  ...thresholdRows,
  '',
  '### Latency by endpoint',
  '| Endpoint | avg | med | p90 | p95 | max |',
  '|---|---|---|---|---|---|',
  ...endpointRows,
];
if (dashboardUrl) {
  lines.push('', `📊 **[Download the full k6 dashboard report](${dashboardUrl})**: a zip with \`dashboard.html\` (time-series charts for latency, throughput and errors) and the raw JSON summary`);
}
console.log(lines.join('\n'));
