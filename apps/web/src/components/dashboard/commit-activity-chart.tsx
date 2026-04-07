import type { CommitActivity } from "@/types/github";

type Props = {
  branch: string;
  activity: CommitActivity;
};

/** Affiche les ~26 dernières semaines pour la lisibilité. */
const DISPLAY_WEEKS = 26;

/** Axes : date ISO uniquement (zéro Intl, zéro ambiguïté SSR/CSR). */
function axisLabel(ymd: string): string {
  return ymd.length >= 10 ? ymd.slice(0, 10) : ymd;
}

export function CommitActivityChart({ branch, activity }: Props) {
  const { weeks, source } = activity;
  const slice =
    weeks.length > DISPLAY_WEEKS ? weeks.slice(-DISPLAY_WEEKS) : weeks;

  if (slice.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
        <p className="text-sm text-zinc-500">
          Aucune donnée d’activité par semaine pour la branche{" "}
          <span className="font-mono text-cyan-400">{branch}</span> (dépôt vide ou
          API indisponible).
        </p>
      </div>
    );
  }

  const max = Math.max(1, ...slice.map((w) => w.count));
  const w = 600;
  const h = 200;
  const padL = 36;
  const padR = 12;
  const padT = 16;
  const padB = 36;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  const points = slice.map((row, i) => {
    const x =
      padL +
      (slice.length <= 1 ? innerW / 2 : (i / (slice.length - 1)) * innerW);
    const y = padT + innerH - (row.count / max) * innerH;
    return { x, y, ...row };
  });

  const baseY = padT + innerH;
  let lineD: string;
  let areaD: string;
  if (points.length === 1) {
    const p = points[0];
    lineD = `M ${p.x.toFixed(1)} ${baseY.toFixed(1)} L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    areaD = `M ${(p.x - 2).toFixed(1)} ${baseY.toFixed(1)} L ${p.x.toFixed(1)} ${p.y.toFixed(1)} L ${(p.x + 2).toFixed(1)} ${baseY.toFixed(1)} Z`;
  } else {
    lineD = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");
    const last = points[points.length - 1];
    const first = points[0];
    areaD = `${lineD} L ${last.x.toFixed(1)} ${baseY.toFixed(1)} L ${first.x.toFixed(1)} ${baseY.toFixed(1)} Z`;
  }

  const sourceLabel =
    source === "participation"
      ? "API GitHub — stats/participation (52 semaines glissantes)"
      : source === "commits_fallback"
        ? "API GitHub — liste des commits agrégés par semaine (repli)"
        : "";

  const gradId = `commitFill-${slice[0].weekStart.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="h-auto w-full min-w-[320px]"
          role="img"
          aria-label={`Activité des commits sur ${branch}, ${slice.length} semaines`}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line
            x1={padL}
            y1={padT + innerH}
            x2={padL + innerW}
            y2={padT + innerH}
            stroke="#3f3f46"
            strokeWidth="1"
          />
          <path d={areaD} fill={`url(#${gradId})`} />
          <path
            d={lineD}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {points.map((p) => (
            <circle
              key={p.weekStart}
              cx={p.x}
              cy={p.y}
              r={3}
              fill="#0a0a0f"
              stroke="#22d3ee"
              strokeWidth="1.5"
              aria-label={`${p.weekStart}: ${p.count} commit${p.count > 1 ? "s" : ""}`}
            />
          ))}
          <text x={padL} y={h - 8} className="fill-zinc-500" fontSize="10">
            {axisLabel(slice[0].weekStart)}
          </text>
          <text
            x={w - padR}
            y={h - 8}
            className="fill-zinc-500"
            fontSize="10"
            textAnchor="end"
          >
            {axisLabel(slice[slice.length - 1].weekStart)}
          </text>
        </svg>
      </div>
      <p className="text-xs text-zinc-600">
        Branche <span className="font-mono text-zinc-500">{branch}</span>
        {sourceLabel ? ` · ${sourceLabel}` : null}
      </p>
    </div>
  );
}
