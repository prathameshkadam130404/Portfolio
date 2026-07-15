/* ==============================================================
   Prathamesh Kadam — Portfolio
   Interactions: reveal, counters, cursor dot, hero phrase,
   and interactive workflow panels (live-traced pipelines).
   ============================================================== */
(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  /* ---------- hero word rotation ---------- */
  const swap = document.getElementById('heroSwap');
  if (swap && !reducedMotion) {
    const phrases = [
      'measure themselves.',
      'correct themselves.',
      'earn their claims.',
      'survive real data.'
    ];
    let idx = 0;
    setInterval(() => {
      swap.classList.add('fading');
      setTimeout(() => {
        idx = (idx + 1) % phrases.length;
        swap.textContent = phrases[idx];
        swap.classList.remove('fading');
      }, 500);
    }, 4200);
  }

  /* ---------- scroll reveal ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  /* ---------- counters ---------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const start = performance.now();
    const duration = 1200;
    (function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (t < 1) requestAnimationFrame(tick);
    })(start);
  }
  const countObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    }
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach((el) => {
    if (reducedMotion) {
      el.textContent = parseFloat(el.dataset.count)
        .toFixed(parseInt(el.dataset.decimals || '0', 10));
    } else {
      countObserver.observe(el);
    }
  });

  /* ---------- nav ---------- */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  const burger = document.getElementById('navBurger');
  const menu = document.getElementById('navMenu');
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ==============================================================
     INTERACTIVE WORKFLOW PANELS
     Each spec: nodes (each explains itself), edges (dot paths),
     groups (dashed phase containers), and scenario controls
     (mode buttons or a slider) that re-route the traveling dot
     and rewrite the status box. All figures are measured values.
     ============================================================== */

  const FLOWS = {

    /* --- hero: the working loop --- */
    loop: {
      bare: true, w: 230, h: 158,
      nodes: [
        { id: 'build',   x: 71, y: 8,   w: 88, h: 30, label: 'BUILD' },
        { id: 'measure', x: 134, y: 108, w: 88, h: 30, label: 'MEASURE' },
        { id: 'correct', x: 8,  y: 108, w: 88, h: 30, label: 'CORRECT' }
      ],
      edges: [
        { id: 'l1', d: 'M155,38 C182,56 190,80 182,108' },
        { id: 'l2', d: 'M134,123 L100,123' },
        { id: 'l3', d: 'M48,108 C40,80 48,56 75,38' }
      ],
      modes: [{ id: 'run', route: ['l1', 'l2', 'l3'], on: ['l1', 'l2', 'l3'], dots: 1 }]
    },

    /* --- Agentic Corrective RAG --- */
    acr: {
      name: 'ACR PIPELINE', sub: 'Self-correcting retrieval, traced live',
      w: 736, h: 202, minw: 660,
      ctlLabel: 'EVIDENCE GRADE',
      groups: [
        { x: 196, y: 70, w: 278, h: 62, label: 'RETRIEVAL' },
        { x: 460, y: 70, w: 146, h: 126, label: 'CORRECTION' }
      ],
      nodes: [
        { id: 'q',      x: 8,   y: 82, w: 64,  h: 36, label: 'QUERY',
          desc: 'The user’s question enters the LangGraph state machine.' },
        { id: 'router', x: 100, y: 78, w: 76,  h: 44, label: 'ROUTE', sub: 'in scope?',
          desc: 'A router decides whether the docs can answer at all — greetings and off-topic questions are refused honestly instead of hallucinated.' },
        { id: 'retr',   x: 204, y: 78, w: 128, h: 44, label: 'RETRIEVE', sub: 'dense+BM25 · RRF',
          desc: 'Hybrid retrieval: Qwen3 dense embeddings and BM25 run in parallel, merged with reciprocal-rank fusion.' },
        { id: 'rerank', x: 360, y: 78, w: 104, h: 44, label: 'RERANK', sub: 'cross-encoder',
          desc: 'A Qwen3 cross-encoder reorders the candidates. Hybrid + reranking took hit@5 from 86% to 100%.' },
        { id: 'grade',  x: 492, y: 78, w: 88,  h: 44, label: 'GRADE', sub: 'CRAG',
          desc: 'The agent grades its own evidence — strong, ambiguous, or weak. This self-check is the corrective heart of the system.' },
        { id: 'web',    x: 468, y: 152, w: 136, h: 40, label: 'WEB SEARCH', sub: 'fallback',
          desc: 'When docs are weak the agent searches the web. Coverage rose to 28/29 answerable — but abstention fell 90%→60%, a documented trade-off.' },
        { id: 'gen',    x: 608, y: 78, w: 120, h: 44, label: 'GENERATE', sub: 'cited answer',
          desc: 'Grounded generation with citations — or an honest “I don’t know”. Faithfulness reached 0.80 on the hard set.' }
      ],
      edges: [
        { id: 'e1', d: 'M72,100 L100,100' },
        { id: 'e2', d: 'M176,100 L204,100' },
        { id: 'e3', d: 'M332,100 L360,100' },
        { id: 'e4', d: 'M464,100 L492,100' },
        { id: 'e5', d: 'M580,100 L608,100' },
        { id: 'eloop', d: 'M536,78 L536,36 L268,36 L268,78', dashed: true,
          label: 'ambiguous → rewrite query', lx: 402, ly: 28 },
        { id: 'ew1', d: 'M536,122 L536,152', dashed: true },
        { id: 'ew2', d: 'M604,172 L668,172 L668,122', dashed: true }
      ],
      modes: [
        { id: 'strong', label: 'STRONG', dots: 1,
          route: ['e1', 'e2', 'e3', 'e4', 'e5'],
          on: ['e1', 'e2', 'e3', 'e4', 'e5'],
          status: 'Evidence is strong — the graph generates straight from the retrieved docs. Measured on the easy set: hit@5 100%, faithfulness 0.94.' },
        { id: 'ambiguous', label: 'AMBIGUOUS', dots: 1,
          route: ['e1', 'e2', 'e3', 'e4', 'eloop', 'e2', 'e3', 'e4', 'e5'],
          on: ['e1', 'e2', 'e3', 'e4', 'e5', 'eloop'],
          status: 'Evidence is ambiguous — the query is rewritten and retrieval retried in a bounded loop, then generation proceeds. No infinite self-correction.' },
        { id: 'weak', label: 'WEAK', dots: 1,
          route: ['e1', 'e2', 'e3', 'e4', 'ew1', 'ew2'],
          on: ['e1', 'e2', 'e3', 'e4', 'ew1', 'ew2'],
          status: 'Docs are weak — the web-search fallback answers instead. This lifted coverage to 28/29 but cut out-of-scope abstention from 90% to 60%: measured, reported, then fixed with a stronger router.' }
      ]
    },

    /* --- MLOps predictive maintenance --- */
    mlops: {
      name: 'RUL PIPELINE', sub: 'Drift-aware serving, end to end',
      w: 776, h: 152, minw: 680,
      slider: { label: 'SENSOR DRIFT', min: 0, max: 100, value: 15, unit: 'σ' },
      nodes: [
        { id: 'raw',   x: 8,   y: 48, w: 84,  h: 44, label: 'RAW DATA', sub: 'C-MAPSS',
          desc: '21 turbofan sensor channels from the NASA C-MAPSS FD001 benchmark stream into the pipeline.' },
        { id: 'gate',  x: 120, y: 48, w: 108, h: 44, label: 'SCHEMA GATE', sub: 'Pandera',
          desc: 'Physical sensor bounds are encoded as Pandera contracts and run as a DVC pipeline gate — corrupt data fails loudly before it can reach the model.' },
        { id: 'feat',  x: 256, y: 48, w: 120, h: 44, label: 'FEATURES', sub: 'shared pipeline',
          desc: 'One FeaturePipeline class is fit at training time, serialized, and reloaded for serving — train–serve skew is structurally impossible.' },
        { id: 'train', x: 404, y: 48, w: 112, h: 44, label: 'TRAIN', sub: 'XGBoost · MLflow',
          desc: 'XGBoost RUL regressor: R² = 0.993 on 20K samples. Every run is logged to MLflow with config hashing for exact reproducibility.' },
        { id: 'serve', x: 544, y: 48, w: 88,  h: 44, label: 'SERVE', sub: 'FastAPI',
          desc: 'The Dockerized API calls the very same .transform() the trainer used, then .predict(). 64 pytest tests cover the pipeline.' },
        { id: 'drift', x: 660, y: 48, w: 108, h: 44, label: 'MONITOR', sub: '3-layer drift',
          desc: 'Layer 1: Kolmogorov–Smirnov test per feature. Layer 2: Wasserstein distance. Layer 3: concept drift on prediction error.' }
      ],
      edges: [
        { id: 'm1', d: 'M92,70 L120,70' },
        { id: 'm2', d: 'M228,70 L256,70' },
        { id: 'm3', d: 'M376,70 L404,70' },
        { id: 'm4', d: 'M516,70 L544,70' },
        { id: 'm5', d: 'M632,70 L660,70' },
        { id: 'mloop', d: 'M714,92 L714,126 L460,126 L460,92', dashed: true,
          label: 'drift → CI retraining', lx: 587, ly: 140 }
      ],
      zones: [
        { upTo: 39, dots: 1,
          route: ['m1', 'm2', 'm3', 'm4', 'm5'],
          on: ['m1', 'm2', 'm3', 'm4', 'm5'],
          status: 'Distributions within bounds — the KS test is quiet and the model keeps serving. Baseline R² = 0.993.' },
        { upTo: 74, dots: 1,
          route: ['m1', 'm2', 'm3', 'm4', 'm5'],
          on: ['m1', 'm2', 'm3', 'm4', 'm5'],
          status: 'Layer 1 flags a shifting sensor; the Wasserstein layer confirms the drift is building. Monitoring continues — no retrain yet, no alert fatigue.' },
        { upTo: 100, dots: 2,
          route: ['m1', 'm2', 'm3', 'm4', 'm5', 'mloop', 'm4', 'm5'],
          on: ['m1', 'm2', 'm3', 'm4', 'm5', 'mloop'],
          status: 'Concept drift confirmed — the monitor exits non-zero and GitHub Actions retrains and redeploys automatically. No human in the loop required.' }
      ]
    },

    /* --- Governor: budget-aware agent loop --- */
    governor: {
      name: 'GOVERNOR', sub: 'The quota gauge, in front of the model',
      w: 736, h: 206, minw: 660,
      ctlLabel: 'BUDGET BAND',
      groups: [
        { x: 140, y: 66, w: 488, h: 60, label: 'AWARENESS' },
        { x: 140, y: 148, w: 372, h: 56, label: 'DURABILITY' }
      ],
      nodes: [
        { id: 'feed',    x: 8,   y: 74,  w: 112, h: 44, label: 'BUDGET FEED', sub: 'statusline JSON',
          desc: 'Claude Code already emits context and quota data (5h / 7d windows) to the statusline — for humans. Governor’s collector persists it so the model can see it too. No scraping, no undocumented APIs.' },
        { id: 'burn',    x: 148, y: 74,  w: 112, h: 44, label: 'BURN MODEL', sub: 'wtd. regression',
          desc: 'A recency-weighted least-squares slope over recent samples projects minutes-to-dry, raced against the reset clock. A significance gate — slope must exceed 2× its standard error — suppresses noise-driven escalations.' },
        { id: 'band',    x: 288, y: 74,  w: 88,  h: 44, label: 'BAND', sub: 'hysteresis',
          desc: 'CRUISE → ECONOMY → WIND-DOWN → CHECKPOINT, from whichever is most severe: context %, 5h or 7d projection. Escalates instantly; de-escalates only after the lower band holds — no flapping.' },
        { id: 'inject',  x: 404, y: 74,  w: 100, h: 44, label: 'INJECT', sub: 'per tool batch',
          desc: 'Hooks inject the [governor] line at turn start and mid-turn after every tool batch — push-based, like native context awareness, not a tool the model must remember to call.' },
        { id: 'model',   x: 532, y: 74,  w: 88,  h: 44, label: 'MODEL', sub: 'policy skill',
          desc: 'A policy skill defines what each band requires. Subagent spawn prompts are rewritten in-flight so parallel agents inherit the current band and a durable-output contract.' },
        { id: 'journal', x: 148, y: 156, w: 112, h: 40, label: 'JOURNAL', sub: 'every tool call',
          desc: 'A ledger of every tool call, plus every subagent’s final message teed to disk the moment it stops — durability that needs zero model cooperation.' },
        { id: 'resume',  x: 404, y: 156, w: 100, h: 40, label: 'RESUME.md', sub: 'checkpoint',
          desc: 'Agent-written checkpoint in WIND-DOWN; on a rate-limit death, a machine-generated RESUME.auto.md is built from the journal instead.' },
        { id: 'next',    x: 576, y: 156, w: 136, h: 40, label: 'NEXT SESSION', sub: 'auto-restore',
          desc: 'Session start injects the checkpoint and preserved subagent outputs into the next session — the work survives even when the conversation doesn’t.' }
      ],
      edges: [
        { id: 'n1', d: 'M120,96 L148,96' },
        { id: 'n2', d: 'M260,96 L288,96' },
        { id: 'n3', d: 'M376,96 L404,96' },
        { id: 'n4', d: 'M504,96 L532,96' },
        { id: 'ntee', d: 'M64,118 L64,176 L148,176', dashed: true },
        { id: 'b1', d: 'M260,176 L404,176' },
        { id: 'b2', d: 'M504,176 L576,176' },
        { id: 'nwrite', d: 'M576,118 L576,140 L454,140 L454,156', dashed: true },
        { id: 'nrestore', d: 'M644,156 L644,32 L64,32 L64,74', dashed: true,
          label: 'checkpoint + subagent outputs restored at session start', lx: 354, ly: 24 }
      ],
      modes: [
        { id: 'cruise', label: 'CRUISE', dots: 2,
          route: ['n1', 'n2', 'ntee', 'b1'],
          on: ['n1', 'n2', 'ntee', 'b1'],
          status: 'Headroom everywhere — the model hears nothing, because CRUISE stays silent by design. The durability layer never sleeps: every tool call is journaled and every subagent’s output is teed to disk regardless.' },
        { id: 'economy', label: 'ECONOMY', dots: 1,
          route: ['n1', 'n2', 'n3', 'n4'],
          on: ['n1', 'n2', 'n3', 'n4', 'ntee', 'b1'],
          status: 'Quota past 70% — or the burn projection says dry-before-reset. The [governor] line reaches the model every 5th batch: targeted reads, batched calls, cheap subagents. In live validation this fired at 67% used, below the threshold, because the slope said dry in ~30 minutes.' },
        { id: 'winddown', label: 'WIND-DOWN', dots: 1,
          route: ['n1', 'n2', 'n3', 'n4', 'nwrite'],
          on: ['n1', 'n2', 'n3', 'n4', 'nwrite', 'ntee', 'b1'],
          status: 'Finish the unit in hand, start nothing new. In the live validation transcript the model declined a fresh 3-part refactor, wrote .governor/RESUME.md with the execution order, and told the user when the window resets.' },
        { id: 'checkpoint', label: 'CHECKPOINT', dots: 2,
          route: ['ntee', 'b1', 'b2', 'nrestore'],
          on: ['ntee', 'b1', 'b2', 'nrestore'],
          status: 'The window slams shut — announced or not. A checkpoint is machine-built from the journal, preserved subagent outputs stay on disk, and the next session restores all of it at start. An unannounced cutoff costs one turn, not the session.' }
      ]
    },

    /* --- ML inference gateway --- */
    gateway: {
      name: 'INFERENCE GATEWAY', sub: 'Adaptive micro-batching under load',
      w: 768, h: 168, minw: 680,
      slider: { label: 'LOAD', min: 0, max: 100, value: 25, unit: ' req/s' },
      nodes: [
        { id: 'client', x: 8,   y: 48, w: 80,  h: 44, label: 'CLIENT', sub: 'REST',
          desc: 'Callers POST /api/v1/predict with an Idempotency-Key header.' },
        { id: 'rate',   x: 116, y: 48, w: 104, h: 44, label: 'RATE LIMIT', sub: 'Redis · Lua',
          desc: 'A token bucket implemented as a Redis Lua script — over-limit requests are rejected before any expensive work happens.' },
        { id: 'rej',    x: 128, y: 128, w: 80, h: 32, label: '429', sub: 'rejected',
          desc: 'Fail fast: surplus requests never touch PostgreSQL or the model server.' },
        { id: 'idem',   x: 248, y: 48, w: 116, h: 44, label: 'IDEMPOTENCY', sub: 'PostgreSQL',
          desc: 'Seen this key before? The stored JSON returns instantly — inference runs exactly once per key, even under client retries.' },
        { id: 'batch',  x: 392, y: 48, w: 116, h: 44, label: 'BATCHER', sub: '16 req / 15 ms',
          desc: 'Java 21 virtual threads park on futures while a queue drains into micro-batches: 16 requests or 15 ms, whichever comes first.' },
        { id: 'grpc',   x: 536, y: 48, w: 88,  h: 44, label: 'gRPC', sub: 'resilience4j',
          desc: 'A bulkhead caps in-flight batches; a circuit breaker opens past 50% failures; only safe gRPC errors are retried.' },
        { id: 'onnx',   x: 652, y: 48, w: 104, h: 44, label: 'ONNX', sub: 'Python server',
          desc: 'ONNX Runtime scores the whole batch in one call — GPU/CPU throughput without starving individual requests.' }
      ],
      edges: [
        { id: 'g1', d: 'M88,70 L116,70' },
        { id: 'g2', d: 'M220,70 L248,70' },
        { id: 'g3', d: 'M364,70 L392,70' },
        { id: 'g4', d: 'M508,70 L536,70' },
        { id: 'g5', d: 'M624,70 L652,70' },
        { id: 'grej', d: 'M168,92 L168,128', dashed: true },
        { id: 'gret', d: 'M704,92 L704,144 L48,144 L48,92', dashed: true,
          label: 'futures complete → 200 OK', lx: 376, ly: 158 }
      ],
      zones: [
        { upTo: 44, dots: 1,
          route: ['g1', 'g2', 'g3', 'g4', 'g5', 'gret'],
          on: ['g1', 'g2', 'g3', 'g4', 'g5', 'gret'],
          status: 'Light traffic — batches close by the 15 ms timeout with a few requests each. Latency stays flat.' },
        { upTo: 79, dots: 3,
          route: ['g1', 'g2', 'g3', 'g4', 'g5', 'gret'],
          on: ['g1', 'g2', 'g3', 'g4', 'g5', 'gret'],
          status: 'The queue fills faster than 15 ms — batches now close at 16 requests and model-server utilization climbs. This is adaptive micro-batching earning its keep.' },
        { upTo: 100, dots: 3,
          route: ['g1', 'g2', 'g3', 'g4', 'g5', 'gret'],
          on: ['g1', 'g2', 'g3', 'g4', 'g5', 'gret', 'grej'],
          status: 'Token bucket exhausted — surplus requests get 429 in microseconds while admitted traffic still batches cleanly. The model server never notices the storm.' }
      ]
    },

    /* --- quantum kernel --- */
    qk: {
      name: 'QUANTUM KERNEL BENCH', sub: 'One pipeline, three feature maps',
      w: 704, h: 152, minw: 640,
      ctlLabel: 'FEATURE MAP',
      nodes: [
        { id: 'data', x: 8,   y: 48, w: 112, h: 44, label: 'EO DATA', sub: 'So2Sat · EuroSAT',
          desc: 'Sentinel satellite patches plus four UCI tabular sets and a TFIM physics benchmark — up to N = 10,000 samples at n = 16 qubits.' },
        { id: 'map',  x: 148, y: 48, w: 132, h: 44, label: 'FEATURE MAP', sub: 'Bell decomposition',
          desc: 'Two-qubit generators built from Bell-state projectors, weighted by a prior. One hyperparameter τ, locked once at n = 8.' },
        { id: 'gram', x: 308, y: 48, w: 112, h: 44, label: 'GRAM MATRIX', sub: 'state overlaps',
          desc: 'Pairwise fidelities between encoded quantum states fill the kernel matrix — the quantum part of the pipeline.' },
        { id: 'svm',  x: 448, y: 48, w: 88,  h: 44, label: 'SVM', sub: 'precomputed',
          desc: 'A classical SVM consumes the precomputed quantum kernel — clean separation between quantum encoding and classical learning.' },
        { id: 'bench', x: 564, y: 48, w: 132, h: 44, label: 'BENCHMARK', sub: 'vs ZZ-PQK',
          desc: 'Holm-corrected Wilcoxon across seeds and folds — with an honest classical RBF-SVM baseline that still ties or wins. No advantage claim.' }
      ],
      edges: [
        { id: 'k1', d: 'M120,70 L148,70' },
        { id: 'k2', d: 'M280,70 L308,70' },
        { id: 'k3', d: 'M420,70 L448,70' },
        { id: 'k4', d: 'M536,70 L564,70' },
        { id: 'ktau', d: 'M630,92 L630,126 L214,126 L214,92', dashed: true,
          label: 'τ locked at n=8 → transfers to n=16', lx: 422, ly: 140 }
      ],
      modes: [
        { id: 'zz', label: 'ZZ-PQK', dots: 1,
          route: ['k1', 'k2', 'k3', 'k4'],
          on: ['k1', 'k2', 'k3', 'k4'],
          status: 'The commuting ZZ feature map — the canonical baseline our construction is measured against.' },
        { id: 'bscm', label: 'BSCM', dots: 1,
          route: ['k1', 'k2', 'k3', 'k4', 'ktau', 'k2', 'k3', 'k4'],
          on: ['k1', 'k2', 'k3', 'k4', 'ktau'],
          status: 'All four Bell sectors under an adjustable prior: +0.167 macro-F1 over ZZ-PQK on So2Sat (Holm-corrected p = 0.0078), and α_ZZ ≡ 0 under the uniform prior.' },
        { id: 'srqfm', label: 'SRQFM', dots: 1,
          route: ['k1', 'k2', 'k3', 'k4', 'ktau', 'k2', 'k3', 'k4'],
          on: ['k1', 'k2', 'k3', 'k4', 'ktau'],
          status: 'The singlet-sector member of the same family — positive gap over the ZZ baseline on every dataset split tested, stable under depolarising noise.' }
      ]
    }
  };

  /* ---------- svg helpers ---------- */
  function svgEl(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function buildSvg(spec, prefix) {
    const svg = svgEl('svg', {
      viewBox: `0 0 ${spec.w} ${spec.h}`,
      class: 'flow-svg',
      role: 'presentation'
    });
    if (spec.minw) svg.style.minWidth = spec.minw + 'px';

    // arrowheads
    const defs = svgEl('defs', {});
    for (const [mid, cls] of [[`${prefix}-mg`, 'fmark'], [`${prefix}-ma`, 'fmark on']]) {
      const marker = svgEl('marker', {
        id: mid, viewBox: '0 0 8 8', refX: 7, refY: 4,
        markerWidth: 6.5, markerHeight: 6.5, orient: 'auto-start-reverse'
      });
      const tip = svgEl('path', { d: 'M0,0.6 L7.4,4 L0,7.4', class: cls });
      marker.appendChild(tip);
      defs.appendChild(marker);
    }
    svg.appendChild(defs);

    (spec.groups || []).forEach((g) => {
      svg.appendChild(svgEl('rect', {
        x: g.x, y: g.y, width: g.w, height: g.h, class: 'fgroup'
      }));
      const t = svgEl('text', { x: g.x + 4, y: g.y - 6, class: 'fgroup-label' });
      t.textContent = g.label;
      svg.appendChild(t);
    });

    const edgeEls = {};
    spec.edges.forEach((e) => {
      const p = svgEl('path', {
        d: e.d,
        class: 'fedge' + (e.dashed ? ' dashed' : ''),
        'marker-end': `url(#${prefix}-mg)`
      });
      p.dataset.marker = prefix;
      svg.appendChild(p);
      edgeEls[e.id] = p;
      if (e.label) {
        const t = svgEl('text', { x: e.lx, y: e.ly, class: 'fedge-label' });
        t.textContent = e.label;
        svg.appendChild(t);
      }
    });

    const nodeEls = {};
    spec.nodes.forEach((n) => {
      const g = svgEl('g', { class: 'fnode', tabindex: spec.bare ? -1 : 0 });
      g.dataset.id = n.id;
      g.appendChild(svgEl('rect', {
        x: n.x, y: n.y, width: n.w, height: n.h, rx: 2
      }));
      const cx = n.x + n.w / 2;
      const label = svgEl('text', {
        x: cx, y: n.y + (n.sub ? n.h / 2 - 3 : n.h / 2 + 3.5),
        class: 'fnode-label', 'text-anchor': 'middle'
      });
      label.textContent = n.label;
      g.appendChild(label);
      if (n.sub) {
        const sub = svgEl('text', {
          x: cx, y: n.y + n.h / 2 + 11,
          class: 'fnode-sub', 'text-anchor': 'middle'
        });
        sub.textContent = n.sub;
        g.appendChild(sub);
      }
      svg.appendChild(g);
      nodeEls[n.id] = g;
    });

    return { svg, edgeEls, nodeEls };
  }

  /* ---------- dot animator: constant travel along a route ---------- */
  function makeAnimator(svg, edgeEls) {
    const SPEED = 55; // px per second
    let dots = [];
    let segs = [];   // [{path, len}]
    let total = 0;
    let running = false;
    let rafId = null;
    let last = 0;
    let offset = 0;

    function setRoute(edgeIds, dotCount) {
      segs = edgeIds.map((id) => {
        const path = edgeEls[id];
        return { path, len: path.getTotalLength() };
      });
      total = segs.reduce((s, x) => s + x.len, 0);
      dots.forEach((d) => d.remove());
      dots = [];
      for (let i = 0; i < dotCount; i++) {
        const c = svgEl('circle', { r: 3.4, class: 'fdot' });
        svg.appendChild(c);
        dots.push(c);
      }
      offset = 0;
      place();
    }

    function pointAt(dist) {
      let d = ((dist % total) + total) % total;
      for (const s of segs) {
        if (d <= s.len) return s.path.getPointAtLength(d);
        d -= s.len;
      }
      return segs[0].path.getPointAtLength(0);
    }

    function place() {
      if (!total) return;
      dots.forEach((c, i) => {
        const p = pointAt(offset + (total / dots.length) * i);
        c.setAttribute('cx', p.x);
        c.setAttribute('cy', p.y);
      });
    }

    function frame(now) {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      offset += SPEED * dt;
      place();
      rafId = requestAnimationFrame(frame);
    }

    return {
      setRoute,
      start() {
        if (running || reducedMotion || !total) return;
        running = true;
        last = performance.now();
        rafId = requestAnimationFrame(frame);
      },
      stop() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
      }
    };
  }

  /* ---------- panel controller ---------- */
  function initPanel(fig) {
    const spec = FLOWS[fig.dataset.flow];
    if (!spec) return;
    const prefix = 'fm-' + fig.dataset.flow;
    const { svg, edgeEls, nodeEls } = buildSvg(spec, prefix);

    const canvas = document.createElement('div');
    canvas.className = 'flow-canvas';
    canvas.appendChild(svg);

    let statusText = null;
    let scenarioStatus = '';
    let ctlEl = null;

    if (!spec.bare) {
      const side = document.createElement('div');
      side.className = 'flow-side';

      const name = document.createElement('p');
      name.className = 'flow-name';
      name.textContent = spec.name;
      const sub = document.createElement('p');
      sub.className = 'flow-sub';
      sub.textContent = spec.sub;
      side.append(name, sub);

      ctlEl = document.createElement('div');
      ctlEl.className = 'flow-ctl';
      side.appendChild(ctlEl);

      const status = document.createElement('div');
      status.className = 'flow-status';
      const sh = document.createElement('p');
      sh.className = 'mono-label';
      sh.textContent = 'STATUS';
      statusText = document.createElement('p');
      statusText.className = 'flow-status-text';
      status.append(sh, statusText);
      side.appendChild(status);

      const hint = document.createElement('p');
      hint.className = 'flow-hint mono-label';
      hint.textContent = 'click any stage to inspect it';
      side.appendChild(hint);

      fig.prepend(side, canvas);
    } else {
      fig.prepend(canvas);
    }

    const animator = makeAnimator(svg, edgeEls);
    if (ctlEl) buildControls(ctlEl);

    function applyScenario(sc) {
      for (const id in edgeEls) edgeEls[id].classList.remove('on');
      (sc.on || []).forEach((id) => edgeEls[id].classList.add('on'));
      for (const id in edgeEls) {
        edgeEls[id].setAttribute('marker-end',
          `url(#${prefix}-${edgeEls[id].classList.contains('on') ? 'ma' : 'mg'})`);
      }
      animator.setRoute(sc.route, reducedMotion ? 0 : (sc.dots || 1));
      if (statusText && sc.status) {
        scenarioStatus = sc.status;
        setStatus(sc.status);
      }
    }

    function setStatus(text) {
      statusText.textContent = text;
      statusText.classList.remove('flash');
      void statusText.offsetWidth;
      statusText.classList.add('flash');
    }

    function buildControls(ctl) {
      if (spec.modes && spec.modes.length > 1) {
        const lab = document.createElement('p');
        lab.className = 'mono-label';
        lab.textContent = spec.ctlLabel || 'MODE';
        ctl.appendChild(lab);
        const wrap = document.createElement('div');
        wrap.className = 'flow-modes';
        spec.modes.forEach((m, i) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.textContent = m.label;
          if (i === 0) b.classList.add('active');
          b.addEventListener('click', () => {
            wrap.querySelectorAll('button').forEach((x) => x.classList.remove('active'));
            b.classList.add('active');
            clearSelection();
            applyScenario(m);
          });
          wrap.appendChild(b);
        });
        ctl.appendChild(wrap);
      }

      if (spec.slider) {
        const s = spec.slider;
        const lab = document.createElement('p');
        lab.className = 'mono-label flow-slider-label';
        const val = document.createElement('span');
        val.className = 'flow-slider-val';
        lab.textContent = s.label + ' ';
        lab.appendChild(val);
        ctl.appendChild(lab);

        const input = document.createElement('input');
        input.type = 'range';
        input.min = s.min;
        input.max = s.max;
        input.value = s.value;
        input.setAttribute('aria-label', s.label.toLowerCase());
        ctl.appendChild(input);

        let zoneIdx = -1;
        const update = () => {
          const v = parseInt(input.value, 10);
          val.textContent = v + s.unit;
          const zi = spec.zones.findIndex((z) => v <= z.upTo);
          if (zi !== zoneIdx) {
            zoneIdx = zi;
            clearSelection();
            applyScenario(spec.zones[zi]);
          }
        };
        input.addEventListener('input', update);
        update();
      }
    }

    function clearSelection() {
      for (const id in nodeEls) nodeEls[id].classList.remove('sel');
    }

    // node inspection: every box explains itself
    if (!spec.bare) {
      const byId = {};
      spec.nodes.forEach((n) => { byId[n.id] = n; });
      const inspect = (g) => {
        const n = byId[g.dataset.id];
        if (!n || !n.desc) return;
        const already = g.classList.contains('sel');
        clearSelection();
        if (already) {
          setStatus(scenarioStatus);
        } else {
          g.classList.add('sel');
          setStatus(n.label + ' — ' + n.desc);
        }
      };
      for (const id in nodeEls) {
        nodeEls[id].addEventListener('click', () => inspect(nodeEls[id]));
        nodeEls[id].addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inspect(nodeEls[id]);
          }
        });
      }
    }

    // initial scenario
    if (spec.modes) {
      applyScenario(spec.modes[0]);
    } else if (spec.slider) {
      // slider's update() already applied its zone
    }

    // run the dot only while visible
    const vis = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) animator.start();
        else animator.stop();
      });
    }, { threshold: 0.15 });
    vis.observe(fig);
  }

  document.querySelectorAll('[data-flow]').forEach(initPanel);
})();
