import { jsx as o, jsxs as l, Fragment as re } from "react/jsx-runtime";
import { useState as $, useRef as F, useCallback as N, useEffect as ie, useMemo as Xe } from "react";
import { useAppApi as Je, useNotify as Qe, useNavBadge as Ze, useChatLauncher as et, useAppEvents as tt, ChatEmbed as nt } from "@kirocrew/app-sdk";
import { MarkdownRenderer as ot } from "@kirocrew/ui";
function se(s) {
  return `taskmaster-${s.id}`;
}
let Re = 0;
function G(s) {
  return Re += 1, `${s}-${Date.now().toString(36)}-${Re.toString(36)}`;
}
function rt() {
  return { version: 1, settings: { memorySync: !0 }, activeTaskId: null, tasks: [] };
}
function it(s) {
  var A;
  const p = rt();
  if (typeof s != "object" || s === null) return p;
  const d = s, y = Array.isArray(d.tasks) ? d.tasks.filter(ze).map(st) : p.tasks, S = typeof d.settings == "object" && d.settings !== null ? { memorySync: d.settings.memorySync !== !1 } : p.settings, M = typeof d.activeTaskId == "string" ? d.activeTaskId : null;
  return {
    version: 1,
    settings: S,
    activeTaskId: y.some((z) => z.id === M) ? M : ((A = y[0]) == null ? void 0 : A.id) ?? null,
    tasks: y
  };
}
function ze(s) {
  return typeof s == "object" && s !== null && typeof s.title == "string";
}
function st(s) {
  const p = Array.isArray(s.subtasks) ? s.subtasks.filter(ze).map((d) => ({
    id: typeof d.id == "string" ? d.id : G("sub"),
    title: String(d.title),
    done: d.done === !0,
    ...typeof d.command == "string" && d.command.trim() ? { command: d.command } : {},
    ...typeof d.output == "string" && d.output ? { output: d.output } : {},
    ...d.runState === "done" || d.runState === "failed" ? { runState: d.runState } : {},
    ...d.source === "agent" || d.source === "manual" ? { source: d.source } : {}
  })) : [];
  return {
    id: typeof s.id == "string" ? s.id : G("task"),
    title: String(s.title),
    ...typeof s.estimateMinutes == "number" && s.estimateMinutes > 0 ? { estimateMinutes: Math.round(s.estimateMinutes) } : {},
    createdAt: typeof s.createdAt == "string" ? s.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
    subtasks: p,
    ...s.lessonPosted === !0 ? { lessonPosted: !0 } : {},
    ...s.slotStarted === !0 ? { slotStarted: !0 } : {}
  };
}
function Ae(s) {
  const p = s.subtasks.length, d = s.subtasks.filter((y) => y.done).length;
  return { done: d, total: p, pct: p === 0 ? 0 : Math.round(d / p * 100) };
}
function at(s) {
  const p = s.subtasks.findIndex((d) => !d.done);
  return p === -1 ? Math.max(0, s.subtasks.length - 1) : p;
}
function lt(s) {
  const p = /```(?:json)?\s*([\s\S]*?)```/.exec(s), d = [];
  p != null && p[1] && d.push(p[1]);
  const y = s.indexOf("["), S = s.lastIndexOf("]");
  y !== -1 && S > y && d.push(s.slice(y, S + 1));
  for (const M of d)
    try {
      const A = JSON.parse(M);
      if (!Array.isArray(A)) continue;
      const z = A.filter((T) => typeof T == "object" && T !== null).map((T) => ({
        title: typeof T.title == "string" ? T.title.trim() : "",
        ...typeof T.command == "string" && T.command.trim() ? { command: T.command.trim() } : {}
      })).filter((T) => T.title.length > 0).slice(0, 12);
      if (z.length > 0) return z;
    } catch {
    }
  return null;
}
function dt(s) {
  const p = s.subtasks.map((d, y) => `${y + 1}. ${d.title}${d.command ? ` [${d.command}]` : ""}`);
  return `Completed "${s.title}" via micro-steps: ${p.join(" ")}`;
}
function ct(s) {
  if (typeof s != "object" || s === null) return { messages: [], running: !1 };
  const p = s;
  return { messages: Array.isArray(p.messages) ? p.messages.filter((y) => typeof y == "object" && y !== null) : [], running: p.running === !0 };
}
const Ne = /^\s*STEP RESULT \[(\d+)\]:\s*(done|failed)\s*(?:[—–:-]\s*)?(.*)$/gim;
function ut(s) {
  const p = [];
  Ne.lastIndex = 0;
  let d;
  for (; (d = Ne.exec(s)) !== null; )
    p.push({
      index: Number.parseInt(d[1], 10),
      ok: d[2].toLowerCase() === "done",
      summary: d[3].trim()
    });
  return p;
}
const Me = "/api/apps/taskmaster-pro/config", pt = 200, Le = "notification scope · slot polling", mt = 2500, gt = 900 * 1e3, Be = 4e3, t = {
  bg: "var(--bg, #030712)",
  card: "var(--card, #0b1329)",
  border: "var(--border, #1e293b)",
  text: "var(--text, #f1f5f9)",
  muted: "var(--muted, #94a3b8)",
  focus: "#34d399",
  kiro: "#818cf8",
  warn: "var(--warn, #d29922)",
  danger: "var(--danger, #e5534b)"
}, R = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
function ft() {
  return (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0];
}
function St() {
  const s = Je(), p = Qe(), d = Ze(), { openChat: y } = et(), [S, M] = $(null), [A, z] = $("focus"), [T, De] = $({}), [ae, Oe] = $([]), [E, le] = $(null), [U, de] = $(null), [ce, ue] = $(""), [pe, me] = $(""), [ge, fe] = $(""), [he, be] = $(""), [_, Y] = $(null), [C, j] = $(null), W = F(null);
  W.current = S;
  const ye = F(Promise.resolve()), ke = F(0), X = F({}), D = F(null);
  D.current = C;
  const P = F({}), J = F(!1), m = N((e, n) => {
    Oe((a) => [{ ts: ft(), level: e, msg: n }, ...a].slice(0, pt));
  }, []), xe = N(
    (e) => {
      M(e), W.current = e;
      const n = ++ke.current;
      ye.current = ye.current.then(async () => {
        if (n === ke.current)
          try {
            await s.put(Me, e);
          } catch (a) {
            m("warn", `Config save failed: ${String(a)}`);
          }
      });
    },
    [s, m]
  ), v = N(
    (e) => {
      const n = W.current;
      n && xe(e(n));
    },
    [xe]
  ), Q = N(
    (e) => {
      s.get(Me).then((n) => {
        e != null && e() || (M(it(n)), de(null), m("info", "Loaded task state from gateway app config."));
      }).catch((n) => {
        e != null && e() || (M(null), de(`Config load failed (${String(n)}) — retry to continue.`), m("warn", `Config load failed: ${String(n)}`));
      });
    },
    [s, m]
  );
  ie(() => {
    let e = !1;
    return Q(() => e), s.get("/api/status").then((n) => {
      e || (le(typeof n == "object" && n !== null ? n : {}), m("ok", "Connected to Kiro Crew gateway."));
    }).catch(() => {
      e || m("warn", "Gateway status unavailable.");
    }), m("info", `Console mode: ${Le} — gateway event forwarding to app pages is pending upstream.`), () => {
      e = !0;
    };
  }, [Q]);
  const Se = N(
    (e) => {
      p(`Task complete: ${e.title}`), m("ok", `Task "${e.title}" fully completed.`);
      const n = W.current;
      !(n != null && n.settings.memorySync) || e.lessonPosted || X.current[e.id] || (X.current[e.id] = !0, s.post("/api/lessons", { rule: dt(e), category: "knowledge" }).then(() => {
        v((a) => ({
          ...a,
          tasks: a.tasks.map((i) => i.id === e.id ? { ...i, lessonPosted: !0 } : i)
        })), m("ok", "Kiro Memory: appended solution path to lessons (category: knowledge).");
      }).catch((a) => m("warn", `Memory sync failed: ${String(a)}`)).finally(() => {
        delete X.current[e.id];
      }));
    },
    [s, p, m, v]
  ), K = N(
    (e, n, a, i, c) => {
      let u = null;
      v((f) => {
        const g = f.tasks.map((x) => {
          if (x.id !== e) return x;
          const h = x.subtasks.map((I) => {
            if (I.id !== n) return I;
            const B = { ...I, done: a, ...i !== void 0 ? { output: i } : {} };
            return c ? B.runState = c : delete B.runState, B;
          }), w = { ...x, subtasks: h }, L = x.subtasks.length > 0 && x.subtasks.every((I) => I.done);
          return h.length > 0 && h.every((I) => I.done) && !L && (u = w), w;
        });
        return { ...f, tasks: g };
      }), u && Se(u);
    },
    [v, Se]
  );
  tt("notification", (e) => {
    const n = typeof e == "object" && e !== null ? e : {}, a = typeof n.title == "string" ? n.title : "notification", i = typeof n.text == "string" ? n.text : "";
    m("info", `Gateway notification [${a}]: ${i.slice(0, 200)}`);
  });
  function Fe(e, n) {
    v((a) => ({
      ...a,
      tasks: a.tasks.map((i) => {
        if (i.id !== e) return i;
        const c = new Set(i.subtasks.map((f) => f.title.toLowerCase())), u = n.filter((f) => !c.has(f.title.toLowerCase())).map((f) => ({ id: G("sub"), title: f.title, done: !1, source: "agent", ...f.command ? { command: f.command } : {} }));
        return { ...i, subtasks: [...i.subtasks, ...u] };
      })
    })), m("ok", `Taskmaster agent drafted ${n.length} micro-step(s).`), p(`Added ${n.length} drafted micro-steps`);
  }
  const Ce = N(
    async (e) => ct(await s.get(`/api/chat/slots/${encodeURIComponent(e)}`)),
    [s]
  ), Z = N(
    (e, n, a, i) => {
      v((c) => ({
        ...c,
        tasks: c.tasks.map(
          (u) => u.id === e ? {
            ...u,
            subtasks: u.subtasks.map(
              (f) => f.id === n ? { ...f, output: a, ...i ? { runState: i } : {} } : f
            )
          } : u
        )
      }));
    },
    [v]
  );
  async function ee(e, n, a) {
    if (D.current) return;
    const i = se(e);
    if (!(i in P.current))
      try {
        P.current[i] = (await Ce(i)).messages.length;
      } catch {
        P.current[i] = 0;
      }
    J.current = !1, j({ ...a, sentAt: Date.now() }), e.slotStarted || v((c) => ({
      ...c,
      tasks: c.tasks.map((u) => u.id === e.id ? { ...u, slotStarted: !0 } : u)
    })), s.post("/api/chat", { message: n, slot: i, agent: "taskmaster" }).catch((c) => {
      var u;
      c instanceof SyntaxError || (m("err", `Send to task slot failed: ${String(c)}`), p("Could not reach the gateway", { type: "error" }), ((u = D.current) == null ? void 0 : u.taskId) === e.id && j(null));
    }), m("info", `Sent to task slot ${i}: ${n.split(`
`)[0].slice(0, 120)}`);
  }
  const We = N(
    (e, n) => {
      var u;
      const a = (u = W.current) == null ? void 0 : u.tasks.find((f) => f.id === e.taskId);
      if (!a) return { settled: !0, stepSucceeded: !1 };
      let i = !1, c = !1;
      for (const f of n) {
        if (f.role === "user" || !f.content) continue;
        J.current = !0;
        const g = f.content;
        if (e.kind === "draft") {
          const h = lt(g);
          h && (Fe(e.taskId, h), i = !0);
          continue;
        }
        const x = ut(g);
        for (const h of x) {
          const w = a.subtasks[h.index - 1];
          if (!w) {
            m("warn", `Agent reported STEP RESULT [${h.index}] but the task has no such step.`);
            continue;
          }
          const L = x.length === 1 ? g.slice(0, Be) : `${h.ok ? "done" : "failed"} — ${h.summary || "(no summary)"}`;
          h.ok ? (K(e.taskId, w.id, !0, L, "done"), m("ok", `Step ${h.index} completed by agent: ${h.summary || w.title}`), c = !0) : (Z(e.taskId, w.id, L, "failed"), m("warn", `Step ${h.index} failed: ${h.summary || "(no summary)"}`)), e.kind === "step" && (i = !0);
        }
      }
      return { settled: i, stepSucceeded: c };
    },
    [m, K, Z]
  );
  ie(() => {
    if (!C) return;
    const e = se({ id: C.taskId });
    let n = !1;
    const a = async () => {
      var w;
      const c = D.current;
      if (n || !c) return;
      if (Date.now() - c.sentAt > gt) {
        m("warn", "Agent request timed out — check the task chat."), j(null);
        return;
      }
      let u;
      try {
        u = await Ce(e);
      } catch {
        return;
      }
      const f = P.current[e] ?? 0, g = u.running ? Math.max(0, u.messages.length - 1) : u.messages.length, x = u.messages.slice(f, g);
      P.current[e] = Math.max(f, g);
      const h = x.length > 0 ? We(c, x) : { settled: !1, stepSucceeded: !1 };
      if (h.settled && c.kind !== "all") {
        c.kind === "step" && h.stepSucceeded && p("Step completed via taskmaster agent", { type: "success" }), j(null);
        return;
      }
      if (!u.running && J.current) {
        if (c.kind === "all")
          m("ok", "Agent finished the run — see per-step results above and the task chat.");
        else if (c.kind === "draft")
          m("warn", "Draft reply had no parseable json block — see the task chat."), p("Agent reply was not parseable — see the task chat");
        else {
          const L = (w = W.current) == null ? void 0 : w.tasks.find((B) => B.id === c.taskId), oe = c.stepIndex != null ? L == null ? void 0 : L.subtasks[c.stepIndex] : void 0, I = [...x].reverse().find((B) => B.role !== "user" && B.content);
          oe && (I != null && I.content) && Z(c.taskId, oe.id, I.content.slice(0, Be)), m("warn", "Agent reply had no STEP RESULT marker — step left for manual toggle.");
        }
        j(null);
      }
    }, i = setInterval(() => void a(), mt);
    return a(), () => {
      n = !0, clearInterval(i);
    };
  }, [C == null ? void 0 : C.sentAt]);
  function je(e, n, a) {
    !n.command || D.current || (m("info", `Kiro terminal execute (step ${a + 1}): ${n.command}`), ee(
      e,
      `Run micro-step [${a + 1}] of task "${e.title}": ${n.title}
Execute this terminal command and report concise output:
${n.command}
End your reply with exactly one line: STEP RESULT [${a + 1}]: done|failed — <short summary>`,
      { taskId: e.id, kind: "step", stepIndex: a }
    ));
  }
  function ve(e) {
    if (D.current) return;
    const n = e.subtasks.map((a) => a.title).join("; ") || "none";
    m("info", `Requesting micro-step breakdown for "${e.title}".`), p("Taskmaster agent is drafting micro-steps…"), ee(
      e,
      `Break the task "${e.title}"${e.estimateMinutes ? ` (~${e.estimateMinutes}m)` : ""} into micro-steps per the taskmaster-method skill. Reply with ONE fenced json code block containing an array of {"title", "command"?} objects and no prose outside it.
Existing steps (do not duplicate): ${n}`,
      { taskId: e.id, kind: "draft" }
    );
  }
  function Pe(e) {
    if (D.current) return;
    const n = e.subtasks.map((i, c) => ({ sub: i, index: c })).filter(({ sub: i }) => !i.done);
    if (n.length === 0) return;
    const a = n.map(({ sub: i, index: c }) => `[${c + 1}] ${i.title}${i.command ? ` — command: ${i.command}` : ""}`).join(`
`);
    m("info", `Running ${n.length} remaining step(s) unattended via taskmaster agent.`), p(`Agent is running ${n.length} remaining step(s)…`), ee(
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
      await s.post("/api/crons", {
        name: `taskmaster-${e.id}`,
        cron: "0 9 * * 1-5",
        agent: "taskmaster",
        message: `Taskmaster routine check-in on task "${e.title}". Review current progress and report the single next micro-step.`
      }), m("ok", `Cron registered: weekday 09:00 routine check-in on "${e.title}".`), p("Routine scheduled — weekdays 09:00");
    } catch (n) {
      m("err", `Cron registration failed: ${String(n)}`), p("Could not register the cron");
    }
  }
  function we() {
    const e = ce.trim();
    if (!e) return;
    const n = Number.parseInt(pe, 10), a = {
      id: G("task"),
      title: e,
      ...Number.isFinite(n) && n > 0 ? { estimateMinutes: n } : {},
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      subtasks: []
    };
    v((i) => ({ ...i, tasks: [...i.tasks, a], activeTaskId: i.activeTaskId ?? a.id })), ue(""), me(""), m("info", `Task added to backlog: "${e}"`);
  }
  function te(e) {
    const n = ge.trim();
    if (!n) return;
    const a = he.trim(), i = { id: G("sub"), title: n, done: !1, source: "manual", ...a ? { command: a } : {} };
    v((c) => ({
      ...c,
      tasks: c.tasks.map((u) => u.id === e.id ? { ...u, subtasks: [...u.subtasks, i] } : u)
    })), fe(""), be("");
  }
  function Ue(e) {
    v((n) => {
      var i;
      const a = n.tasks.filter((c) => c.id !== e);
      return { ...n, tasks: a, activeTaskId: n.activeTaskId === e ? ((i = a[0]) == null ? void 0 : i.id) ?? null : n.activeTaskId };
    }), Y(null), m("info", "Task removed from backlog.");
  }
  function Ke(e) {
    v((n) => ({ ...n, activeTaskId: e })), z("focus");
  }
  const k = Xe(() => S ? S.tasks.find((e) => e.id === S.activeTaskId) ?? S.tasks[0] ?? null : null, [S]), O = k ? Math.max(
    0,
    Math.min(T[k.id] ?? at(k), Math.max(0, k.subtasks.length - 1))
  ) : 0, b = (k == null ? void 0 : k.subtasks[O]) ?? null, qe = k ? Ae(k) : null, q = k ? k.subtasks.filter((e) => !e.done).length : 0;
  ie(() => {
    try {
      d(q);
    } catch {
    }
  }, [q, d]);
  function ne(e, n) {
    De((a) => ({ ...a, [e]: n }));
  }
  if (!S)
    return /* @__PURE__ */ o("div", { style: { ...r.root, alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ l("div", { style: { display: "grid", gap: 10, justifyItems: "center" }, children: [
      /* @__PURE__ */ o("span", { style: { color: t.muted, fontSize: 13 }, children: U ?? "Loading Taskmaster Pro…" }),
      U ? /* @__PURE__ */ o("button", { className: "tm-btn", style: r.primaryBtn, onClick: () => Q(), children: "Retry load" }) : null
    ] }) });
  const Ie = S.tasks.length, $e = S.settings.memorySync;
  let H;
  switch (A) {
    case "focus":
      H = Ve();
      break;
    case "backlog":
      H = _e();
      break;
    case "console":
      H = Ye();
      break;
    default: {
      const e = A;
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
        style: { ...r.tab, ...A === n.id ? r.tabActive : {} },
        onClick: () => z(n.id),
        children: n.label
      },
      n.id
    )) });
  }
  function Ee() {
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
        Ee()
      ] });
    const e = k, n = qe ?? { done: 0, total: 0, pct: 0 }, a = se(e), i = (C == null ? void 0 : C.taskId) === e.id ? C : null, c = !!(b && (i == null ? void 0 : i.kind) === "step" && i.stepIndex === O), u = (i == null ? void 0 : i.kind) === "draft", f = (i == null ? void 0 : i.kind) === "all";
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
                onClick: () => v((g) => ({ ...g, settings: { memorySync: !g.settings.memorySync } })),
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
            e.estimateMinutes != null && /* @__PURE__ */ l("span", { style: { ...r.chip, color: "#38bdf8", borderColor: t.border, fontFamily: R }, children: [
              "~",
              e.estimateMinutes,
              "m"
            ] }),
            /* @__PURE__ */ o("button", { className: "tm-btn", style: { ...r.chip, cursor: "pointer", color: t.text, borderColor: t.border }, onClick: () => void Ge(e), children: "⏰ SCHEDULE ROUTINE (CRON)" }),
            /* @__PURE__ */ o("button", { className: "tm-btn", style: { ...r.chip, cursor: "pointer", color: t.text, borderColor: t.border }, onClick: () => Te(e), children: "💬 OPEN IN CHAT" })
          ] })
        ] }),
        /* @__PURE__ */ o("div", { style: r.progressTrack, role: "progressbar", "aria-valuenow": n.pct, "aria-valuemin": 0, "aria-valuemax": 100, children: /* @__PURE__ */ o("div", { style: { ...r.progressFill, width: `${n.pct}%` } }) }),
        /* @__PURE__ */ l("div", { style: { textAlign: "right", color: t.muted, fontSize: 11, marginTop: 6, fontFamily: R }, children: [
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
            e.subtasks.length === 0 ? "NO MICRO-STEPS YET" : `ACTIVE MICRO-STEP ${O + 1} OF ${e.subtasks.length}`
          ] }),
          /* @__PURE__ */ l("span", { style: { display: "flex", gap: 6 }, children: [
            /* @__PURE__ */ o("button", { className: "tm-btn", style: r.navBtn, onClick: () => ne(e.id, Math.max(0, O - 1)), children: "◄" }),
            /* @__PURE__ */ o(
              "button",
              {
                className: "tm-btn",
                style: r.navBtn,
                onClick: () => ne(e.id, Math.min(e.subtasks.length - 1, O + 1)),
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
              onClick: () => K(e.id, b.id, !b.done),
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
                /* @__PURE__ */ l("span", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
                  b.runState === "failed" && !c && /* @__PURE__ */ o("span", { style: { ...r.execChip, ...r.failedChip }, children: "LAST RUN FAILED" }),
                  /* @__PURE__ */ o("span", { style: { ...r.commandLabel, color: t.kiro }, children: "VIA TASKMASTER AGENT" })
                ] })
              ] }),
              /* @__PURE__ */ o("code", { style: r.commandCode, children: b.command }),
              /* @__PURE__ */ o("div", { children: /* @__PURE__ */ o(
                "button",
                {
                  className: "tm-btn",
                  style: {
                    ...r.btnPrimary,
                    ...b.done ? { opacity: 0.5, cursor: "default" } : {},
                    ...c ? { background: "rgba(129,140,248,0.25)", color: t.kiro } : {}
                  },
                  disabled: b.done || !!i,
                  onClick: () => je(e, b, O),
                  children: c ? "⚙ EXECUTING VIA AGENT…" : b.done ? "✓ COMPLETED" : b.runState === "failed" ? "↻ RETRY VIA AGENT" : "▶ RUN COMMAND NATIVELY"
                }
              ) }),
              (c || b.output) && /* @__PURE__ */ o(
                "div",
                {
                  style: {
                    ...r.outputPre,
                    ...b.runState === "failed" && !c ? { borderColor: "rgba(229,83,75,0.45)" } : {}
                  },
                  children: c ? `$ ${b.command}
… taskmaster agent is executing — the reply lands here and in the task chat below` : /* @__PURE__ */ o(ot, { content: b.output ?? "" })
                }
              )
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
                  style: { ...r.btnGhost, ...u ? { color: t.kiro } : {} },
                  disabled: !!i,
                  onClick: () => ve(e),
                  children: u ? "⚙ AGENT DRAFTING…" : "✦ DRAFT STEPS WITH AI"
                }
              ),
              /* @__PURE__ */ o(
                "button",
                {
                  className: "tm-btn",
                  style: { ...r.btnGhost, ...f ? { color: t.kiro } : { color: t.focus, borderColor: "rgba(52,211,153,0.3)" } },
                  disabled: !!i || q === 0,
                  onClick: () => Pe(e),
                  children: f ? "⚙ AGENT RUNNING STEPS…" : `▶ RUN REMAINING (${q})`
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ o("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: e.subtasks.map((g, x) => {
            const h = x === O;
            return /* @__PURE__ */ l(
              "div",
              {
                style: { ...r.queueRow, ...h ? r.queueRowActive : {} },
                onClick: () => ne(e.id, x),
                children: [
                  /* @__PURE__ */ l("span", { style: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 }, children: [
                    /* @__PURE__ */ o(
                      "button",
                      {
                        className: "tm-btn",
                        style: r.queueCheck,
                        "aria-label": g.done ? "Mark incomplete" : "Mark complete",
                        onClick: (w) => {
                          w.stopPropagation(), K(e.id, g.id, !g.done);
                        },
                        children: g.done ? /* @__PURE__ */ o("span", { style: { color: t.focus, fontWeight: 700 }, children: "✓" }) : /* @__PURE__ */ o("span", { style: { color: "#475569" }, children: "○" })
                      }
                    ),
                    /* @__PURE__ */ l("span", { style: { minWidth: 0 }, children: [
                      /* @__PURE__ */ o("span", { style: { fontSize: 12, ...g.done ? { textDecoration: "line-through", color: t.muted } : {} }, children: g.title }),
                      /* @__PURE__ */ l("span", { style: { display: "flex", gap: 6, marginTop: 2 }, children: [
                        g.runState === "failed" && !g.done && /* @__PURE__ */ o("span", { style: { ...r.execChip, ...r.failedChip }, children: "FAILED" }),
                        g.command && !g.done && /* @__PURE__ */ o("span", { style: r.execChip, children: "EXECUTABLE" }),
                        g.source === "agent" && /* @__PURE__ */ o("span", { style: { ...r.execChip, color: t.kiro, borderColor: "rgba(129,140,248,0.3)", background: "rgba(129,140,248,0.08)" }, children: "AGENT-DRAFTED" })
                      ] })
                    ] })
                  ] }),
                  h && /* @__PURE__ */ o("span", { style: r.activeChip, children: "ACTIVE" })
                ]
              },
              g.id
            );
          }) }),
          /* @__PURE__ */ l("div", { style: { ...r.addRow, marginTop: 10 }, children: [
            /* @__PURE__ */ o(
              "input",
              {
                style: { ...r.input, flex: 2 },
                placeholder: "Add micro-step…",
                value: ge,
                onChange: (g) => fe(g.target.value),
                onKeyDown: (g) => {
                  g.key === "Enter" && te(e);
                }
              }
            ),
            /* @__PURE__ */ o(
              "input",
              {
                style: { ...r.input, flex: 3, fontFamily: R, fontSize: 11 },
                placeholder: "optional terminal command",
                value: he,
                onChange: (g) => be(g.target.value),
                onKeyDown: (g) => {
                  g.key === "Enter" && te(e);
                }
              }
            ),
            /* @__PURE__ */ o("button", { className: "tm-btn", style: r.btnGhost, onClick: () => te(e), children: "ADD" })
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
        Ee()
      ] }),
      S.tasks.map((e) => {
        const n = Ae(e), a = e.id === (k == null ? void 0 : k.id), i = (C == null ? void 0 : C.taskId) === e.id ? C : null, c = (i == null ? void 0 : i.kind) === "draft";
        return /* @__PURE__ */ l(
          "section",
          {
            className: "tm-card",
            style: { ...r.card, ...a ? { borderColor: "rgba(52,211,153,0.4)" } : {} },
            children: [
              /* @__PURE__ */ l("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }, children: [
                /* @__PURE__ */ o("span", { style: { fontWeight: 600, fontSize: 14, minWidth: 0 }, children: e.title }),
                /* @__PURE__ */ l("span", { style: { display: "flex", gap: 6, flexWrap: "wrap" }, children: [
                  e.estimateMinutes != null && /* @__PURE__ */ l("span", { style: { ...r.chip, color: "#38bdf8", borderColor: t.border, fontFamily: R }, children: [
                    "~",
                    e.estimateMinutes,
                    "m"
                  ] }),
                  /* @__PURE__ */ o("button", { className: "tm-btn", style: { ...r.btnGhost, color: t.focus, borderColor: "rgba(52,211,153,0.3)" }, onClick: () => Ke(e.id), children: "FOCUS" }),
                  /* @__PURE__ */ o(
                    "button",
                    {
                      className: "tm-btn",
                      style: { ...r.btnGhost, ...c ? { color: t.kiro } : {} },
                      disabled: !!i,
                      onClick: () => ve(e),
                      children: c ? "⚙ DRAFTING…" : "✦ DRAFT STEPS"
                    }
                  ),
                  /* @__PURE__ */ o("button", { className: "tm-btn", style: r.btnGhost, onClick: () => Te(e), children: "💬 CHAT" }),
                  /* @__PURE__ */ o(
                    "button",
                    {
                      className: "tm-btn",
                      style: { ...r.btnGhost, ..._ === e.id ? { color: t.danger, borderColor: t.danger } : {} },
                      onClick: () => _ === e.id ? Ue(e.id) : Y(e.id),
                      onBlur: () => Y(null),
                      children: _ === e.id ? "SURE?" : "DELETE"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ o("div", { style: { ...r.progressTrack, marginTop: 12 }, children: /* @__PURE__ */ o("div", { style: { ...r.progressFill, width: `${n.pct}%` } }) }),
              /* @__PURE__ */ l("div", { style: { display: "flex", flexDirection: "column", gap: 4, marginTop: 10 }, children: [
                e.subtasks.length === 0 && /* @__PURE__ */ o("span", { style: { color: t.muted, fontSize: 11 }, children: "No micro-steps yet." }),
                e.subtasks.map((u) => {
                  const f = u.runState === "failed" && !u.done;
                  return /* @__PURE__ */ l("div", { style: r.backlogSubRow, children: [
                    /* @__PURE__ */ o("span", { style: { color: u.done ? t.focus : f ? t.danger : "#475569" }, children: u.done ? "✓" : f ? "✗" : "○" }),
                    /* @__PURE__ */ o("span", { style: { fontSize: 11, ...u.done ? { textDecoration: "line-through", color: t.muted } : {} }, children: u.title }),
                    f && /* @__PURE__ */ o("span", { style: { ...r.execChip, ...r.failedChip }, children: "FAILED" })
                  ] }, u.id);
                })
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
                s.get("/api/status").then((e) => {
                  le(typeof e == "object" && e !== null ? e : {}), m("ok", "Gateway status refreshed.");
                }).catch((e) => m("warn", `Status refresh failed: ${String(e)}`));
              },
              children: "REFRESH"
            }
          )
        ] }),
        /* @__PURE__ */ l("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ o(V, { label: "STATUS", value: E ? "ONLINE" : "UNKNOWN", accent: E ? t.focus : t.warn }),
          /* @__PURE__ */ o(V, { label: "VERSION", value: String((E == null ? void 0 : E.version) ?? "—"), accent: t.kiro }),
          /* @__PURE__ */ o(V, { label: "UPTIME", value: String((E == null ? void 0 : E.uptime) ?? "—"), accent: t.text }),
          /* @__PURE__ */ o(V, { label: "PROVIDER", value: String((E == null ? void 0 : E.provider) ?? "—"), accent: t.text })
        ] })
      ] }),
      /* @__PURE__ */ l("section", { className: "tm-card", style: { ...r.card, fontFamily: R }, children: [
        /* @__PURE__ */ l("div", { style: { display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", borderBottom: `1px solid ${t.border}`, paddingBottom: 8, marginBottom: 10 }, children: [
          /* @__PURE__ */ o("span", { style: { color: t.muted, fontSize: 11 }, children: "Taskmaster activity + gateway console" }),
          /* @__PURE__ */ o("span", { style: { ...r.execChip, color: t.muted }, children: Le })
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
    U && /* @__PURE__ */ o("div", { style: r.errorBanner, children: U }),
    H
  ] });
}
function V({ label: s, value: p, accent: d }) {
  return /* @__PURE__ */ l("div", { style: r.statBox, children: [
    /* @__PURE__ */ o("div", { style: { color: t.muted, fontSize: 9, letterSpacing: "0.1em", marginBottom: 4 }, children: s }),
    /* @__PURE__ */ o("div", { style: { color: d, fontSize: 13, fontWeight: 700, fontFamily: R, wordBreak: "break-all" }, children: p })
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
  commandLabel: { fontSize: 9, letterSpacing: "0.14em", color: t.muted, fontFamily: R },
  commandCode: {
    display: "block",
    padding: 8,
    borderRadius: 8,
    border: `1px solid ${t.border}`,
    background: t.card,
    color: "#6ee7b7",
    fontSize: 11,
    fontFamily: R,
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
    fontFamily: R,
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
    fontFamily: R
  },
  failedChip: {
    color: t.danger,
    borderColor: "rgba(229,83,75,0.35)",
    background: "rgba(229,83,75,0.08)"
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
