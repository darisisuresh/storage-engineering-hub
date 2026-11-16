# Storage Performance Analyzer — v1.5.0

Open [the analyzer](https://darisisuresh.github.io/storage-engineering-hub/#performance) from the sidebar or search for “CSV telemetry”. This implements the shared review's performance analyzer proposal: CSV metrics, time-aligned comparisons, workload baselines, trends and evidence-backed next checks. No equipment or AI API is contacted.

## Use

1. Choose **Explore synthetic demo**, upload a redacted UTF-8 CSV, or expand **Paste CSV instead**. The demo and downloadable sample identify every system as `SYNTHETIC-DEMO`.
2. Review the column mapping and explicitly confirm units. Map a timestamp and at least one metric; system and resource labels are optional. Include the collection layer in labels when comparing host, application or array measurements.
3. Choose a primary workload and, optionally, a second workload. The comparison uses the same UTC axis/windows; primary statistics and findings remain separate from the comparison's visual context. Comparison results are also retained in the analysis JSON.
4. Choose nonoverlapping baseline and analysis windows in UTC, chart alignment and heuristic thresholds. Click **Analyze selected windows**. Changing controls invalidates earlier results/exports until recalculation.
5. Inspect charts, coverage/trends and each finding's supporting CSV records. Download the analysis JSON and/or normalized CSV if needed. Clear the import, leave the route or reload to discard telemetry in active memory.

## CSV contract

Canonical header:

```csv
timestamp,system,resource,iops,throughput_mib_s,latency_p95_ms,latency_p99_ms,queue_depth,used_gib,total_gib
2026-01-01T12:00:00Z,SYNTHETIC-EXAMPLE,synthetic-volume,12000,180,2,4,12,600,1000
```

Other header names can be mapped manually. A source column can map to only one field. Unmapped or blank metrics remain null, never zero. All records must contain at least one supplied metric. Blank system/resource labels use `Imported system` / `Imported workload`.

| Field | Meaning / accepted units |
| --- | --- |
| timestamp | ISO 8601 with seconds and explicit `Z` or UTC offset; valid calendar date, 1970–9999 |
| system, resource | Redacted labels, up to 128 characters each, no control characters |
| iops | Nonnegative operations per second, already a rate |
| throughput | MiB/s (2²⁰ bytes), MB/s (10⁶ bytes) or bytes/s; normalized to MiB/s |
| p95, p99 | Already-reported interval latency quantiles in ms, us or s; normalized to ms. P99 must be ≥ P95 when both are present |
| queue | Nonnegative outstanding I/O, potentially an interval average; not a configured queue limit |
| used, total | GiB, TiB, GB, TB or bytes; normalized to GiB. Total must be positive and ≥ used when paired |

CSV supports BOM, CRLF/LF, quoted commas/newlines and doubled quotes using the [RFC 4180 field model](https://www.rfc-editor.org/rfc/rfc4180). Control characters in labels are still rejected. Limits: 5 MiB, 20,000 nonempty data records, 64 columns, 8,192 characters per field and 100 distinct system/resource workloads. Headers must be nonempty/unique and records rectangular. Numeric values must be finite, nonnegative and ≤ 10¹⁵ after normalization. Percent strings, thousands separators, cumulative counters and timestamp guessing are not supported.

Duplicate system/resource/timestamp samples reject the import rather than silently averaging. Out-of-order samples sort by UTC with a visible notice. Records are numbered by nonempty CSV record order, starting at 2 after the header; numbers are not physical line numbers when fields contain newlines or blank records were skipped. Semicolon/tab-delimited files must be converted to comma-delimited CSV first. An invalid replacement import removes old results and export controls.

## Calculations and safeguards against misleading results

- Baseline defaults to the first third of distinct primary timestamps; analysis defaults to the remainder. A one-timestamp import has an empty preceding baseline. Overlapping baseline/analysis windows reject the comparison. Empty analysis windows reject analysis; an empty baseline leaves relative changes unavailable.
- Summary statistics use every raw nonblank metric sample with equal sample weight: count, min, peak, arithmetic mean and sample median. They are not time-weighted; unequal collection intervals/missingness can bias comparisons. Mean P95/P99 describe means of supplied interval quantiles, not operation-level percentiles.
- Relative baseline changes require at least three values in both windows. A zero baseline produces an absolute delta but no percent change. Ratios outside the supported numeric range also remain unavailable with an explicit status. No infinity, synthetic zeros or invented compatibility/health score is emitted.
- Trend slope uses ordinary least squares against elapsed UTC hours, with at least three values and nonzero elapsed time. Rising/falling flags require R² ≥ 0.5 and a fitted end-to-end shift ≥ 20% of sample mean. Constant values are flat; other results say no strong linear trend. These criteria are transparent heuristics. R² is goodness of fit, not probability, causal evidence or confidence; slopes are not forecasts.
- Charts use exact timestamps or fixed 1/5/15-minute UTC buckets per workload. IOPS/throughput/queue use sample means; latency uses **maximum reported quantile per bucket**, not a merged percentile; capacity uses the last available metric value. Capacity percentage, when computed internally, requires used/total from the same original record. Missing values are not carried forward or interpolated. Separate y-axes are labeled by chart, with a shared time range.
- Gaps exceed 2.5 times median observed cadence. Chart segments break across gaps/nulls. Large segments use an ordered min/max envelope to retain extrema; exact raw values remain in calculations and exports. The accessible raw sample table initially shows up to 200 analysis records; finding links include the exact supporting record when outside that subset or in the baseline.

Reported quantiles cannot be pooled into a new overall percentile without underlying distributions; see [Prometheus quantile guidance](https://prometheus.io/docs/practices/histograms/). Metric scope and I/O size matter when interpreting IOPS/throughput: [NetApp SANtricity performance interpretation](https://docs.netapp.com/us-en/e-series-santricity-118/sm-storage/interpret-performance-data.html). Host-side queueing can make client latency differ from storage latency; [Google Cloud NetApp performance sizing](https://docs.cloud.google.com/netapp/volumes/docs/plan-and-prepare/volume-performance-sizing) explains this measurement distinction. These references support interpretation, not the tool's heuristic threshold values.

## Findings

Default review thresholds are P95 > 10 ms, P99 > 20 ms, queue > 64 outstanding I/O, paired capacity ≥ 80%, and absolute baseline shift ≥ 50%. They are demonstration heuristics, **not vendor limits or recommended universal SLOs**; set them for your measurement layer and workload objectives.

Rules count actual breaches and cite up to five original CSV records/timestamps. Baseline-shift findings cite samples from both windows. Queue/latency coincidence uses the same original sample, not visually adjacent points. Capacity findings require paired used/total samples. Suggested checks are read-only investigations of layer, clocks, workload mix, path health, QoS, background activity and measurement scope. Correlation, high queue depth or a workload shift does not establish saturation or root cause. No rule firing is explicitly not a health certification. No capacity exhaustion date or production setting change is proposed.

## Privacy and exports

Telemetry, mappings, analysis settings and results never enter toolkit localStorage/sessionStorage. The application CSP blocks application connections. The sample's labels are synthetic; real imports must be redacted before entry. Imported data is discarded when leaving the route, clearing the import or reloading; normal browser/device/extension behavior remains outside this boundary.

Analysis JSON (`seh-performance-report/v1`) includes app version, source label, synthetic-demo flag, export UTC time, normalized units, windows, thresholds, statistics, source records, findings, optional comparison, limitations and references. Normalized CSV includes **all accepted workloads**, not only the current selection. String labels beginning with spreadsheet formula prefixes are apostrophe-prefixed and CSV-quoted in exports; numeric cells remain numeric. Downloads can contain sensitive imported identifiers and must be reviewed before sharing. See [privacy.txt](../privacy.txt).

## Implementation and validation

- `src/performance/csv.js`: bounded parser, timestamp/metric validation, mapping, unit normalization and safe CSV/sample exports.
- `analysis.js`: UTC alignment, raw statistics, regression, coverage, heuristic findings and report composition.
- `charts.js`: accessible native SVG small multiples and extrema-preserving plot reduction.
- `ui.js`: ephemeral import/mapping/control/result lifecycle, evidence navigation and downloads.
- `src/styles/performance.css`: shared-theme responsive layout.
- `tests/performance.test.mjs` and `tests/performance-browser.cjs`: analytical fixtures and complete browser workflows.

Existing P0 planning gates are unchanged. Passing unit/browser checks does not validate collectors, authenticate imported telemetry or certify physical storage equipment. Vendor-specific raw export adapters, time-weighted interval integration, raw histogram pooling, automated root-cause diagnosis and live collection are outside this version.
