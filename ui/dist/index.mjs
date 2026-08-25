import { jsx as o, jsxs as c, Fragment as le } from "react/jsx-runtime";
import { useState as R, useRef as P, useCallback as A, useEffect as de, useMemo as Xe } from "react";
import { useAppApi as Je, useNotify as Qe, useNavBadge as Ze, useChatLauncher as et, useAppEvents as tt, ChatEmbed as nt } from "@kirocrew/app-sdk";
import { MarkdownRenderer as ot } from "@kirocrew/ui";
function ce(i) {
  return `taskmaster-${i.id}`;
}
let Ae = 0;
function q(i) {
  return Ae += 1, `${i}-${Date.now().toString(36)}-${Ae.toString(36)}`;
}
function rt() {
  return { version: 1, settings: { memorySync: !0 }, activeTaskId: null, tasks: [] };
}
function it(i) {
  var I;
  const u = rt();
  if (typeof i != "object" || i === null) return u;
  const l = i, y = Array.isArray(l.tasks) ? l.tasks.filter(Oe).map(st) : u.tasks, x = typeof l.settings == "object" && l.settings !== null ? { memorySync: l.settings.memorySync !== !1 } : u.settings, $ = typeof l.activeTaskId == "string" ? l.activeTaskId : null;
  return {
    version: 1,
    settings: x,
    activeTaskId: y.some((E) => E.id === $) ? $ : ((I = y[0]) == null ? void 0 : I.id) ?? null,
    tasks: y
  };
}
function Oe(i) {
  return typeof i == "object" && i !== null && typeof i.title == "string";
}
function st(i) {
  const u = Array.isArray(i.subtasks) ? i.subtasks.filter(Oe).map((l) => ({
    id: typeof l.id == "string" ? l.id : q("sub"),
    title: String(l.title),
    done: l.done === !0,
    ...typeof l.command == "string" && l.command.trim() ? { command: l.command } : {},
    ...typeof l.output == "string" && l.output ? { output: l.output } : {},
    ...l.runState === "done" || l.runState === "failed" ? { runState: l.runState } : {},
    ...l.source === "agent" || l.source === "manual" ? { source: l.source } : {}
  })) : [];
  return {
    id: typeof i.id == "string" ? i.id : q("task"),
    title: String(i.title),
    ...typeof i.estimateMinutes == "number" && i.estimateMinutes > 0 ? { estimateMinutes: Math.round(i.estimateMinutes) } : {},
    createdAt: typeof i.createdAt == "string" ? i.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
    subtasks: u,
    ...i.lessonPosted === !0 ? { lessonPosted: !0 } : {},
    ...i.slotStarted === !0 ? { slotStarted: !0 } : {}
  };
}
function Ne(i) {
  const u = i.subtasks.length, l = i.subtasks.filter((y) => y.done).length;
  return { done: l, total: u, pct: u === 0 ? 0 : Math.round(l / u * 100) };
}
function at(i) {
  const u = i.subtasks.findIndex((l) => !l.done);
  return u === -1 ? Math.max(0, i.subtasks.length - 1) : u;
}
function lt(i) {
  const u = /```(?:json)?\s*([\s\S]*?)```/.exec(i), l = [];
  u != null && u[1] && l.push(u[1]);
  const y = i.indexOf("["), x = i.lastIndexOf("]");
  y !== -1 && x > y && l.push(i.slice(y, x + 1));
  for (const $ of l)
    try {
      const I = JSON.parse($);
      if (!Array.isArray(I)) continue;
      const E = I.filter((k) => typeof k == "object" && k !== null).map((k) => ({
        title: typeof k.title == "string" ? k.title.trim() : "",
        ...typeof k.command == "string" && k.command.trim() ? { command: k.command.trim() } : {}
      })).filter((k) => k.title.length > 0).slice(0, 12);
      if (E.length > 0) return E;
    } catch {
    }
  return null;
}
function dt(i) {
  const u = i.subtasks.map((l, y) => `${y + 1}. ${l.title}${l.command ? ` [${l.command}]` : ""}`);
  return `Completed "${i.title}" via micro-steps: ${u.join(" ")}`;
}
const ct = 900 * 1e3;
function ut(i, u, l = ct) {
  return u - i.sentAt > l;
}
function Me(i, u) {
  return i ?? u;
}
function pt(i) {
  if (typeof i != "object" || i === null) return { messages: [], running: !1 };
  const u = i;
  return { messages: Array.isArray(u.messages) ? u.messages.filter((y) => typeof y == "object" && y !== null) : [], running: u.running === !0 };
}
const Le = /^\s*STEP RESULT \[(\d+)\]:\s*(done|failed)\s*(?:[—–:-]\s*)?(.*)$/gim;
function mt(i) {
  const u = [];
  Le.lastIndex = 0;
  let l;
  for (; (l = Le.exec(i)) !== null; )
    u.push({
      index: Number.parseInt(l[1], 10),
      ok: l[2].toLowerCase() === "done",
      summary: l[3].trim()
    });
  return u;
}
const Be = 4e3;
function ft(i) {
  const { work: u, data: l, seen: y, stepCount: x } = i, $ = l.running ? Math.max(0, l.messages.length - 1) : l.messages.length, I = l.messages.slice(y, $), E = Math.max(y, $);
  if (x === null)
    return { actions: [], nextSeen: E, sawReply: i.sawReply, settled: !0, stepSucceeded: !1 };
  const k = [];
  let G = i.sawReply, B = !1, K = !1;
  for (const h of I) {
    if (h.role === "user" || !h.content) continue;
    G = !0;
    const M = h.content;
    if (u.kind === "draft") {
      const w = lt(M);
      w && (k.push({ type: "append-draft", steps: w }), B = !0);
      continue;
    }
    const z = mt(M);
    for (const w of z) {
      if (w.index < 1 || w.index > x) {
        k.push({ type: "unknown-step", result: w });
        continue;
      }
      const H = z.length === 1 ? M.slice(0, Be) : `${w.ok ? "done" : "failed"} — ${w.summary || "(no summary)"}`;
      k.push({ type: "step-result", result: w, output: H }), w.ok && (K = !0), u.kind === "step" && (B = !0);
    }
  }
  if (B && u.kind !== "all")
    return { actions: k, nextSeen: E, sawReply: G, settled: !0, stepSucceeded: K };
  if (!l.running && G) {
    const h = [...I].reverse().find((M) => M.role !== "user" && M.content);
    k.push({
      type: "turn-ended",
      kind: u.kind,
      ...u.kind === "step" && (h != null && h.content) ? { output: h.content.slice(0, Be) } : {}
    }), B = !0;
  }
  return { actions: k, nextSeen: E, sawReply: G, settled: B, stepSucceeded: K };
}
const ze = "/api/apps/taskmaster-pro/config", gt = 200, De = "notification scope · slot polling", ht = 2500, t = {
  bg: "var(--bg, #030712)",
  card: "var(--card, #0b1329)",
  border: "var(--border, #1e293b)",
  text: "var(--text, #f1f5f9)",
  muted: "var(--muted, #94a3b8)",
  focus: "#34d399",
  kiro: "#818cf8",
  warn: "var(--warn, #d29922)",
  danger: "var(--danger, #e5534b)"
}, N = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
function bt() {
  return (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0];
}
function Tt() {
  const i = Je(), u = Qe(), l = Ze(), { openChat: y } = et(), [x, $] = R(null), [I, E] = R("focus"), [k, G] = R({}), [B, K] = R([]), [h, M] = R(null), [z, w] = R(null), [H, ue] = R(""), [pe, me] = R(""), [fe, ge] = R(""), [he, be] = R(""), [Q, Z] = R(null), [v, V] = R(null), D = P(null);
  D.current = x;
  const ye = P(Promise.resolve()), ke = P(0), ee = P({}), O = P(null);
  O.current = v;
  const W = P({}), te = P(!1), m = A((e, n) => {
    K((d) => [{ ts: bt(), level: e, msg: n }, ...d].slice(0, gt));
  }, []), xe = A(
    (e) => {
      $(e), D.current = e;
      const n = ++ke.current;
      ye.current = ye.current.then(async () => {
        if (n === ke.current)
          try {
            await i.put(ze, e);
          } catch (d) {
            m("warn", `Config save failed: ${String(d)}`);
          }
      });
    },
    [i, m]
  ), T = A(
    (e) => {
      const n = D.current;
      n && xe(e(n));
    },
    [xe]
  ), ne = A(
    (e) => {
      i.get(ze).then((n) => {
        e != null && e() || ($(it(n)), w(null), m("info", "Loaded task state from gateway app config."));
      }).catch((n) => {
        e != null && e() || ($(null), w(`Config load failed (${String(n)}) — retry to continue.`), m("warn", `Config load failed: ${String(n)}`));
      });
    },
    [i, m]
  );
  de(() => {
    let e = !1;
    return ne(() => e), i.get("/api/status").then((n) => {
      e || (M(typeof n == "object" && n !== null ? n : {}), m("ok", "Connected to Kiro Crew gateway."));
    }).catch(() => {
      e || m("warn", "Gateway status unavailable.");
    }), m("info", `Console mode: ${De} — gateway event forwarding to app pages is pending upstream.`), () => {
      e = !0;
    };
  }, [ne]);
  const Se = A(
    (e) => {
      u(`Task complete: ${e.title}`), m("ok", `Task "${e.title}" fully completed.`);
      const n = D.current;
      !(n != null && n.settings.memorySync) || e.lessonPosted || ee.current[e.id] || (ee.current[e.id] = !0, i.post("/api/lessons", { rule: dt(e), category: "knowledge" }).then(() => {
        T((d) => ({
          ...d,
          tasks: d.tasks.map((s) => s.id === e.id ? { ...s, lessonPosted: !0 } : s)
        })), m("ok", "Kiro Memory: appended solution path to lessons (category: knowledge).");
      }).catch((d) => m("warn", `Memory sync failed: ${String(d)}`)).finally(() => {
        delete ee.current[e.id];
      }));
    },
    [i, u, m, T]
  ), _ = A(
    (e, n, d, s, a) => {
      let p = null;
      T((g) => {
        const f = g.tasks.map((C) => {
          if (C.id !== e) return C;
          const L = C.subtasks.map((j) => {
            if (j.id !== n) return j;
            const ae = { ...j, done: d, ...s !== void 0 ? { output: s } : {} };
            return a ? ae.runState = a : delete ae.runState, ae;
          }), U = { ...C, subtasks: L }, Ye = C.subtasks.length > 0 && C.subtasks.every((j) => j.done);
          return L.length > 0 && L.every((j) => j.done) && !Ye && (p = U), U;
        });
        return { ...g, tasks: f };
      }), p && Se(p);
    },
    [T, Se]
  );
  tt("notification", (e) => {
    const n = typeof e == "object" && e !== null ? e : {}, d = typeof n.title == "string" ? n.title : "notification", s = typeof n.text == "string" ? n.text : "";
    m("info", `Gateway notification [${d}]: ${s.slice(0, 200)}`);
  });
  const Ce = A(
    (e, n) => {
      T((d) => ({
        ...d,
        tasks: d.tasks.map((s) => {
          if (s.id !== e) return s;
          const a = new Set(s.subtasks.map((g) => g.title.toLowerCase())), p = n.filter((g) => !a.has(g.title.toLowerCase())).map((g) => ({ id: q("sub"), title: g.title, done: !1, source: "agent", ...g.command ? { command: g.command } : {} }));
          return { ...s, subtasks: [...s.subtasks, ...p] };
        })
      })), m("ok", `Taskmaster agent drafted ${n.length} micro-step(s).`), u(`Added ${n.length} drafted micro-steps`);
    },
    [m, T, u]
  ), ve = A(
    async (e) => pt(await i.get(`/api/chat/slots/${encodeURIComponent(e)}`)),
    [i]
  ), oe = A(
    (e, n, d, s) => {
      T((a) => ({
        ...a,
        tasks: a.tasks.map(
          (p) => p.id === e ? {
            ...p,
            subtasks: p.subtasks.map(
              (g) => g.id === n ? { ...g, output: d, ...s ? { runState: s } : {} } : g
            )
          } : p
        )
      }));
    },
    [T]
  );
  async function re(e, n, d) {
    if (O.current) return;
    const s = ce(e);
    if (W.current[s] === void 0)
      try {
        const a = (await ve(s)).messages.length;
        W.current[s] = Me(W.current[s], a);
      } catch {
        W.current[s] = Me(W.current[s], 0);
      }
    te.current = !1, V({ ...d, sentAt: Date.now() }), e.slotStarted || T((a) => ({
      ...a,
      tasks: a.tasks.map((p) => p.id === e.id ? { ...p, slotStarted: !0 } : p)
    })), i.post("/api/chat", { message: n, slot: s, agent: "taskmaster" }).catch((a) => {
      var p;
      a instanceof SyntaxError || (m("err", `Send to task slot failed: ${String(a)}`), u("Could not reach the gateway", { type: "error" }), ((p = O.current) == null ? void 0 : p.taskId) === e.id && V(null));
    }), m("info", `Sent to task slot ${s}: ${n.split(`
`)[0].slice(0, 120)}`);
  }
  const We = A(
    (e, n) => {
      var d, s;
      for (const a of n) {
        if (a.type === "append-draft") {
          Ce(e.taskId, a.steps);
          continue;
        }
        if (a.type === "unknown-step") {
          m("warn", `Agent reported STEP RESULT [${a.result.index}] but the task has no such step.`);
          continue;
        }
        if (a.type === "step-result") {
          const p = (d = D.current) == null ? void 0 : d.tasks.find((f) => f.id === e.taskId), g = p == null ? void 0 : p.subtasks[a.result.index - 1];
          if (!g) continue;
          a.result.ok ? (_(e.taskId, g.id, !0, a.output, "done"), m("ok", `Step ${a.result.index} completed by agent: ${a.result.summary || g.title}`)) : (oe(e.taskId, g.id, a.output, "failed"), m("warn", `Step ${a.result.index} failed: ${a.result.summary || "(no summary)"}`));
          continue;
        }
        if (a.kind === "all")
          m("ok", "Agent finished the run — see per-step results above and the task chat.");
        else if (a.kind === "draft")
          m("warn", "Draft reply had no parseable json block — see the task chat."), u("Agent reply was not parseable — see the task chat");
        else {
          const p = (s = D.current) == null ? void 0 : s.tasks.find((f) => f.id === e.taskId), g = e.stepIndex != null ? p == null ? void 0 : p.subtasks[e.stepIndex] : void 0;
          g && a.output && oe(e.taskId, g.id, a.output), m("warn", "Agent reply had no STEP RESULT marker — step left for manual toggle.");
        }
      }
    },
    [m, Ce, u, oe, _]
  );
  de(() => {
    if (!v) return;
    const e = ce({ id: v.taskId });
    let n = !1;
    const d = async () => {
      var L;
      const a = O.current;
      if (n || !a) return;
      if (ut(a, Date.now())) {
        m("warn", "Agent request timed out — check the task chat."), V(null);
        return;
      }
      let p;
      try {
        p = await ve(e);
      } catch {
        return;
      }
      const g = W.current[e] ?? 0, f = (L = D.current) == null ? void 0 : L.tasks.find((U) => U.id === a.taskId), C = ft({
        work: a,
        data: p,
        seen: g,
        sawReply: te.current,
        stepCount: (f == null ? void 0 : f.subtasks.length) ?? null
      });
      W.current[e] = C.nextSeen, te.current = C.sawReply, We(a, C.actions), C.settled && (a.kind === "step" && C.stepSucceeded && u("Step completed via taskmaster agent", { type: "success" }), V(null));
    }, s = setInterval(() => void d(), ht);
    return d(), () => {
      n = !0, clearInterval(s);
    };
  }, [v == null ? void 0 : v.sentAt]);
  function Fe(e, n, d) {
    !n.command || O.current || (m("info", `Kiro terminal execute (step ${d + 1}): ${n.command}`), re(
      e,
      `Run micro-step [${d + 1}] of task "${e.title}": ${n.title}
Execute this terminal command and report concise output:
${n.command}
End your reply with exactly one line: STEP RESULT [${d + 1}]: done|failed — <short summary>`,
      { taskId: e.id, kind: "step", stepIndex: d }
    ));
  }
  function Te(e) {
    if (O.current) return;
    const n = e.subtasks.map((d) => d.title).join("; ") || "none";
    m("info", `Requesting micro-step breakdown for "${e.title}".`), u("Taskmaster agent is drafting micro-steps…"), re(
      e,
      `Break the task "${e.title}"${e.estimateMinutes ? ` (~${e.estimateMinutes}m)` : ""} into micro-steps per the taskmaster-method skill. Reply with ONE fenced json code block containing an array of {"title", "command"?} objects and no prose outside it.
Existing steps (do not duplicate): ${n}`,
      { taskId: e.id, kind: "draft" }
    );
  }
  function je(e) {
    if (O.current) return;
    const n = e.subtasks.map((s, a) => ({ sub: s, index: a })).filter(({ sub: s }) => !s.done);
    if (n.length === 0) return;
    const d = n.map(({ sub: s, index: a }) => `[${a + 1}] ${s.title}${s.command ? ` — command: ${s.command}` : ""}`).join(`
`);
    m("info", `Running ${n.length} remaining step(s) unattended via taskmaster agent.`), u(`Agent is running ${n.length} remaining step(s)…`), re(
      e,
      `Execute the remaining micro-steps of task "${e.title}" in order, autonomously:
${d}
After finishing each step output one line: STEP RESULT [n]: done|failed — <short summary>. If a step cannot be completed autonomously, mark it failed with the reason and continue to the next.`,
      { taskId: e.id, kind: "all" }
    );
  }
  function we(e) {
    const n = e.subtasks.filter((d) => !d.done).map((d) => d.title);
    y({
      agent: "taskmaster",
      message: `Check in on task "${e.title}". Remaining micro-steps: ${n.join("; ") || "none"}. Help me with the next one.`
    });
  }
  async function Pe(e) {
    try {
      await i.post("/api/crons", {
        name: `taskmaster-${e.id}`,
        cron: "0 9 * * 1-5",
        agent: "taskmaster",
        message: `Taskmaster routine check-in on task "${e.title}". Review current progress and report the single next micro-step.`
      }), m("ok", `Cron registered: weekday 09:00 routine check-in on "${e.title}".`), u("Routine scheduled — weekdays 09:00");
    } catch (n) {
      m("err", `Cron registration failed: ${String(n)}`), u("Could not register the cron");
    }
  }
  function Ie() {
    const e = H.trim();
    if (!e) return;
    const n = Number.parseInt(pe, 10), d = {
      id: q("task"),
      title: e,
      ...Number.isFinite(n) && n > 0 ? { estimateMinutes: n } : {},
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      subtasks: []
    };
    T((s) => ({ ...s, tasks: [...s.tasks, d], activeTaskId: s.activeTaskId ?? d.id })), ue(""), me(""), m("info", `Task added to backlog: "${e}"`);
  }
  function ie(e) {
    const n = fe.trim();
    if (!n) return;
    const d = he.trim(), s = { id: q("sub"), title: n, done: !1, source: "manual", ...d ? { command: d } : {} };
    T((a) => ({
      ...a,
      tasks: a.tasks.map((p) => p.id === e.id ? { ...p, subtasks: [...p.subtasks, s] } : p)
    })), ge(""), be("");
  }
  function Ge(e) {
    T((n) => {
      var s;
      const d = n.tasks.filter((a) => a.id !== e);
      return { ...n, tasks: d, activeTaskId: n.activeTaskId === e ? ((s = d[0]) == null ? void 0 : s.id) ?? null : n.activeTaskId };
    }), Z(null), m("info", "Task removed from backlog.");
  }
  function Ue(e) {
    T((n) => ({ ...n, activeTaskId: e })), E("focus");
  }
  const S = Xe(() => x ? x.tasks.find((e) => e.id === x.activeTaskId) ?? x.tasks[0] ?? null : null, [x]), F = S ? Math.max(
    0,
    Math.min(k[S.id] ?? at(S), Math.max(0, S.subtasks.length - 1))
  ) : 0, b = (S == null ? void 0 : S.subtasks[F]) ?? null, Ke = S ? Ne(S) : null, Y = S ? S.subtasks.filter((e) => !e.done).length : 0;
  de(() => {
    try {
      l(Y);
    } catch {
    }
  }, [Y, l]);
  function se(e, n) {
    G((d) => ({ ...d, [e]: n }));
  }
  if (!x)
    return /* @__PURE__ */ o("div", { style: { ...r.root, alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ c("div", { style: { display: "grid", gap: 10, justifyItems: "center" }, children: [
      /* @__PURE__ */ o("span", { style: { color: t.muted, fontSize: 13 }, children: z ?? "Loading Taskmaster Pro…" }),
      z ? /* @__PURE__ */ o("button", { className: "tm-btn", style: r.primaryBtn, onClick: () => ne(), children: "Retry load" }) : null
    ] }) });
  const Re = x.tasks.length, $e = x.settings.memorySync;
  let X;
  switch (I) {
    case "focus":
      X = He();
      break;
    case "backlog":
      X = Ve();
      break;
    case "console":
      X = _e();
      break;
    default: {
      const e = I;
      throw new Error(`Unhandled view: ${String(e)}`);
    }
  }
  function qe() {
    const e = [
      { id: "focus", label: "★ Focus" },
      { id: "backlog", label: `Backlog (${Re})` },
      { id: "console", label: "Console" }
    ];
    return /* @__PURE__ */ o("div", { style: r.tabRow, children: e.map((n) => /* @__PURE__ */ o(
      "button",
      {
        className: "tm-btn",
        style: { ...r.tab, ...I === n.id ? r.tabActive : {} },
        onClick: () => E(n.id),
        children: n.label
      },
      n.id
    )) });
  }
  function Ee() {
    return /* @__PURE__ */ c("div", { style: r.addRow, children: [
      /* @__PURE__ */ o(
        "input",
        {
          style: { ...r.input, flex: 1 },
          placeholder: "New task title…",
          value: H,
          onChange: (e) => ue(e.target.value),
          onKeyDown: (e) => {
            e.key === "Enter" && Ie();
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
      /* @__PURE__ */ o("button", { className: "tm-btn", style: r.btnPrimary, onClick: Ie, children: "ADD TASK" })
    ] });
  }
  function He() {
    if (!S)
      return /* @__PURE__ */ c("section", { className: "tm-card", style: { ...r.card, textAlign: "center" }, children: [
        /* @__PURE__ */ o("div", { style: { fontSize: 28, marginBottom: 8 }, children: "⚡" }),
        /* @__PURE__ */ o("div", { style: { fontSize: 15, fontWeight: 700 }, children: "No task in focus" }),
        /* @__PURE__ */ o("p", { style: { color: t.muted, fontSize: 12, margin: "6px 0 14px" }, children: "Add your first task — the taskmaster agent can draft its micro-steps." }),
        Ee()
      ] });
    const e = S, n = Ke ?? { done: 0, total: 0, pct: 0 }, d = ce(e), s = (v == null ? void 0 : v.taskId) === e.id ? v : null, a = !!(b && (s == null ? void 0 : s.kind) === "step" && s.stepIndex === F), p = (s == null ? void 0 : s.kind) === "draft", g = (s == null ? void 0 : s.kind) === "all";
    return /* @__PURE__ */ c(le, { children: [
      /* @__PURE__ */ c("section", { className: "tm-card", style: { ...r.card, paddingTop: 20, position: "relative", overflow: "hidden" }, children: [
        /* @__PURE__ */ o("div", { style: r.gradientStrip }),
        /* @__PURE__ */ c("div", { style: r.centerCol, children: [
          /* @__PURE__ */ c("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }, children: [
            /* @__PURE__ */ o("span", { style: { ...r.chip, color: t.focus, borderColor: "rgba(52,211,153,0.35)", background: "rgba(52,211,153,0.08)" }, children: "★ TASKMASTER ACTIVE" }),
            /* @__PURE__ */ c(
              "button",
              {
                className: "tm-btn",
                style: {
                  ...r.chip,
                  cursor: "pointer",
                  ...$e ? { color: t.kiro, borderColor: "rgba(129,140,248,0.35)", background: "rgba(129,140,248,0.08)" } : { color: t.muted, borderColor: t.border, background: "transparent" }
                },
                title: "One lesson is stored per completed task when ON",
                onClick: () => T((f) => ({ ...f, settings: { memorySync: !f.settings.memorySync } })),
                children: [
                  "🧠 MEMORY SYNC: ",
                  $e ? "ON" : "OFF"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ o("p", { style: { color: t.muted, fontSize: 11, fontStyle: "italic", margin: "10px 0 6px" }, children: "Isolation mode active. Execute one step at a time." }),
          /* @__PURE__ */ o("h2", { style: r.taskTitle, children: e.title }),
          /* @__PURE__ */ c("div", { style: { display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", justifyContent: "center" }, children: [
            e.estimateMinutes != null && /* @__PURE__ */ c("span", { style: { ...r.chip, color: "#38bdf8", borderColor: t.border, fontFamily: N }, children: [
              "~",
              e.estimateMinutes,
              "m"
            ] }),
            /* @__PURE__ */ o("button", { className: "tm-btn", style: { ...r.chip, cursor: "pointer", color: t.text, borderColor: t.border }, onClick: () => void Pe(e), children: "⏰ SCHEDULE ROUTINE (CRON)" }),
            /* @__PURE__ */ o("button", { className: "tm-btn", style: { ...r.chip, cursor: "pointer", color: t.text, borderColor: t.border }, onClick: () => we(e), children: "💬 OPEN IN CHAT" })
          ] })
        ] }),
        /* @__PURE__ */ o("div", { style: r.progressTrack, role: "progressbar", "aria-valuenow": n.pct, "aria-valuemin": 0, "aria-valuemax": 100, children: /* @__PURE__ */ o("div", { style: { ...r.progressFill, width: `${n.pct}%` } }) }),
        /* @__PURE__ */ c("div", { style: { textAlign: "right", color: t.muted, fontSize: 11, marginTop: 6, fontFamily: N }, children: [
          n.done,
          "/",
          n.total,
          " · ",
          n.pct,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ c("section", { className: "tm-card", style: { ...r.card, borderColor: "rgba(52,211,153,0.3)" }, children: [
        /* @__PURE__ */ c("div", { style: r.stepHeader, children: [
          /* @__PURE__ */ c("span", { style: { ...r.stepCounter, color: t.focus }, children: [
            /* @__PURE__ */ o("span", { className: "tm-pulse", style: r.pulseDot }),
            e.subtasks.length === 0 ? "NO MICRO-STEPS YET" : `ACTIVE MICRO-STEP ${F + 1} OF ${e.subtasks.length}`
          ] }),
          /* @__PURE__ */ c("span", { style: { display: "flex", gap: 6 }, children: [
            /* @__PURE__ */ o("button", { className: "tm-btn", style: r.navBtn, onClick: () => se(e.id, Math.max(0, F - 1)), children: "◄" }),
            /* @__PURE__ */ o(
              "button",
              {
                className: "tm-btn",
                style: r.navBtn,
                onClick: () => se(e.id, Math.min(e.subtasks.length - 1, F + 1)),
                children: "►"
              }
            )
          ] })
        ] }),
        b ? /* @__PURE__ */ c("div", { style: { display: "flex", gap: 14, alignItems: "flex-start" }, children: [
          /* @__PURE__ */ o(
            "button",
            {
              className: "tm-btn",
              style: r.checkBtn,
              "aria-label": b.done ? "Mark step incomplete" : "Mark step complete",
              onClick: () => _(e.id, b.id, !b.done),
              children: b.done ? /* @__PURE__ */ o("span", { style: { ...r.checkCircle, background: "rgba(52,211,153,0.18)", borderColor: "rgba(52,211,153,0.5)", color: t.focus }, children: "✓" }) : /* @__PURE__ */ o("span", { style: { ...r.checkCircle, borderColor: "#475569", color: "transparent" }, children: "✓" })
            }
          ),
          /* @__PURE__ */ c("div", { style: { flex: 1, minWidth: 0 }, children: [
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
            b.command && /* @__PURE__ */ c("div", { style: r.commandBox, children: [
              /* @__PURE__ */ c("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
                /* @__PURE__ */ o("span", { style: r.commandLabel, children: "KIRO TERMINAL EXECUTABLE" }),
                /* @__PURE__ */ c("span", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
                  b.runState === "failed" && !a && /* @__PURE__ */ o("span", { style: { ...r.execChip, ...r.failedChip }, children: "LAST RUN FAILED" }),
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
                    ...a ? { background: "rgba(129,140,248,0.25)", color: t.kiro } : {}
                  },
                  disabled: b.done || !!s,
                  onClick: () => Fe(e, b, F),
                  children: a ? "⚙ EXECUTING VIA AGENT…" : b.done ? "✓ COMPLETED" : b.runState === "failed" ? "↻ RETRY VIA AGENT" : "▶ RUN COMMAND NATIVELY"
                }
              ) }),
              (a || b.output) && /* @__PURE__ */ o(
                "div",
                {
                  style: {
                    ...r.outputPre,
                    // Always longhand: toggling borderColor against the
                    // shorthand `border` triggers a React style warning.
                    borderColor: b.runState === "failed" && !a ? "rgba(229,83,75,0.45)" : t.border
                  },
                  children: a ? `$ ${b.command}
… taskmaster agent is executing — the reply lands here and in the task chat below` : /* @__PURE__ */ o(ot, { content: b.output ?? "" })
                }
              )
            ] }),
            /* @__PURE__ */ o("p", { style: { color: t.muted, fontSize: 11, marginTop: 10 }, children: "Focus purely on completing this single micro-step." })
          ] })
        ] }) : /* @__PURE__ */ o("p", { style: { color: t.muted, fontSize: 12 }, children: "No micro-steps yet — add one, or let the taskmaster agent draft the breakdown." }),
        /* @__PURE__ */ c("div", { style: { borderTop: `1px solid ${t.border}`, marginTop: 18, paddingTop: 12 }, children: [
          /* @__PURE__ */ c("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 8, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ c("span", { style: r.queueLabel, children: [
              "ALL SUBTASKS (",
              n.done,
              "/",
              n.total,
              " COMPLETED)"
            ] }),
            /* @__PURE__ */ c("span", { style: { display: "flex", gap: 6 }, children: [
              /* @__PURE__ */ o(
                "button",
                {
                  className: "tm-btn",
                  style: { ...r.btnGhost, ...p ? { color: t.kiro } : {} },
                  disabled: !!s,
                  onClick: () => Te(e),
                  children: p ? "⚙ AGENT DRAFTING…" : "✦ DRAFT STEPS WITH AI"
                }
              ),
              /* @__PURE__ */ o(
                "button",
                {
                  className: "tm-btn",
                  style: { ...r.btnGhost, ...g ? { color: t.kiro } : { color: t.focus, borderColor: "rgba(52,211,153,0.3)" } },
                  disabled: !!s || Y === 0,
                  onClick: () => je(e),
                  children: g ? "⚙ AGENT RUNNING STEPS…" : `▶ RUN REMAINING (${Y})`
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ o("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: e.subtasks.map((f, C) => {
            const L = C === F;
            return /* @__PURE__ */ c(
              "div",
              {
                style: { ...r.queueRow, ...L ? r.queueRowActive : {} },
                onClick: () => se(e.id, C),
                children: [
                  /* @__PURE__ */ c("span", { style: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 }, children: [
                    /* @__PURE__ */ o(
                      "button",
                      {
                        className: "tm-btn",
                        style: r.queueCheck,
                        "aria-label": f.done ? "Mark incomplete" : "Mark complete",
                        onClick: (U) => {
                          U.stopPropagation(), _(e.id, f.id, !f.done);
                        },
                        children: f.done ? /* @__PURE__ */ o("span", { style: { color: t.focus, fontWeight: 700 }, children: "✓" }) : /* @__PURE__ */ o("span", { style: { color: "#475569" }, children: "○" })
                      }
                    ),
                    /* @__PURE__ */ c("span", { style: { minWidth: 0 }, children: [
                      /* @__PURE__ */ o("span", { style: { fontSize: 12, ...f.done ? { textDecoration: "line-through", color: t.muted } : {} }, children: f.title }),
                      /* @__PURE__ */ c("span", { style: { display: "flex", gap: 6, marginTop: 2 }, children: [
                        f.runState === "failed" && !f.done && /* @__PURE__ */ o("span", { style: { ...r.execChip, ...r.failedChip }, children: "FAILED" }),
                        f.command && !f.done && /* @__PURE__ */ o("span", { style: r.execChip, children: "EXECUTABLE" }),
                        f.source === "agent" && /* @__PURE__ */ o("span", { style: { ...r.execChip, color: t.kiro, borderColor: "rgba(129,140,248,0.3)", background: "rgba(129,140,248,0.08)" }, children: "AGENT-DRAFTED" })
                      ] })
                    ] })
                  ] }),
                  L && /* @__PURE__ */ o("span", { style: r.activeChip, children: "ACTIVE" })
                ]
              },
              f.id
            );
          }) }),
          /* @__PURE__ */ c("div", { style: { ...r.addRow, marginTop: 10 }, children: [
            /* @__PURE__ */ o(
              "input",
              {
                style: { ...r.input, flex: 2 },
                placeholder: "Add micro-step…",
                value: fe,
                onChange: (f) => ge(f.target.value),
                onKeyDown: (f) => {
                  f.key === "Enter" && ie(e);
                }
              }
            ),
            /* @__PURE__ */ o(
              "input",
              {
                style: { ...r.input, flex: 3, fontFamily: N, fontSize: 11 },
                placeholder: "optional terminal command",
                value: he,
                onChange: (f) => be(f.target.value),
                onKeyDown: (f) => {
                  f.key === "Enter" && ie(e);
                }
              }
            ),
            /* @__PURE__ */ o("button", { className: "tm-btn", style: r.btnGhost, onClick: () => ie(e), children: "ADD" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ c("section", { className: "tm-card", style: { ...r.card, padding: 0, overflow: "hidden" }, children: [
        /* @__PURE__ */ c(
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
              /* @__PURE__ */ c("span", { style: { ...r.execChip, color: t.kiro, borderColor: "rgba(129,140,248,0.3)", background: "rgba(129,140,248,0.08)" }, children: [
                d,
                " · taskmaster"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ o("div", { style: { height: 380 }, children: /* @__PURE__ */ o(
          nt,
          {
            slotKey: d,
            agent: "taskmaster",
            frameless: !0,
            startAtBottom: !0,
            placeholder: "Message the taskmaster agent about this task…"
          }
        ) })
      ] })
    ] });
  }
  function Ve() {
    return /* @__PURE__ */ c(le, { children: [
      /* @__PURE__ */ c("section", { className: "tm-card", style: r.card, children: [
        /* @__PURE__ */ c("div", { style: { ...r.queueLabel, marginBottom: 10 }, children: [
          "ALL BACKLOGS (",
          Re,
          " TASKS)"
        ] }),
        Ee()
      ] }),
      x.tasks.map((e) => {
        const n = Ne(e), d = e.id === (S == null ? void 0 : S.id), s = (v == null ? void 0 : v.taskId) === e.id ? v : null, a = (s == null ? void 0 : s.kind) === "draft";
        return /* @__PURE__ */ c(
          "section",
          {
            className: "tm-card",
            style: { ...r.card, ...d ? { borderColor: "rgba(52,211,153,0.4)" } : {} },
            children: [
              /* @__PURE__ */ c("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }, children: [
                /* @__PURE__ */ o("span", { style: { fontWeight: 600, fontSize: 14, minWidth: 0 }, children: e.title }),
                /* @__PURE__ */ c("span", { style: { display: "flex", gap: 6, flexWrap: "wrap" }, children: [
                  e.estimateMinutes != null && /* @__PURE__ */ c("span", { style: { ...r.chip, color: "#38bdf8", borderColor: t.border, fontFamily: N }, children: [
                    "~",
                    e.estimateMinutes,
                    "m"
                  ] }),
                  /* @__PURE__ */ o("button", { className: "tm-btn", style: { ...r.btnGhost, color: t.focus, borderColor: "rgba(52,211,153,0.3)" }, onClick: () => Ue(e.id), children: "FOCUS" }),
                  /* @__PURE__ */ o(
                    "button",
                    {
                      className: "tm-btn",
                      style: { ...r.btnGhost, ...a ? { color: t.kiro } : {} },
                      disabled: !!s,
                      onClick: () => Te(e),
                      children: a ? "⚙ DRAFTING…" : "✦ DRAFT STEPS"
                    }
                  ),
                  /* @__PURE__ */ o("button", { className: "tm-btn", style: r.btnGhost, onClick: () => we(e), children: "💬 CHAT" }),
                  /* @__PURE__ */ o(
                    "button",
                    {
                      className: "tm-btn",
                      style: { ...r.btnGhost, ...Q === e.id ? { color: t.danger, borderColor: t.danger } : {} },
                      onClick: () => Q === e.id ? Ge(e.id) : Z(e.id),
                      onBlur: () => Z(null),
                      children: Q === e.id ? "SURE?" : "DELETE"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ o("div", { style: { ...r.progressTrack, marginTop: 12 }, children: /* @__PURE__ */ o("div", { style: { ...r.progressFill, width: `${n.pct}%` } }) }),
              /* @__PURE__ */ c("div", { style: { display: "flex", flexDirection: "column", gap: 4, marginTop: 10 }, children: [
                e.subtasks.length === 0 && /* @__PURE__ */ o("span", { style: { color: t.muted, fontSize: 11 }, children: "No micro-steps yet." }),
                e.subtasks.map((p) => {
                  const g = p.runState === "failed" && !p.done;
                  return /* @__PURE__ */ c("div", { style: r.backlogSubRow, children: [
                    /* @__PURE__ */ o("span", { style: { color: p.done ? t.focus : g ? t.danger : "#475569" }, children: p.done ? "✓" : g ? "✗" : "○" }),
                    /* @__PURE__ */ o("span", { style: { fontSize: 11, ...p.done ? { textDecoration: "line-through", color: t.muted } : {} }, children: p.title }),
                    g && /* @__PURE__ */ o("span", { style: { ...r.execChip, ...r.failedChip }, children: "FAILED" })
                  ] }, p.id);
                })
              ] })
            ]
          },
          e.id
        );
      })
    ] });
  }
  function _e() {
    return /* @__PURE__ */ c(le, { children: [
      /* @__PURE__ */ c("section", { className: "tm-card", style: r.card, children: [
        /* @__PURE__ */ c("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }, children: [
          /* @__PURE__ */ o("span", { style: r.queueLabel, children: "KIRO GATEWAY" }),
          /* @__PURE__ */ o(
            "button",
            {
              className: "tm-btn",
              style: r.btnGhost,
              onClick: () => {
                i.get("/api/status").then((e) => {
                  M(typeof e == "object" && e !== null ? e : {}), m("ok", "Gateway status refreshed.");
                }).catch((e) => m("warn", `Status refresh failed: ${String(e)}`));
              },
              children: "REFRESH"
            }
          )
        ] }),
        /* @__PURE__ */ c("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ o(J, { label: "STATUS", value: h ? "ONLINE" : "UNKNOWN", accent: h ? t.focus : t.warn }),
          /* @__PURE__ */ o(J, { label: "VERSION", value: String((h == null ? void 0 : h.version) ?? "—"), accent: t.kiro }),
          /* @__PURE__ */ o(J, { label: "UPTIME", value: String((h == null ? void 0 : h.uptime) ?? "—"), accent: t.text }),
          /* @__PURE__ */ o(J, { label: "PROVIDER", value: String((h == null ? void 0 : h.provider) ?? "—"), accent: t.text })
        ] })
      ] }),
      /* @__PURE__ */ c("section", { className: "tm-card", style: { ...r.card, fontFamily: N }, children: [
        /* @__PURE__ */ c("div", { style: { display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", borderBottom: `1px solid ${t.border}`, paddingBottom: 8, marginBottom: 10 }, children: [
          /* @__PURE__ */ o("span", { style: { color: t.muted, fontSize: 11 }, children: "Taskmaster activity + gateway console" }),
          /* @__PURE__ */ o("span", { style: { ...r.execChip, color: t.muted }, children: De })
        ] }),
        /* @__PURE__ */ c("div", { style: { display: "flex", flexDirection: "column", gap: 6, maxHeight: 380, overflowY: "auto" }, children: [
          B.length === 0 && /* @__PURE__ */ o("span", { style: { color: t.muted, fontSize: 11 }, children: "No events yet." }),
          B.map((e, n) => /* @__PURE__ */ c("div", { style: { display: "flex", gap: 10, alignItems: "flex-start" }, children: [
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
  return /* @__PURE__ */ c("div", { style: r.root, children: [
    /* @__PURE__ */ o("style", { children: yt }),
    /* @__PURE__ */ c("header", { style: r.header, children: [
      /* @__PURE__ */ c("span", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
        /* @__PURE__ */ o("span", { style: r.logoBox, "aria-hidden": "true", children: /* @__PURE__ */ o("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "#030712", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ o("path", { d: "M13 10V3L4 14h7v7l9-11h-7z" }) }) }),
        /* @__PURE__ */ c("span", { children: [
          /* @__PURE__ */ o("span", { style: r.brandTitle, children: "Taskmaster Pro" }),
          /* @__PURE__ */ o("span", { style: { ...r.chip, marginLeft: 8, color: t.kiro, borderColor: "rgba(129,140,248,0.3)", background: "rgba(129,140,248,0.08)" }, children: "EXECUTION ENGINE" }),
          /* @__PURE__ */ o("div", { style: { color: t.muted, fontSize: 10, marginTop: 2 }, children: "Task focus · agent-run commands · memory sync" })
        ] })
      ] }),
      qe()
    ] }),
    z && /* @__PURE__ */ o("div", { style: r.errorBanner, children: z }),
    X
  ] });
}
function J({ label: i, value: u, accent: l }) {
  return /* @__PURE__ */ c("div", { style: r.statBox, children: [
    /* @__PURE__ */ o("div", { style: { color: t.muted, fontSize: 9, letterSpacing: "0.1em", marginBottom: 4 }, children: i }),
    /* @__PURE__ */ o("div", { style: { color: l, fontSize: 13, fontWeight: 700, fontFamily: N, wordBreak: "break-all" }, children: u })
  ] });
}
const yt = `
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
  commandLabel: { fontSize: 9, letterSpacing: "0.14em", color: t.muted, fontFamily: N },
  commandCode: {
    display: "block",
    padding: 8,
    borderRadius: 8,
    border: `1px solid ${t.border}`,
    background: t.card,
    color: "#6ee7b7",
    fontSize: 11,
    fontFamily: N,
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
    fontFamily: N,
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
    fontFamily: N
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
  Tt as default
};
