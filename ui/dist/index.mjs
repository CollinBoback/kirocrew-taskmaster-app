import { jsx as o, jsxs as l, Fragment as re } from "react/jsx-runtime";
import { useState as w, useRef as O, useCallback as A, useEffect as se, useMemo as Xe } from "react";
import { useAppApi as Je, useNotify as Qe, useNavBadge as Ze, useChatLauncher as et, useAppEvents as tt, ChatEmbed as nt } from "@kirocrew/app-sdk";
import { MarkdownRenderer as ot } from "@kirocrew/ui";
function ie(i) {
  return `taskmaster-${i.id}`;
}
let Ee = 0;
function P(i) {
  return Ee += 1, `${i}-${Date.now().toString(36)}-${Ee.toString(36)}`;
}
function rt() {
  return { version: 1, settings: { memorySync: !0 }, activeTaskId: null, tasks: [] };
}
function st(i) {
  var N;
  const u = rt();
  if (typeof i != "object" || i === null) return u;
  const c = i, y = Array.isArray(c.tasks) ? c.tasks.filter(Le).map(it) : u.tasks, x = typeof c.settings == "object" && c.settings !== null ? { memorySync: c.settings.memorySync !== !1 } : u.settings, M = typeof c.activeTaskId == "string" ? c.activeTaskId : null;
  return {
    version: 1,
    settings: x,
    activeTaskId: y.some((B) => B.id === M) ? M : ((N = y[0]) == null ? void 0 : N.id) ?? null,
    tasks: y
  };
}
function Le(i) {
  return typeof i == "object" && i !== null && typeof i.title == "string";
}
function it(i) {
  const u = Array.isArray(i.subtasks) ? i.subtasks.filter(Le).map((c) => ({
    id: typeof c.id == "string" ? c.id : P("sub"),
    title: String(c.title),
    done: c.done === !0,
    ...typeof c.command == "string" && c.command.trim() ? { command: c.command } : {},
    ...typeof c.output == "string" && c.output ? { output: c.output } : {},
    ...c.source === "agent" || c.source === "manual" ? { source: c.source } : {}
  })) : [];
  return {
    id: typeof i.id == "string" ? i.id : P("task"),
    title: String(i.title),
    ...typeof i.estimateMinutes == "number" && i.estimateMinutes > 0 ? { estimateMinutes: Math.round(i.estimateMinutes) } : {},
    createdAt: typeof i.createdAt == "string" ? i.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
    subtasks: u,
    ...i.lessonPosted === !0 ? { lessonPosted: !0 } : {},
    ...i.slotStarted === !0 ? { slotStarted: !0 } : {}
  };
}
function Ne(i) {
  const u = i.subtasks.length, c = i.subtasks.filter((y) => y.done).length;
  return { done: c, total: u, pct: u === 0 ? 0 : Math.round(c / u * 100) };
}
function at(i) {
  const u = i.subtasks.findIndex((c) => !c.done);
  return u === -1 ? Math.max(0, i.subtasks.length - 1) : u;
}
function lt(i) {
  const u = /```(?:json)?\s*([\s\S]*?)```/.exec(i), c = [];
  u != null && u[1] && c.push(u[1]);
  const y = i.indexOf("["), x = i.lastIndexOf("]");
  y !== -1 && x > y && c.push(i.slice(y, x + 1));
  for (const M of c)
    try {
      const N = JSON.parse(M);
      if (!Array.isArray(N)) continue;
      const B = N.filter((T) => typeof T == "object" && T !== null).map((T) => ({
        title: typeof T.title == "string" ? T.title.trim() : "",
        ...typeof T.command == "string" && T.command.trim() ? { command: T.command.trim() } : {}
      })).filter((T) => T.title.length > 0).slice(0, 12);
      if (B.length > 0) return B;
    } catch {
    }
  return null;
}
function dt(i) {
  const u = i.subtasks.map((c, y) => `${y + 1}. ${c.title}${c.command ? ` [${c.command}]` : ""}`);
  return `Completed "${i.title}" via micro-steps: ${u.join(" ")}`;
}
function ct(i) {
  if (typeof i != "object" || i === null) return { messages: [], running: !1 };
  const u = i;
  return { messages: Array.isArray(u.messages) ? u.messages.filter((y) => typeof y == "object" && y !== null) : [], running: u.running === !0 };
}
const Ae = /^\s*STEP RESULT \[(\d+)\]:\s*(done|failed)\s*(?:[—–:-]\s*)?(.*)$/gim;
function ut(i) {
  const u = [];
  Ae.lastIndex = 0;
  let c;
  for (; (c = Ae.exec(i)) !== null; )
    u.push({
      index: Number.parseInt(c[1], 10),
      ok: c[2].toLowerCase() === "done",
      summary: c[3].trim()
    });
  return u;
}
const Me = "/api/apps/taskmaster-pro/config", pt = 200, Be = "notification scope · slot polling", mt = 2500, gt = 900 * 1e3, ze = 4e3, t = {
  bg: "var(--bg, #030712)",
  card: "var(--card, #0b1329)",
  border: "var(--border, #1e293b)",
  text: "var(--text, #f1f5f9)",
  muted: "var(--muted, #94a3b8)",
  focus: "#34d399",
  kiro: "#818cf8",
  warn: "var(--warn, #d29922)",
  danger: "var(--danger, #e5534b)"
}, E = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
function ft() {
  return (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0];
}
function St() {
  const i = Je(), u = Qe(), c = Ze(), { openChat: y } = et(), [x, M] = w(null), [N, B] = w("focus"), [T, De] = w({}), [ae, Oe] = w([]), [I, le] = w(null), [G, de] = w(null), [ce, ue] = w(""), [pe, me] = w(""), [ge, fe] = w(""), [he, be] = w(""), [Y, X] = w(null), [S, j] = w(null), W = O(null);
  W.current = x;
  const ye = O(Promise.resolve()), ke = O(0), J = O({}), z = O(null);
  z.current = S;
  const F = O({}), Q = O(!1), g = A((e, n) => {
    Oe((a) => [{ ts: ft(), level: e, msg: n }, ...a].slice(0, pt));
  }, []), xe = A(
    (e) => {
      M(e), W.current = e;
      const n = ++ke.current;
      ye.current = ye.current.then(async () => {
        if (n === ke.current)
          try {
            await i.put(Me, e);
          } catch (a) {
            g("warn", `Config save failed: ${String(a)}`);
          }
      });
    },
    [i, g]
  ), v = A(
    (e) => {
      const n = W.current;
      n && xe(e(n));
    },
    [xe]
  ), Z = A(
    (e) => {
      i.get(Me).then((n) => {
        e != null && e() || (M(st(n)), de(null), g("info", "Loaded task state from gateway app config."));
      }).catch((n) => {
        e != null && e() || (M(null), de(`Config load failed (${String(n)}) — retry to continue.`), g("warn", `Config load failed: ${String(n)}`));
      });
    },
    [i, g]
  );
  se(() => {
    let e = !1;
    return Z(() => e), i.get("/api/status").then((n) => {
      e || (le(typeof n == "object" && n !== null ? n : {}), g("ok", "Connected to Kiro Crew gateway."));
    }).catch(() => {
      e || g("warn", "Gateway status unavailable.");
    }), g("info", `Console mode: ${Be} — gateway event forwarding to app pages is pending upstream.`), () => {
      e = !0;
    };
  }, [Z]);
  const Se = A(
    (e) => {
      u(`Task complete: ${e.title}`), g("ok", `Task "${e.title}" fully completed.`);
      const n = W.current;
      !(n != null && n.settings.memorySync) || e.lessonPosted || J.current[e.id] || (J.current[e.id] = !0, i.post("/api/lessons", { rule: dt(e), category: "knowledge" }).then(() => {
        v((a) => ({
          ...a,
          tasks: a.tasks.map((s) => s.id === e.id ? { ...s, lessonPosted: !0 } : s)
        })), g("ok", "Kiro Memory: appended solution path to lessons (category: knowledge).");
      }).catch((a) => g("warn", `Memory sync failed: ${String(a)}`)).finally(() => {
        delete J.current[e.id];
      }));
    },
    [i, u, g, v]
  ), U = A(
    (e, n, a, s) => {
      let d = null;
      v((p) => {
        const f = p.tasks.map((m) => {
          if (m.id !== e) return m;
          const C = m.subtasks.map(
            (R) => R.id === n ? { ...R, done: a, ...s !== void 0 ? { output: s } : {} } : R
          ), h = { ...m, subtasks: C }, $ = m.subtasks.length > 0 && m.subtasks.every((R) => R.done);
          return C.length > 0 && C.every((R) => R.done) && !$ && (d = h), h;
        });
        return { ...p, tasks: f };
      }), d && Se(d);
    },
    [v, Se]
  );
  tt("notification", (e) => {
    const n = typeof e == "object" && e !== null ? e : {}, a = typeof n.title == "string" ? n.title : "notification", s = typeof n.text == "string" ? n.text : "";
    g("info", `Gateway notification [${a}]: ${s.slice(0, 200)}`);
  });
  function We(e, n) {
    v((a) => ({
      ...a,
      tasks: a.tasks.map((s) => {
        if (s.id !== e) return s;
        const d = new Set(s.subtasks.map((f) => f.title.toLowerCase())), p = n.filter((f) => !d.has(f.title.toLowerCase())).map((f) => ({ id: P("sub"), title: f.title, done: !1, source: "agent", ...f.command ? { command: f.command } : {} }));
        return { ...s, subtasks: [...s.subtasks, ...p] };
      })
    })), g("ok", `Taskmaster agent drafted ${n.length} micro-step(s).`), u(`Added ${n.length} drafted micro-steps`);
  }
  const ve = A(
    async (e) => ct(await i.get(`/api/chat/slots/${encodeURIComponent(e)}`)),
    [i]
  ), ee = A(
    (e, n, a) => {
      v((s) => ({
        ...s,
        tasks: s.tasks.map(
          (d) => d.id === e ? { ...d, subtasks: d.subtasks.map((p) => p.id === n ? { ...p, output: a } : p) } : d
        )
      }));
    },
    [v]
  );
  async function te(e, n, a) {
    if (z.current) return;
    const s = ie(e);
    if (!(s in F.current))
      try {
        F.current[s] = (await ve(s)).messages.length;
      } catch {
        F.current[s] = 0;
      }
    Q.current = !1, j({ ...a, sentAt: Date.now() }), e.slotStarted || v((d) => ({
      ...d,
      tasks: d.tasks.map((p) => p.id === e.id ? { ...p, slotStarted: !0 } : p)
    })), i.post("/api/chat", { message: n, slot: s, agent: "taskmaster" }).catch((d) => {
      var p;
      d instanceof SyntaxError || (g("err", `Send to task slot failed: ${String(d)}`), u("Could not reach the gateway", { type: "error" }), ((p = z.current) == null ? void 0 : p.taskId) === e.id && j(null));
    }), g("info", `Sent to task slot ${s}: ${n.split(`
`)[0].slice(0, 120)}`);
  }
  const je = A(
    (e, n) => {
      var p;
      const a = (p = W.current) == null ? void 0 : p.tasks.find((f) => f.id === e.taskId);
      if (!a) return { settled: !0, stepSucceeded: !1 };
      let s = !1, d = !1;
      for (const f of n) {
        if (f.role === "user" || !f.content) continue;
        Q.current = !0;
        const m = f.content;
        if (e.kind === "draft") {
          const h = lt(m);
          h && (We(e.taskId, h), s = !0);
          continue;
        }
        const C = ut(m);
        for (const h of C) {
          const $ = a.subtasks[h.index - 1];
          if (!$) {
            g("warn", `Agent reported STEP RESULT [${h.index}] but the task has no such step.`);
            continue;
          }
          const D = C.length === 1 ? m.slice(0, ze) : `${h.ok ? "done" : "failed"} — ${h.summary || "(no summary)"}`;
          h.ok ? (U(e.taskId, $.id, !0, D), g("ok", `Step ${h.index} completed by agent: ${h.summary || $.title}`), d = !0) : (ee(e.taskId, $.id, D), g("warn", `Step ${h.index} failed: ${h.summary || "(no summary)"}`)), e.kind === "step" && (s = !0);
        }
      }
      return { settled: s, stepSucceeded: d };
    },
    [g, U, ee]
  );
  se(() => {
    if (!S) return;
    const e = ie({ id: S.taskId });
    let n = !1;
    const a = async () => {
      var $;
      const d = z.current;
      if (n || !d) return;
      if (Date.now() - d.sentAt > gt) {
        g("warn", "Agent request timed out — check the task chat."), j(null);
        return;
      }
      let p;
      try {
        p = await ve(e);
      } catch {
        return;
      }
      const f = F.current[e] ?? 0, m = p.running ? Math.max(0, p.messages.length - 1) : p.messages.length, C = p.messages.slice(f, m);
      F.current[e] = Math.max(f, m);
      const h = C.length > 0 ? je(d, C) : { settled: !1, stepSucceeded: !1 };
      if (h.settled && d.kind !== "all") {
        d.kind === "step" && h.stepSucceeded && u("Step completed via taskmaster agent", { type: "success" }), j(null);
        return;
      }
      if (!p.running && Q.current) {
        if (d.kind === "all")
          g("ok", "Agent finished the run — see per-step results above and the task chat.");
        else if (d.kind === "draft")
          g("warn", "Draft reply had no parseable json block — see the task chat."), u("Agent reply was not parseable — see the task chat");
        else {
          const D = ($ = W.current) == null ? void 0 : $.tasks.find((V) => V.id === d.taskId), R = d.stepIndex != null ? D == null ? void 0 : D.subtasks[d.stepIndex] : void 0, H = [...C].reverse().find((V) => V.role !== "user" && V.content);
          R && (H != null && H.content) && ee(d.taskId, R.id, H.content.slice(0, ze)), g("warn", "Agent reply had no STEP RESULT marker — step left for manual toggle.");
        }
        j(null);
      }
    }, s = setInterval(() => void a(), mt);
    return a(), () => {
      n = !0, clearInterval(s);
    };
  }, [S == null ? void 0 : S.sentAt]);
  function Fe(e, n, a) {
    !n.command || z.current || (g("info", `Kiro terminal execute (step ${a + 1}): ${n.command}`), te(
      e,
      `Run micro-step [${a + 1}] of task "${e.title}": ${n.title}
Execute this terminal command and report concise output:
${n.command}
End your reply with exactly one line: STEP RESULT [${a + 1}]: done|failed — <short summary>`,
      { taskId: e.id, kind: "step", stepIndex: a }
    ));
  }
  function Ce(e) {
    if (z.current) return;
    const n = e.subtasks.map((a) => a.title).join("; ") || "none";
    g("info", `Requesting micro-step breakdown for "${e.title}".`), u("Taskmaster agent is drafting micro-steps…"), te(
      e,
      `Break the task "${e.title}"${e.estimateMinutes ? ` (~${e.estimateMinutes}m)` : ""} into micro-steps per the taskmaster-method skill. Reply with ONE fenced json code block containing an array of {"title", "command"?} objects and no prose outside it.
Existing steps (do not duplicate): ${n}`,
      { taskId: e.id, kind: "draft" }
    );
  }
  function Pe(e) {
    if (z.current) return;
    const n = e.subtasks.map((s, d) => ({ sub: s, index: d })).filter(({ sub: s }) => !s.done);
    if (n.length === 0) return;
    const a = n.map(({ sub: s, index: d }) => `[${d + 1}] ${s.title}${s.command ? ` — command: ${s.command}` : ""}`).join(`
`);
    g("info", `Running ${n.length} remaining step(s) unattended via taskmaster agent.`), u(`Agent is running ${n.length} remaining step(s)…`), te(
      e,
      `Execute the remaining micro-steps of task "${e.title}" in order, autonomously:
${a}
After finishing each step output one line: STEP RESULT [n]: done|failed — <short summary>. If a step cannot be completed autonomously, mark it failed with the reason and continue to the next.`,
      { taskId: e.id, kind: "all" }
    );
  }
  function Te(e) {
    const n = e.subtasks.filter((a) => !a.done).map((a) => a.title);
    y({
      agent: "taskmaster",
      message: `Check in on task "${e.title}". Remaining micro-steps: ${n.join("; ") || "none"}. Help me with the next one.`
    });
  }
  async function Ge(e) {
    try {
      await i.post("/api/crons", {
        name: `taskmaster-${e.id}`,
        cron: "0 9 * * 1-5",
        agent: "taskmaster",
        message: `Taskmaster routine check-in on task "${e.title}". Review current progress and report the single next micro-step.`
      }), g("ok", `Cron registered: weekday 09:00 routine check-in on "${e.title}".`), u("Routine scheduled — weekdays 09:00");
    } catch (n) {
      g("err", `Cron registration failed: ${String(n)}`), u("Could not register the cron");
    }
  }
  function we() {
    const e = ce.trim();
    if (!e) return;
    const n = Number.parseInt(pe, 10), a = {
      id: P("task"),
      title: e,
      ...Number.isFinite(n) && n > 0 ? { estimateMinutes: n } : {},
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      subtasks: []
    };
    v((s) => ({ ...s, tasks: [...s.tasks, a], activeTaskId: s.activeTaskId ?? a.id })), ue(""), me(""), g("info", `Task added to backlog: "${e}"`);
  }
  function ne(e) {
    const n = ge.trim();
    if (!n) return;
    const a = he.trim(), s = { id: P("sub"), title: n, done: !1, source: "manual", ...a ? { command: a } : {} };
    v((d) => ({
      ...d,
      tasks: d.tasks.map((p) => p.id === e.id ? { ...p, subtasks: [...p.subtasks, s] } : p)
    })), fe(""), be("");
  }
  function Ue(e) {
    v((n) => {
      var s;
      const a = n.tasks.filter((d) => d.id !== e);
      return { ...n, tasks: a, activeTaskId: n.activeTaskId === e ? ((s = a[0]) == null ? void 0 : s.id) ?? null : n.activeTaskId };
    }), X(null), g("info", "Task removed from backlog.");
  }
  function Ke(e) {
    v((n) => ({ ...n, activeTaskId: e })), B("focus");
  }
  const k = Xe(() => x ? x.tasks.find((e) => e.id === x.activeTaskId) ?? x.tasks[0] ?? null : null, [x]), L = k ? Math.max(
    0,
    Math.min(T[k.id] ?? at(k), Math.max(0, k.subtasks.length - 1))
  ) : 0, b = (k == null ? void 0 : k.subtasks[L]) ?? null, qe = k ? Ne(k) : null, K = k ? k.subtasks.filter((e) => !e.done).length : 0;
  se(() => {
    try {
      c(K);
    } catch {
    }
  }, [K, c]);
  function oe(e, n) {
    De((a) => ({ ...a, [e]: n }));
  }
  if (!x)
    return /* @__PURE__ */ o("div", { style: { ...r.root, alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ l("div", { style: { display: "grid", gap: 10, justifyItems: "center" }, children: [
      /* @__PURE__ */ o("span", { style: { color: t.muted, fontSize: 13 }, children: G ?? "Loading Taskmaster Pro…" }),
      G ? /* @__PURE__ */ o("button", { className: "tm-btn", style: r.primaryBtn, onClick: () => Z(), children: "Retry load" }) : null
    ] }) });
  const Ie = x.tasks.length, $e = x.settings.memorySync;
  let q;
  switch (N) {
    case "focus":
      q = Ve();
      break;
    case "backlog":
      q = _e();
      break;
    case "console":
      q = Ye();
      break;
    default: {
      const e = N;
      throw new Error(`Unhandled view: ${String(e)}`);
    }
  }
  function He() {
    const e = [
      { id: "focus", label: "★ Focus" },
      { id: "backlog", label: `Backlog (${Ie})` },
      { id: "console", label: "Console" }
    ];
    return /* @__PURE__ */ o("div", { style: r.tabRow, children: e.map((n) => /* @__PURE__ */ o(
      "button",
      {
        className: "tm-btn",
        style: { ...r.tab, ...N === n.id ? r.tabActive : {} },
        onClick: () => B(n.id),
        children: n.label
      },
      n.id
    )) });
  }
  function Re() {
    return /* @__PURE__ */ l("div", { style: r.addRow, children: [
      /* @__PURE__ */ o(
        "input",
        {
          style: { ...r.input, flex: 1 },
          placeholder: "New task title…",
          value: ce,
          onChange: (e) => ue(e.target.value),
          onKeyDown: (e) => {
            e.key === "Enter" && we();
          }
        }
      ),
      /* @__PURE__ */ o(
        "input",
        {
          style: { ...r.input, width: 74 },
          placeholder: "~min",
          inputMode: "numeric",
          value: pe,
          onChange: (e) => me(e.target.value)
        }
      ),
      /* @__PURE__ */ o("button", { className: "tm-btn", style: r.btnPrimary, onClick: we, children: "ADD TASK" })
    ] });
  }
  function Ve() {
    if (!k)
      return /* @__PURE__ */ l("section", { className: "tm-card", style: { ...r.card, textAlign: "center" }, children: [
        /* @__PURE__ */ o("div", { style: { fontSize: 28, marginBottom: 8 }, children: "⚡" }),
        /* @__PURE__ */ o("div", { style: { fontSize: 15, fontWeight: 700 }, children: "No task in focus" }),
        /* @__PURE__ */ o("p", { style: { color: t.muted, fontSize: 12, margin: "6px 0 14px" }, children: "Add your first task — the taskmaster agent can draft its micro-steps." }),
        Re()
      ] });
    const e = k, n = qe ?? { done: 0, total: 0, pct: 0 }, a = ie(e), s = (S == null ? void 0 : S.taskId) === e.id ? S : null, d = !!(b && (s == null ? void 0 : s.kind) === "step" && s.stepIndex === L), p = (s == null ? void 0 : s.kind) === "draft", f = (s == null ? void 0 : s.kind) === "all";
    return /* @__PURE__ */ l(re, { children: [
      /* @__PURE__ */ l("section", { className: "tm-card", style: { ...r.card, paddingTop: 20, position: "relative", overflow: "hidden" }, children: [
        /* @__PURE__ */ o("div", { style: r.gradientStrip }),
        /* @__PURE__ */ l("div", { style: r.centerCol, children: [
          /* @__PURE__ */ l("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }, children: [
            /* @__PURE__ */ o("span", { style: { ...r.chip, color: t.focus, borderColor: "rgba(52,211,153,0.35)", background: "rgba(52,211,153,0.08)" }, children: "★ TASKMASTER ACTIVE" }),
            /* @__PURE__ */ l(
              "button",
              {
                className: "tm-btn",
                style: {
                  ...r.chip,
                  cursor: "pointer",
                  ...$e ? { color: t.kiro, borderColor: "rgba(129,140,248,0.35)", background: "rgba(129,140,248,0.08)" } : { color: t.muted, borderColor: t.border, background: "transparent" }
                },
                title: "One lesson is stored per completed task when ON",
                onClick: () => v((m) => ({ ...m, settings: { memorySync: !m.settings.memorySync } })),
                children: [
                  "🧠 MEMORY SYNC: ",
                  $e ? "ON" : "OFF"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ o("p", { style: { color: t.muted, fontSize: 11, fontStyle: "italic", margin: "10px 0 6px" }, children: "Isolation mode active. Execute one step at a time." }),
          /* @__PURE__ */ o("h2", { style: r.taskTitle, children: e.title }),
          /* @__PURE__ */ l("div", { style: { display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", justifyContent: "center" }, children: [
            e.estimateMinutes != null && /* @__PURE__ */ l("span", { style: { ...r.chip, color: "#38bdf8", borderColor: t.border, fontFamily: E }, children: [
              "~",
              e.estimateMinutes,
              "m"
            ] }),
            /* @__PURE__ */ o("button", { className: "tm-btn", style: { ...r.chip, cursor: "pointer", color: t.text, borderColor: t.border }, onClick: () => void Ge(e), children: "⏰ SCHEDULE ROUTINE (CRON)" }),
            /* @__PURE__ */ o("button", { className: "tm-btn", style: { ...r.chip, cursor: "pointer", color: t.text, borderColor: t.border }, onClick: () => Te(e), children: "💬 OPEN IN CHAT" })
          ] })
        ] }),
        /* @__PURE__ */ o("div", { style: r.progressTrack, role: "progressbar", "aria-valuenow": n.pct, "aria-valuemin": 0, "aria-valuemax": 100, children: /* @__PURE__ */ o("div", { style: { ...r.progressFill, width: `${n.pct}%` } }) }),
        /* @__PURE__ */ l("div", { style: { textAlign: "right", color: t.muted, fontSize: 11, marginTop: 6, fontFamily: E }, children: [
          n.done,
          "/",
          n.total,
          " · ",
          n.pct,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ l("section", { className: "tm-card", style: { ...r.card, borderColor: "rgba(52,211,153,0.3)" }, children: [
        /* @__PURE__ */ l("div", { style: r.stepHeader, children: [
          /* @__PURE__ */ l("span", { style: { ...r.stepCounter, color: t.focus }, children: [
            /* @__PURE__ */ o("span", { className: "tm-pulse", style: r.pulseDot }),
            e.subtasks.length === 0 ? "NO MICRO-STEPS YET" : `ACTIVE MICRO-STEP ${L + 1} OF ${e.subtasks.length}`
          ] }),
          /* @__PURE__ */ l("span", { style: { display: "flex", gap: 6 }, children: [
            /* @__PURE__ */ o("button", { className: "tm-btn", style: r.navBtn, onClick: () => oe(e.id, Math.max(0, L - 1)), children: "◄" }),
            /* @__PURE__ */ o(
              "button",
              {
                className: "tm-btn",
                style: r.navBtn,
                onClick: () => oe(e.id, Math.min(e.subtasks.length - 1, L + 1)),
                children: "►"
              }
            )
          ] })
        ] }),
        b ? /* @__PURE__ */ l("div", { style: { display: "flex", gap: 14, alignItems: "flex-start" }, children: [
          /* @__PURE__ */ o(
            "button",
            {
              className: "tm-btn",
              style: r.checkBtn,
              "aria-label": b.done ? "Mark step incomplete" : "Mark step complete",
              onClick: () => U(e.id, b.id, !b.done),
              children: b.done ? /* @__PURE__ */ o("span", { style: { ...r.checkCircle, background: "rgba(52,211,153,0.18)", borderColor: "rgba(52,211,153,0.5)", color: t.focus }, children: "✓" }) : /* @__PURE__ */ o("span", { style: { ...r.checkCircle, borderColor: "#475569", color: "transparent" }, children: "✓" })
            }
          ),
          /* @__PURE__ */ l("div", { style: { flex: 1, minWidth: 0 }, children: [
            /* @__PURE__ */ o(
              "h3",
              {
                style: {
                  margin: "2px 0 10px",
                  fontSize: 16,
                  fontWeight: 600,
                  ...b.done ? { textDecoration: "line-through", color: t.muted } : {}
                },
                children: b.title
              }
            ),
            b.command && /* @__PURE__ */ l("div", { style: r.commandBox, children: [
              /* @__PURE__ */ l("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
                /* @__PURE__ */ o("span", { style: r.commandLabel, children: "KIRO TERMINAL EXECUTABLE" }),
                /* @__PURE__ */ o("span", { style: { ...r.commandLabel, color: t.kiro }, children: "VIA TASKMASTER AGENT" })
              ] }),
              /* @__PURE__ */ o("code", { style: r.commandCode, children: b.command }),
              /* @__PURE__ */ o("div", { children: /* @__PURE__ */ o(
                "button",
                {
                  className: "tm-btn",
                  style: {
                    ...r.btnPrimary,
                    ...b.done ? { opacity: 0.5, cursor: "default" } : {},
                    ...d ? { background: "rgba(129,140,248,0.25)", color: t.kiro } : {}
                  },
                  disabled: b.done || !!s,
                  onClick: () => Fe(e, b, L),
                  children: d ? "⚙ EXECUTING VIA AGENT…" : b.done ? "✓ COMPLETED" : "▶ RUN COMMAND NATIVELY"
                }
              ) }),
              (d || b.output) && /* @__PURE__ */ o("div", { style: r.outputPre, children: d ? `$ ${b.command}
… taskmaster agent is executing — the reply lands here and in the task chat below` : /* @__PURE__ */ o(ot, { content: b.output ?? "" }) })
            ] }),
            /* @__PURE__ */ o("p", { style: { color: t.muted, fontSize: 11, marginTop: 10 }, children: "Focus purely on completing this single micro-step." })
          ] })
        ] }) : /* @__PURE__ */ o("p", { style: { color: t.muted, fontSize: 12 }, children: "No micro-steps yet — add one, or let the taskmaster agent draft the breakdown." }),
        /* @__PURE__ */ l("div", { style: { borderTop: `1px solid ${t.border}`, marginTop: 18, paddingTop: 12 }, children: [
          /* @__PURE__ */ l("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 8, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ l("span", { style: r.queueLabel, children: [
              "ALL SUBTASKS (",
              n.done,
              "/",
              n.total,
              " COMPLETED)"
            ] }),
            /* @__PURE__ */ l("span", { style: { display: "flex", gap: 6 }, children: [
              /* @__PURE__ */ o(
                "button",
                {
                  className: "tm-btn",
                  style: { ...r.btnGhost, ...p ? { color: t.kiro } : {} },
                  disabled: !!s,
                  onClick: () => Ce(e),
                  children: p ? "⚙ AGENT DRAFTING…" : "✦ DRAFT STEPS WITH AI"
                }
              ),
              /* @__PURE__ */ o(
                "button",
                {
                  className: "tm-btn",
                  style: { ...r.btnGhost, ...f ? { color: t.kiro } : { color: t.focus, borderColor: "rgba(52,211,153,0.3)" } },
                  disabled: !!s || K === 0,
                  onClick: () => Pe(e),
                  children: f ? "⚙ AGENT RUNNING STEPS…" : `▶ RUN REMAINING (${K})`
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ o("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: e.subtasks.map((m, C) => {
            const h = C === L;
            return /* @__PURE__ */ l(
              "div",
              {
                style: { ...r.queueRow, ...h ? r.queueRowActive : {} },
                onClick: () => oe(e.id, C),
                children: [
                  /* @__PURE__ */ l("span", { style: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 }, children: [
                    /* @__PURE__ */ o(
                      "button",
                      {
                        className: "tm-btn",
                        style: r.queueCheck,
                        "aria-label": m.done ? "Mark incomplete" : "Mark complete",
                        onClick: ($) => {
                          $.stopPropagation(), U(e.id, m.id, !m.done);
                        },
                        children: m.done ? /* @__PURE__ */ o("span", { style: { color: t.focus, fontWeight: 700 }, children: "✓" }) : /* @__PURE__ */ o("span", { style: { color: "#475569" }, children: "○" })
                      }
                    ),
                    /* @__PURE__ */ l("span", { style: { minWidth: 0 }, children: [
                      /* @__PURE__ */ o("span", { style: { fontSize: 12, ...m.done ? { textDecoration: "line-through", color: t.muted } : {} }, children: m.title }),
                      /* @__PURE__ */ l("span", { style: { display: "flex", gap: 6, marginTop: 2 }, children: [
                        m.command && !m.done && /* @__PURE__ */ o("span", { style: r.execChip, children: "EXECUTABLE" }),
                        m.source === "agent" && /* @__PURE__ */ o("span", { style: { ...r.execChip, color: t.kiro, borderColor: "rgba(129,140,248,0.3)", background: "rgba(129,140,248,0.08)" }, children: "AGENT-DRAFTED" })
                      ] })
                    ] })
                  ] }),
                  h && /* @__PURE__ */ o("span", { style: r.activeChip, children: "ACTIVE" })
                ]
              },
              m.id
            );
          }) }),
          /* @__PURE__ */ l("div", { style: { ...r.addRow, marginTop: 10 }, children: [
            /* @__PURE__ */ o(
              "input",
              {
                style: { ...r.input, flex: 2 },
                placeholder: "Add micro-step…",
                value: ge,
                onChange: (m) => fe(m.target.value),
                onKeyDown: (m) => {
                  m.key === "Enter" && ne(e);
                }
              }
            ),
            /* @__PURE__ */ o(
              "input",
              {
                style: { ...r.input, flex: 3, fontFamily: E, fontSize: 11 },
                placeholder: "optional terminal command",
                value: he,
                onChange: (m) => be(m.target.value),
                onKeyDown: (m) => {
                  m.key === "Enter" && ne(e);
                }
              }
            ),
            /* @__PURE__ */ o("button", { className: "tm-btn", style: r.btnGhost, onClick: () => ne(e), children: "ADD" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ l("section", { className: "tm-card", style: { ...r.card, padding: 0, overflow: "hidden" }, children: [
        /* @__PURE__ */ l(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderBottom: `1px solid ${t.border}`
            },
            children: [
              /* @__PURE__ */ o("span", { style: r.queueLabel, children: "TASK AGENT SESSION" }),
              /* @__PURE__ */ l("span", { style: { ...r.execChip, color: t.kiro, borderColor: "rgba(129,140,248,0.3)", background: "rgba(129,140,248,0.08)" }, children: [
                a,
                " · taskmaster"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ o("div", { style: { height: 380 }, children: /* @__PURE__ */ o(
          nt,
          {
            slotKey: a,
            agent: "taskmaster",
            frameless: !0,
            startAtBottom: !0,
            placeholder: "Message the taskmaster agent about this task…"
          }
        ) })
      ] })
    ] });
  }
  function _e() {
    return /* @__PURE__ */ l(re, { children: [
      /* @__PURE__ */ l("section", { className: "tm-card", style: r.card, children: [
        /* @__PURE__ */ l("div", { style: { ...r.queueLabel, marginBottom: 10 }, children: [
          "ALL BACKLOGS (",
          Ie,
          " TASKS)"
        ] }),
        Re()
      ] }),
      x.tasks.map((e) => {
        const n = Ne(e), a = e.id === (k == null ? void 0 : k.id), s = (S == null ? void 0 : S.taskId) === e.id ? S : null, d = (s == null ? void 0 : s.kind) === "draft";
        return /* @__PURE__ */ l(
          "section",
          {
            className: "tm-card",
            style: { ...r.card, ...a ? { borderColor: "rgba(52,211,153,0.4)" } : {} },
            children: [
              /* @__PURE__ */ l("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }, children: [
                /* @__PURE__ */ o("span", { style: { fontWeight: 600, fontSize: 14, minWidth: 0 }, children: e.title }),
                /* @__PURE__ */ l("span", { style: { display: "flex", gap: 6, flexWrap: "wrap" }, children: [
                  e.estimateMinutes != null && /* @__PURE__ */ l("span", { style: { ...r.chip, color: "#38bdf8", borderColor: t.border, fontFamily: E }, children: [
                    "~",
                    e.estimateMinutes,
                    "m"
                  ] }),
                  /* @__PURE__ */ o("button", { className: "tm-btn", style: { ...r.btnGhost, color: t.focus, borderColor: "rgba(52,211,153,0.3)" }, onClick: () => Ke(e.id), children: "FOCUS" }),
                  /* @__PURE__ */ o(
                    "button",
                    {
                      className: "tm-btn",
                      style: { ...r.btnGhost, ...d ? { color: t.kiro } : {} },
                      disabled: !!s,
                      onClick: () => Ce(e),
                      children: d ? "⚙ DRAFTING…" : "✦ DRAFT STEPS"
                    }
                  ),
                  /* @__PURE__ */ o("button", { className: "tm-btn", style: r.btnGhost, onClick: () => Te(e), children: "💬 CHAT" }),
                  /* @__PURE__ */ o(
                    "button",
                    {
                      className: "tm-btn",
                      style: { ...r.btnGhost, ...Y === e.id ? { color: t.danger, borderColor: t.danger } : {} },
                      onClick: () => Y === e.id ? Ue(e.id) : X(e.id),
                      onBlur: () => X(null),
                      children: Y === e.id ? "SURE?" : "DELETE"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ o("div", { style: { ...r.progressTrack, marginTop: 12 }, children: /* @__PURE__ */ o("div", { style: { ...r.progressFill, width: `${n.pct}%` } }) }),
              /* @__PURE__ */ l("div", { style: { display: "flex", flexDirection: "column", gap: 4, marginTop: 10 }, children: [
                e.subtasks.length === 0 && /* @__PURE__ */ o("span", { style: { color: t.muted, fontSize: 11 }, children: "No micro-steps yet." }),
                e.subtasks.map((p) => /* @__PURE__ */ l("div", { style: r.backlogSubRow, children: [
                  /* @__PURE__ */ o("span", { style: { color: p.done ? t.focus : "#475569" }, children: p.done ? "✓" : "○" }),
                  /* @__PURE__ */ o("span", { style: { fontSize: 11, ...p.done ? { textDecoration: "line-through", color: t.muted } : {} }, children: p.title })
                ] }, p.id))
              ] })
            ]
          },
          e.id
        );
      })
    ] });
  }
  function Ye() {
    return /* @__PURE__ */ l(re, { children: [
      /* @__PURE__ */ l("section", { className: "tm-card", style: r.card, children: [
        /* @__PURE__ */ l("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }, children: [
          /* @__PURE__ */ o("span", { style: r.queueLabel, children: "KIRO GATEWAY" }),
          /* @__PURE__ */ o(
            "button",
            {
              className: "tm-btn",
              style: r.btnGhost,
              onClick: () => {
                i.get("/api/status").then((e) => {
                  le(typeof e == "object" && e !== null ? e : {}), g("ok", "Gateway status refreshed.");
                }).catch((e) => g("warn", `Status refresh failed: ${String(e)}`));
              },
              children: "REFRESH"
            }
          )
        ] }),
        /* @__PURE__ */ l("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ o(_, { label: "STATUS", value: I ? "ONLINE" : "UNKNOWN", accent: I ? t.focus : t.warn }),
          /* @__PURE__ */ o(_, { label: "VERSION", value: String((I == null ? void 0 : I.version) ?? "—"), accent: t.kiro }),
          /* @__PURE__ */ o(_, { label: "UPTIME", value: String((I == null ? void 0 : I.uptime) ?? "—"), accent: t.text }),
          /* @__PURE__ */ o(_, { label: "PROVIDER", value: String((I == null ? void 0 : I.provider) ?? "—"), accent: t.text })
        ] })
      ] }),
      /* @__PURE__ */ l("section", { className: "tm-card", style: { ...r.card, fontFamily: E }, children: [
        /* @__PURE__ */ l("div", { style: { display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", borderBottom: `1px solid ${t.border}`, paddingBottom: 8, marginBottom: 10 }, children: [
          /* @__PURE__ */ o("span", { style: { color: t.muted, fontSize: 11 }, children: "Taskmaster activity + gateway console" }),
          /* @__PURE__ */ o("span", { style: { ...r.execChip, color: t.muted }, children: Be })
        ] }),
        /* @__PURE__ */ l("div", { style: { display: "flex", flexDirection: "column", gap: 6, maxHeight: 380, overflowY: "auto" }, children: [
          ae.length === 0 && /* @__PURE__ */ o("span", { style: { color: t.muted, fontSize: 11 }, children: "No events yet." }),
          ae.map((e, n) => /* @__PURE__ */ l("div", { style: { display: "flex", gap: 10, alignItems: "flex-start" }, children: [
            /* @__PURE__ */ o("span", { style: { color: "#475569", fontSize: 10, flexShrink: 0, paddingTop: 1 }, children: e.ts }),
            /* @__PURE__ */ o(
              "span",
              {
                style: {
                  ...r.levelChip,
                  ...e.level === "ok" ? { background: "rgba(52,211,153,0.15)", color: t.focus } : e.level === "warn" ? { background: "rgba(210,153,34,0.15)", color: t.warn } : e.level === "err" ? { background: "rgba(229,83,75,0.15)", color: t.danger } : { background: "rgba(148,163,184,0.12)", color: t.muted }
                },
                children: e.level.toUpperCase()
              }
            ),
            /* @__PURE__ */ o("span", { style: { fontSize: 11, color: t.text, wordBreak: "break-word" }, children: e.msg })
          ] }, `${e.ts}-${n}`))
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ l("div", { style: r.root, children: [
    /* @__PURE__ */ o("style", { children: ht }),
    /* @__PURE__ */ l("header", { style: r.header, children: [
      /* @__PURE__ */ l("span", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
        /* @__PURE__ */ o("span", { style: r.logoBox, "aria-hidden": "true", children: /* @__PURE__ */ o("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "#030712", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ o("path", { d: "M13 10V3L4 14h7v7l9-11h-7z" }) }) }),
        /* @__PURE__ */ l("span", { children: [
          /* @__PURE__ */ o("span", { style: r.brandTitle, children: "Taskmaster Pro" }),
          /* @__PURE__ */ o("span", { style: { ...r.chip, marginLeft: 8, color: t.kiro, borderColor: "rgba(129,140,248,0.3)", background: "rgba(129,140,248,0.08)" }, children: "EXECUTION ENGINE" }),
          /* @__PURE__ */ o("div", { style: { color: t.muted, fontSize: 10, marginTop: 2 }, children: "Task focus · agent-run commands · memory sync" })
        ] })
      ] }),
      He()
    ] }),
    G && /* @__PURE__ */ o("div", { style: r.errorBanner, children: G }),
    q
  ] });
}
function _({ label: i, value: u, accent: c }) {
  return /* @__PURE__ */ l("div", { style: r.statBox, children: [
    /* @__PURE__ */ o("div", { style: { color: t.muted, fontSize: 9, letterSpacing: "0.1em", marginBottom: 4 }, children: i }),
    /* @__PURE__ */ o("div", { style: { color: c, fontSize: 13, fontWeight: 700, fontFamily: E, wordBreak: "break-all" }, children: u })
  ] });
}
const ht = `
  .tm-btn { cursor: pointer; transition: filter 120ms ease, background 120ms ease; }
  .tm-btn:hover:not(:disabled) { filter: brightness(1.25); }
  .tm-btn:disabled { cursor: default; }
  .tm-card { box-shadow: 0 8px 24px rgba(0,0,0,0.25); }
  @keyframes tm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
  .tm-pulse { animation: tm-pulse 1.6s ease-in-out infinite; }
`, r = {
  root: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    padding: 18,
    maxWidth: 920,
    margin: "0 auto",
    minHeight: "100%",
    background: t.bg,
    color: t.text,
    fontFamily: "Inter, -apple-system, 'Segoe UI', Roboto, sans-serif",
    boxSizing: "border-box"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    padding: "12px 16px",
    background: t.card,
    border: `1px solid ${t.border}`,
    borderRadius: 14
  },
  logoBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: `linear-gradient(45deg, ${t.kiro}, ${t.focus})`,
    flexShrink: 0
  },
  brandTitle: { fontWeight: 800, fontSize: 16, letterSpacing: "-0.01em" },
  tabRow: {
    display: "flex",
    gap: 4,
    padding: 4,
    borderRadius: 12,
    border: `1px solid ${t.border}`,
    background: t.bg
  },
  tab: {
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 600,
    color: t.muted,
    background: "transparent",
    border: "1px solid transparent"
  },
  tabActive: { background: t.focus, color: "#030712" },
  card: { background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: 18 },
  gradientStrip: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: `linear-gradient(90deg, ${t.kiro}, ${t.focus}, #38bdf8)`
  },
  centerCol: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "4px 10px",
    borderRadius: 999,
    border: `1px solid ${t.border}`,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.06em",
    background: "transparent"
  },
  taskTitle: { fontSize: 20, fontWeight: 700, margin: "4px 0 0", lineHeight: 1.35, maxWidth: 640 },
  progressTrack: {
    marginTop: 18,
    height: 10,
    borderRadius: 999,
    border: `1px solid ${t.border}`,
    background: t.bg,
    overflow: "hidden",
    padding: 2,
    boxSizing: "border-box"
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    background: `linear-gradient(90deg, ${t.kiro}, ${t.focus})`,
    transition: "width 300ms ease"
  },
  stepHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `1px solid ${t.border}`,
    paddingBottom: 12,
    marginBottom: 14
  },
  stepCounter: { fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", display: "inline-flex", alignItems: "center", gap: 7 },
  pulseDot: { width: 8, height: 8, borderRadius: 999, background: t.focus, display: "inline-block" },
  navBtn: {
    padding: "4px 10px",
    borderRadius: 8,
    border: `1px solid ${t.border}`,
    background: t.bg,
    color: t.text,
    fontSize: 11
  },
  checkBtn: { background: "transparent", border: "none", padding: 0, marginTop: 2 },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 999,
    border: "2px solid",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    background: "transparent"
  },
  commandBox: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    border: `1px solid ${t.border}`,
    background: t.bg
  },
  commandLabel: { fontSize: 9, letterSpacing: "0.14em", color: t.muted, fontFamily: E },
  commandCode: {
    display: "block",
    padding: 8,
    borderRadius: 8,
    border: `1px solid ${t.border}`,
    background: t.card,
    color: "#6ee7b7",
    fontSize: 11,
    fontFamily: E,
    overflowX: "auto",
    whiteSpace: "pre"
  },
  btnPrimary: {
    padding: "8px 14px",
    borderRadius: 10,
    border: "1px solid transparent",
    background: "#4f46e5",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.04em"
  },
  btnGhost: {
    padding: "6px 10px",
    borderRadius: 8,
    border: `1px solid ${t.border}`,
    background: "transparent",
    color: t.muted,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.05em"
  },
  outputPre: {
    margin: 0,
    padding: 10,
    borderRadius: 8,
    border: `1px solid ${t.border}`,
    background: "#000",
    color: "#cbd5e1",
    fontSize: 10.5,
    fontFamily: E,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    maxHeight: 200,
    overflowY: "auto"
  },
  queueLabel: { fontSize: 10, letterSpacing: "0.1em", fontWeight: 700, color: t.muted },
  queueRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    padding: "8px 12px",
    borderRadius: 12,
    border: `1px solid ${t.border}`,
    background: "rgba(3,7,18,0.4)",
    cursor: "pointer"
  },
  queueRowActive: { borderColor: "rgba(52,211,153,0.45)", background: "rgba(52,211,153,0.08)" },
  queueCheck: { background: "transparent", border: "none", padding: 0, fontSize: 13, flexShrink: 0 },
  execChip: {
    display: "inline-block",
    padding: "1px 5px",
    borderRadius: 4,
    border: "1px solid rgba(52,211,153,0.3)",
    background: "rgba(52,211,153,0.08)",
    color: t.focus,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: "0.08em",
    fontFamily: E
  },
  activeChip: {
    padding: "2px 8px",
    borderRadius: 6,
    background: "rgba(52,211,153,0.2)",
    color: t.focus,
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: "0.08em",
    flexShrink: 0
  },
  addRow: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
  input: {
    padding: "8px 10px",
    borderRadius: 10,
    border: `1px solid ${t.border}`,
    background: t.bg,
    color: t.text,
    fontSize: 12,
    outline: "none",
    minWidth: 0
  },
  backlogSubRow: { display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", borderRadius: 8, background: "rgba(3,7,18,0.45)" },
  statBox: {
    flex: "1 1 120px",
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${t.border}`,
    background: t.bg
  },
  levelChip: { padding: "1px 6px", borderRadius: 4, fontSize: 9, fontWeight: 800, letterSpacing: "0.06em", flexShrink: 0 },
  errorBanner: {
    padding: "10px 14px",
    borderRadius: 12,
    border: `1px solid ${t.danger}`,
    background: "rgba(229,83,75,0.08)",
    color: t.danger,
    fontSize: 12
  }
};
export {
  St as default
};
