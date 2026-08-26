import { jsx as r, jsxs as m, Fragment as he } from "react/jsx-runtime";
import { useState as w, useRef as O, useCallback as A, useEffect as be, useMemo as ft } from "react";
import { useAppApi as gt, useNotify as ht, useNavBadge as bt, useChatLauncher as yt, useAppEvents as kt, ChatEmbed as St } from "@kirocrew/app-sdk";
import { MarkdownRenderer as xt } from "@kirocrew/ui";
function re(s) {
  return `taskmaster-${s.id}`;
}
let Ue = 0;
function Y(s) {
  return Ue += 1, `${s}-${Date.now().toString(36)}-${Ue.toString(36)}`;
}
function Ct() {
  return { version: 1, settings: { memorySync: !0 }, activeTaskId: null, tasks: [] };
}
function vt(s) {
  var $;
  const d = Ct();
  if (typeof s != "object" || s === null) return d;
  const c = s, y = Array.isArray(c.tasks) ? c.tasks.filter(Qe).map(Tt) : d.tasks, k = typeof c.settings == "object" && c.settings !== null ? { memorySync: c.settings.memorySync !== !1 } : d.settings, E = typeof c.activeTaskId == "string" ? c.activeTaskId : null;
  return {
    version: 1,
    settings: k,
    activeTaskId: y.some((M) => M.id === E) ? E : (($ = y[0]) == null ? void 0 : $.id) ?? null,
    tasks: y
  };
}
function Qe(s) {
  return typeof s == "object" && s !== null && typeof s.title == "string";
}
function Tt(s) {
  const d = Array.isArray(s.subtasks) ? s.subtasks.filter(Qe).map((c) => ({
    id: typeof c.id == "string" ? c.id : Y("sub"),
    title: String(c.title),
    done: c.done === !0,
    ...typeof c.command == "string" && c.command.trim() ? { command: c.command } : {},
    ...typeof c.output == "string" && c.output ? { output: c.output } : {},
    ...c.runState === "done" || c.runState === "failed" ? { runState: c.runState } : {},
    ...c.source === "agent" || c.source === "manual" ? { source: c.source } : {}
  })) : [];
  return {
    id: typeof s.id == "string" ? s.id : Y("task"),
    title: String(s.title),
    ...typeof s.estimateMinutes == "number" && s.estimateMinutes > 0 ? { estimateMinutes: Math.round(s.estimateMinutes) } : {},
    createdAt: typeof s.createdAt == "string" ? s.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
    subtasks: d,
    ...s.lessonPosted === !0 ? { lessonPosted: !0 } : {},
    ...s.slotStarted === !0 ? { slotStarted: !0 } : {}
  };
}
function Ke(s) {
  const d = s.subtasks.length, c = s.subtasks.filter((y) => y.done).length;
  return { done: c, total: d, pct: d === 0 ? 0 : Math.round(c / d * 100) };
}
function wt(s) {
  const d = s.subtasks.findIndex((c) => !c.done);
  return d === -1 ? Math.max(0, s.subtasks.length - 1) : d;
}
function It(s, d, c) {
  const y = d + c;
  if (d < 0 || d >= s.length || y < 0 || y >= s.length)
    return [...s];
  const k = [...s], E = k[d];
  return k[d] = k[y], k[y] = E, k;
}
function Et(s, d) {
  return d < s ? s - 1 : s;
}
function Rt(s) {
  const d = /```(?:json)?\s*([\s\S]*?)```/.exec(s), c = [];
  d != null && d[1] && c.push(d[1]);
  const y = s.indexOf("["), k = s.lastIndexOf("]");
  y !== -1 && k > y && c.push(s.slice(y, k + 1));
  for (const E of c)
    try {
      const $ = JSON.parse(E);
      if (!Array.isArray($)) continue;
      const M = $.filter((C) => typeof C == "object" && C !== null).map((C) => ({
        title: typeof C.title == "string" ? C.title.trim() : "",
        ...typeof C.command == "string" && C.command.trim() ? { command: C.command.trim() } : {}
      })).filter((C) => C.title.length > 0).slice(0, 12);
      if (M.length > 0) return M;
    } catch {
    }
  return null;
}
function $t(s) {
  const d = s.subtasks.map((c, y) => `${y + 1}. ${c.title}${c.command ? ` [${c.command}]` : ""}`);
  return `Completed "${s.title}" via micro-steps: ${d.join(" ")}`;
}
const Nt = 900 * 1e3;
function At(s, d, c = Nt) {
  return d - s.sentAt > c;
}
function Mt(s) {
  if (typeof s == "object" && s !== null) {
    const c = s;
    if (c.status === 404 || c.statusCode === 404 || typeof c.response == "object" && c.response !== null && c.response.status === 404)
      return !0;
  }
  const d = s instanceof Error ? s.message : String(s);
  return /(?:^|\D)404(?:\D|$)|slot not found/i.test(d);
}
function qe(s, d) {
  return s !== void 0 ? s : d.status === "loaded" ? d.messageCount : d.status === "missing" ? 0 : null;
}
function He(s, d) {
  return Math.max(s ?? 0, Math.max(0, d));
}
function Ve(s, d, c = !1) {
  return !c && s === d;
}
function Lt(s) {
  if (typeof s != "object" || s === null) return { messages: [], running: !1 };
  const d = s;
  return { messages: Array.isArray(d.messages) ? d.messages.filter((y) => typeof y == "object" && y !== null) : [], running: d.running === !0 };
}
const _e = /^\s*STEP RESULT \[(\d+)\]:\s*(done|failed)\s*(?:[—–:-]\s*)?(.*)$/gim;
function Dt(s) {
  const d = [];
  _e.lastIndex = 0;
  let c;
  for (; (c = _e.exec(s)) !== null; )
    d.push({
      index: Number.parseInt(c[1], 10),
      ok: c[2].toLowerCase() === "done",
      summary: c[3].trim()
    });
  return d;
}
const Ye = 4e3;
function Bt(s) {
  const { work: d, data: c, seen: y, stepCount: k } = s, E = c.running ? Math.max(0, c.messages.length - 1) : c.messages.length, $ = c.messages.slice(y, E), M = Math.max(y, E);
  if (k === null)
    return { actions: [], nextSeen: M, sawReply: s.sawReply, settled: !0, stepSucceeded: !1 };
  const C = [];
  let P = s.sawReply, F = !1, _ = !1;
  for (const S of $) {
    if (S.role === "user" || !S.content) continue;
    P = !0;
    const W = S.content;
    if (d.kind === "draft") {
      const R = Rt(W);
      R && (C.push({ type: "append-draft", steps: R }), F = !0);
      continue;
    }
    const j = Dt(W);
    for (const R of j) {
      if (R.index < 1 || R.index > k) {
        C.push({ type: "unknown-step", result: R });
        continue;
      }
      const X = j.length === 1 ? W.slice(0, Ye) : `${R.ok ? "done" : "failed"} — ${R.summary || "(no summary)"}`;
      C.push({ type: "step-result", result: R, output: X }), R.ok && (_ = !0), d.kind === "step" && (F = !0);
    }
  }
  if (F && d.kind !== "all")
    return { actions: C, nextSeen: M, sawReply: P, settled: !0, stepSucceeded: _ };
  if (!c.running && P) {
    const S = [...$].reverse().find((W) => W.role !== "user" && W.content);
    C.push({
      type: "turn-ended",
      kind: d.kind,
      ...d.kind === "step" && (S != null && S.content) ? { output: S.content.slice(0, Ye) } : {}
    }), F = !0;
  }
  return { actions: C, nextSeen: M, sawReply: P, settled: F, stepSucceeded: _ };
}
const Xe = "/api/apps/taskmaster-pro/config", zt = 200, Je = "notification scope · slot polling", Wt = 2500, n = {
  bg: "var(--bg, #030712)",
  card: "var(--card, #0b1329)",
  border: "var(--border, #1e293b)",
  text: "var(--text, #f1f5f9)",
  muted: "var(--muted, #94a3b8)",
  focus: "#34d399",
  kiro: "#818cf8",
  warn: "var(--warn, #d29922)",
  danger: "var(--danger, #e5534b)"
}, D = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
function Ot() {
  return (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0];
}
function qt() {
  const s = gt(), d = ht(), c = bt(), { openChat: y } = yt(), [k, E] = w(null), [$, M] = w("focus"), [C, P] = w({}), [F, _] = w([]), [S, W] = w(null), [j, R] = w(null), [X, ye] = w(""), [ke, Se] = w(""), [xe, Ce] = w(""), [ve, Te] = w(""), [G, U] = w(null), [we, V] = w(null), [ie, Ie] = w(""), [Ee, Re] = w(""), [se, $e] = w({}), K = O(null);
  K.current = k;
  const Ne = O(Promise.resolve()), Ae = O(0), ae = O({}), N = O({}), L = O({}), B = O({}), J = O(/* @__PURE__ */ new Set()), le = O({}), Ze = A((e) => {
    L.current[e.taskId] = e, $e((t) => ({ ...t, [e.taskId]: e }));
  }, []), Q = A((e) => L.current[e.taskId] !== e ? !1 : (delete L.current[e.taskId], $e((t) => {
    const l = { ...t };
    return delete l[e.taskId], l;
  }), !0), []), g = A((e, t) => {
    _((l) => [{ ts: Ot(), level: e, msg: t }, ...l].slice(0, zt));
  }, []), Me = A(
    (e) => {
      E(e), K.current = e;
      const t = ++Ae.current;
      Ne.current = Ne.current.then(async () => {
        if (t === Ae.current)
          try {
            await s.put(Xe, e);
          } catch (l) {
            g("warn", `Config save failed: ${String(l)}`);
          }
      });
    },
    [s, g]
  ), v = A(
    (e) => {
      const t = K.current;
      t && Me(e(t));
    },
    [Me]
  ), de = A(
    (e) => {
      s.get(Xe).then((t) => {
        e != null && e() || (E(vt(t)), R(null), g("info", "Loaded task state from gateway app config."));
      }).catch((t) => {
        e != null && e() || (E(null), R(`Config load failed (${String(t)}) — retry to continue.`), g("warn", `Config load failed: ${String(t)}`));
      });
    },
    [s, g]
  );
  be(() => {
    let e = !1;
    return de(() => e), s.get("/api/status").then((t) => {
      e || (W(typeof t == "object" && t !== null ? t : {}), g("ok", "Connected to Kiro Crew gateway."));
    }).catch(() => {
      e || g("warn", "Gateway status unavailable.");
    }), g("info", `Console mode: ${Je} — gateway event forwarding to app pages is pending upstream.`), () => {
      e = !0;
    };
  }, [de]);
  const Le = A(
    (e) => {
      d(`Task complete: ${e.title}`), g("ok", `Task "${e.title}" fully completed.`);
      const t = K.current;
      !(t != null && t.settings.memorySync) || e.lessonPosted || ae.current[e.id] || (ae.current[e.id] = !0, s.post("/api/lessons", { rule: $t(e), category: "knowledge" }).then(() => {
        v((l) => ({
          ...l,
          tasks: l.tasks.map((i) => i.id === e.id ? { ...i, lessonPosted: !0 } : i)
        })), g("ok", "Kiro Memory: appended solution path to lessons (category: knowledge).");
      }).catch((l) => g("warn", `Memory sync failed: ${String(l)}`)).finally(() => {
        delete ae.current[e.id];
      }));
    },
    [s, d, g, v]
  ), Z = A(
    (e, t, l, i, a) => {
      let u = null;
      v((f) => {
        const p = f.tasks.map((h) => {
          if (h.id !== e) return h;
          const I = h.subtasks.map((H) => {
            if (H.id !== t) return H;
            const ge = { ...H, done: l, ...i !== void 0 ? { output: i } : {} };
            return a ? ge.runState = a : delete ge.runState, ge;
          }), z = { ...h, subtasks: I }, b = h.subtasks.length > 0 && h.subtasks.every((H) => H.done);
          return I.length > 0 && I.every((H) => H.done) && !b && (u = z), z;
        });
        return { ...f, tasks: p };
      }), u && Le(u);
    },
    [v, Le]
  );
  kt("notification", (e) => {
    const t = typeof e == "object" && e !== null ? e : {}, l = typeof t.title == "string" ? t.title : "notification", i = typeof t.text == "string" ? t.text : "";
    g("info", `Gateway notification [${l}]: ${i.slice(0, 200)}`);
  });
  const De = A(
    (e, t) => {
      v((l) => ({
        ...l,
        tasks: l.tasks.map((i) => {
          if (i.id !== e) return i;
          const a = new Set(i.subtasks.map((f) => f.title.toLowerCase())), u = t.filter((f) => !a.has(f.title.toLowerCase())).map((f) => ({ id: Y("sub"), title: f.title, done: !1, source: "agent", ...f.command ? { command: f.command } : {} }));
          return { ...i, subtasks: [...i.subtasks, ...u] };
        })
      })), g("ok", `Taskmaster agent drafted ${t.length} micro-step(s).`), d(`Added ${t.length} drafted micro-steps`);
    },
    [g, v, d]
  ), ce = A(
    async (e) => Lt(await s.get(`/api/chat/slots/${encodeURIComponent(e)}`)),
    [s]
  ), ue = A(
    (e, t, l, i) => {
      v((a) => ({
        ...a,
        tasks: a.tasks.map(
          (u) => u.id === e ? {
            ...u,
            subtasks: u.subtasks.map(
              (f) => f.id === t ? { ...f, output: l, ...i ? { runState: i } : {} } : f
            )
          } : u
        )
      }));
    },
    [v]
  );
  async function pe(e, t, l) {
    if (L.current[e.id] || N.current[e.id]) return;
    N.current[e.id] = !0;
    const i = re(e), a = J.current.has(i);
    if (B.current[i] === void 0 || a)
      try {
        const f = await ce(i);
        if (a && f.running) {
          N.current[e.id] = !1, g("info", "The stopped agent turn is still running in chat; request was not sent."), d("The previous agent turn is still finishing — retry after it ends");
          return;
        }
        const p = f.messages.length, h = a ? He(B.current[i], p) : qe(B.current[i], {
          status: "loaded",
          messageCount: p
        });
        if (h === null) {
          N.current[e.id] = !1;
          return;
        }
        B.current[i] = h, J.current.delete(i);
      } catch (f) {
        const p = Mt(f);
        if (a && !p) {
          N.current[e.id] = !1, g("info", `Could not verify that the stopped agent turn ended: ${String(f)}`), d("Could not verify the previous agent turn — retry after it ends", { type: "error" });
          return;
        }
        const h = qe(
          B.current[i],
          p ? { status: "missing" } : { status: "failed" }
        );
        if (h === null) {
          N.current[e.id] = !1, g("warn", `Could not safely read task chat history; request was not sent: ${String(f)}`), d("Could not verify task chat history — retry the run", { type: "error" });
          return;
        }
        B.current[i] = h, J.current.delete(i);
      }
    le.current[e.id] = !1;
    const u = { ...l, sentAt: Date.now() };
    N.current[e.id] = !1, Ze(u), e.slotStarted || v((f) => ({
      ...f,
      tasks: f.tasks.map((p) => p.id === e.id ? { ...p, slotStarted: !0 } : p)
    })), s.post("/api/chat", { message: t, slot: i, agent: "taskmaster" }).catch((f) => {
      f instanceof SyntaxError || (g("err", `Send to task slot failed: ${String(f)}`), d("Could not reach the gateway", { type: "error" }), Q(u));
    }), g("info", `Sent to task slot ${i}: ${t.split(`
`)[0].slice(0, 120)}`);
  }
  async function et(e) {
    const t = L.current[e.id];
    if (!t || t.taskId !== e.id || !Q(t)) return;
    const l = re(e);
    J.current.add(l), N.current[e.id] = !0, g("warn", "Stopped waiting for the agent; its turn may continue in the task chat."), d("Stopped waiting — the agent may continue in the task chat");
    try {
      const i = await ce(l);
      B.current[l] = He(B.current[l], i.messages.length);
    } catch {
    } finally {
      N.current[e.id] = !1;
    }
  }
  const tt = A(
    (e, t) => {
      var l, i;
      for (const a of t) {
        if (a.type === "append-draft") {
          De(e.taskId, a.steps);
          continue;
        }
        if (a.type === "unknown-step") {
          g("warn", `Agent reported STEP RESULT [${a.result.index}] but the task has no such step.`);
          continue;
        }
        if (a.type === "step-result") {
          const u = (l = K.current) == null ? void 0 : l.tasks.find((p) => p.id === e.taskId), f = u == null ? void 0 : u.subtasks[a.result.index - 1];
          if (!f) continue;
          a.result.ok ? (Z(e.taskId, f.id, !0, a.output, "done"), g("ok", `Step ${a.result.index} completed by agent: ${a.result.summary || f.title}`)) : (ue(e.taskId, f.id, a.output, "failed"), g("warn", `Step ${a.result.index} failed: ${a.result.summary || "(no summary)"}`));
          continue;
        }
        if (a.kind === "all")
          g("ok", "Agent finished the run — see per-step results above and the task chat.");
        else if (a.kind === "draft")
          g("warn", "Draft reply had no parseable json block — see the task chat."), d("Agent reply was not parseable — see the task chat");
        else {
          const u = (i = K.current) == null ? void 0 : i.tasks.find((p) => p.id === e.taskId), f = e.stepIndex != null ? u == null ? void 0 : u.subtasks[e.stepIndex] : void 0;
          f && a.output && ue(e.taskId, f.id, a.output), g("warn", "Agent reply had no STEP RESULT marker — step left for manual toggle.");
        }
      }
    },
    [g, De, d, ue, Z]
  ), Be = Object.keys(se).length > 0;
  be(() => {
    if (!Be) return;
    let e = !1;
    const t = async () => {
      const i = Object.values(L.current);
      i.length !== 0 && await Promise.all(
        i.map(async (a) => {
          var z;
          if (e) return;
          const u = re({ id: a.taskId });
          if (!Ve(L.current[a.taskId] ?? null, a, e)) return;
          if (At(a, Date.now())) {
            g("warn", "Agent request timed out — check the task chat."), Q(a);
            return;
          }
          let f;
          try {
            f = await ce(u);
          } catch {
            return;
          }
          if (!Ve(L.current[a.taskId] ?? null, a, e)) return;
          const p = B.current[u] ?? 0, h = (z = K.current) == null ? void 0 : z.tasks.find((b) => b.id === a.taskId), I = Bt({
            work: a,
            data: f,
            seen: p,
            sawReply: le.current[a.taskId] ?? !1,
            stepCount: (h == null ? void 0 : h.subtasks.length) ?? null
          });
          B.current[u] = I.nextSeen, le.current[a.taskId] = I.sawReply, tt(a, I.actions), I.settled && (a.kind === "step" && I.stepSucceeded && d("Step completed via taskmaster agent", { type: "success" }), Q(a));
        })
      );
    }, l = setInterval(() => void t(), Wt);
    return t(), () => {
      e = !0, clearInterval(l);
    };
  }, [Be]);
  function nt(e, t, l) {
    !t.command || L.current[e.id] || N.current[e.id] || (g("info", `Kiro terminal execute (step ${l + 1}): ${t.command}`), pe(
      e,
      `Run micro-step [${l + 1}] of task "${e.title}": ${t.title}
Execute this terminal command and report concise output:
${t.command}
End your reply with exactly one line: STEP RESULT [${l + 1}]: done|failed — <short summary>`,
      { taskId: e.id, kind: "step", stepIndex: l }
    ));
  }
  function ze(e) {
    if (L.current[e.id] || N.current[e.id]) return;
    const t = e.subtasks.map((l) => l.title).join("; ") || "none";
    g("info", `Requesting micro-step breakdown for "${e.title}".`), d("Taskmaster agent is drafting micro-steps…"), pe(
      e,
      `Break the task "${e.title}"${e.estimateMinutes ? ` (~${e.estimateMinutes}m)` : ""} into micro-steps per the taskmaster-method skill. Reply with ONE fenced json code block containing an array of {"title", "command"?} objects and no prose outside it.
Existing steps (do not duplicate): ${t}`,
      { taskId: e.id, kind: "draft" }
    );
  }
  function rt(e) {
    if (L.current[e.id] || N.current[e.id]) return;
    const t = e.subtasks.map((i, a) => ({ sub: i, index: a })).filter(({ sub: i }) => !i.done);
    if (t.length === 0) return;
    const l = t.map(({ sub: i, index: a }) => `[${a + 1}] ${i.title}${i.command ? ` — command: ${i.command}` : ""}`).join(`
`);
    g("info", `Running ${t.length} remaining step(s) unattended via taskmaster agent.`), d(`Agent is running ${t.length} remaining step(s)…`), pe(
      e,
      `Execute the remaining micro-steps of task "${e.title}" in order, autonomously:
${l}
After finishing each step output one line: STEP RESULT [n]: done|failed — <short summary>. If a step cannot be completed autonomously, mark it failed with the reason and continue to the next.`,
      { taskId: e.id, kind: "all" }
    );
  }
  function We(e) {
    const t = e.subtasks.filter((l) => !l.done).map((l) => l.title);
    y({
      agent: "taskmaster",
      message: `Check in on task "${e.title}". Remaining micro-steps: ${t.join("; ") || "none"}. Help me with the next one.`
    });
  }
  async function ot(e) {
    try {
      await s.post("/api/crons", {
        name: `taskmaster-${e.id}`,
        cron: "0 9 * * 1-5",
        agent: "taskmaster",
        message: `Taskmaster routine check-in on task "${e.title}". Review current progress and report the single next micro-step.`
      }), g("ok", `Cron registered: weekday 09:00 routine check-in on "${e.title}".`), d("Routine scheduled — weekdays 09:00");
    } catch (t) {
      g("err", `Cron registration failed: ${String(t)}`), d("Could not register the cron");
    }
  }
  function Oe() {
    const e = X.trim();
    if (!e) return;
    const t = Number.parseInt(ke, 10), l = {
      id: Y("task"),
      title: e,
      ...Number.isFinite(t) && t > 0 ? { estimateMinutes: t } : {},
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      subtasks: []
    };
    v((i) => ({ ...i, tasks: [...i.tasks, l], activeTaskId: i.activeTaskId ?? l.id })), ye(""), Se(""), g("info", `Task added to backlog: "${e}"`);
  }
  function me(e) {
    const t = xe.trim();
    if (!t) return;
    const l = ve.trim(), i = { id: Y("sub"), title: t, done: !1, source: "manual", ...l ? { command: l } : {} };
    v((a) => ({
      ...a,
      tasks: a.tasks.map((u) => u.id === e.id ? { ...u, subtasks: [...u.subtasks, i] } : u)
    })), Ce(""), Te("");
  }
  function it(e) {
    V(e.id), Ie(e.title), Re(e.command ?? ""), U(null);
  }
  function fe(e, t) {
    const l = ie.trim();
    if (!l) return;
    const i = Ee.trim();
    v((a) => ({
      ...a,
      tasks: a.tasks.map(
        (u) => u.id === e.id ? {
          ...u,
          subtasks: u.subtasks.map((f) => {
            if (f.id !== t) return f;
            const p = { ...f, title: l };
            return i ? p.command = i : delete p.command, p;
          })
        } : u
      )
    })), V(null);
  }
  function st(e, t) {
    const l = e.subtasks[t];
    l && (P(
      (i) => i[e.id] === void 0 ? i : { ...i, [e.id]: Et(i[e.id], t) }
    ), v((i) => ({
      ...i,
      tasks: i.tasks.map(
        (a) => a.id === e.id ? { ...a, subtasks: a.subtasks.filter((u) => u.id !== l.id) } : a
      )
    })), U(null), we === l.id && V(null), g("info", `Micro-step removed: "${l.title}"`));
  }
  function Pe(e, t, l) {
    const i = t + l;
    i < 0 || i >= e.subtasks.length || (v((a) => ({
      ...a,
      tasks: a.tasks.map(
        (u) => u.id === e.id ? { ...u, subtasks: It(u.subtasks, t, l) } : u
      )
    })), P((a) => {
      const u = a[e.id];
      return u === t ? { ...a, [e.id]: i } : u === i ? { ...a, [e.id]: t } : a;
    }));
  }
  function at(e) {
    v((t) => {
      var i;
      const l = t.tasks.filter((a) => a.id !== e);
      return { ...t, tasks: l, activeTaskId: t.activeTaskId === e ? ((i = l[0]) == null ? void 0 : i.id) ?? null : t.activeTaskId };
    }), U(null), g("info", "Task removed from backlog.");
  }
  function lt(e) {
    v((t) => ({ ...t, activeTaskId: e })), M("focus");
  }
  const T = ft(() => k ? k.tasks.find((e) => e.id === k.activeTaskId) ?? k.tasks[0] ?? null : null, [k]), q = T ? Math.max(
    0,
    Math.min(C[T.id] ?? wt(T), Math.max(0, T.subtasks.length - 1))
  ) : 0, x = (T == null ? void 0 : T.subtasks[q]) ?? null, dt = T ? Ke(T) : null, ee = T ? T.subtasks.filter((e) => !e.done).length : 0;
  be(() => {
    try {
      c(ee);
    } catch {
    }
  }, [ee, c]);
  function te(e, t) {
    P((l) => ({ ...l, [e]: t }));
  }
  if (!k)
    return /* @__PURE__ */ r("div", { style: { ...o.root, alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ m("div", { style: { display: "grid", gap: 10, justifyItems: "center" }, children: [
      /* @__PURE__ */ r("span", { style: { color: n.muted, fontSize: 13 }, children: j ?? "Loading Taskmaster Pro…" }),
      j ? /* @__PURE__ */ r("button", { className: "tm-btn", style: o.primaryBtn, onClick: () => de(), children: "Retry load" }) : null
    ] }) });
  const Fe = k.tasks.length, je = k.settings.memorySync;
  let ne;
  switch ($) {
    case "focus":
      ne = ut();
      break;
    case "backlog":
      ne = pt();
      break;
    case "console":
      ne = mt();
      break;
    default: {
      const e = $;
      throw new Error(`Unhandled view: ${String(e)}`);
    }
  }
  function ct() {
    const e = [
      { id: "focus", label: "★ Focus" },
      { id: "backlog", label: `Backlog (${Fe})` },
      { id: "console", label: "Console" }
    ];
    return /* @__PURE__ */ r("div", { style: o.tabRow, children: e.map((t) => /* @__PURE__ */ r(
      "button",
      {
        className: "tm-btn",
        style: { ...o.tab, ...$ === t.id ? o.tabActive : {} },
        onClick: () => M(t.id),
        children: t.label
      },
      t.id
    )) });
  }
  function Ge() {
    return /* @__PURE__ */ m("div", { style: o.addRow, children: [
      /* @__PURE__ */ r(
        "input",
        {
          style: { ...o.input, flex: 1 },
          placeholder: "New task title…",
          value: X,
          onChange: (e) => ye(e.target.value),
          onKeyDown: (e) => {
            e.key === "Enter" && Oe();
          }
        }
      ),
      /* @__PURE__ */ r(
        "input",
        {
          style: { ...o.input, width: 74 },
          placeholder: "~min",
          inputMode: "numeric",
          value: ke,
          onChange: (e) => Se(e.target.value)
        }
      ),
      /* @__PURE__ */ r("button", { className: "tm-btn", style: o.btnPrimary, onClick: Oe, children: "ADD TASK" })
    ] });
  }
  function ut() {
    if (!T)
      return /* @__PURE__ */ m("section", { className: "tm-card", style: { ...o.card, textAlign: "center" }, children: [
        /* @__PURE__ */ r("div", { style: { fontSize: 28, marginBottom: 8 }, children: "⚡" }),
        /* @__PURE__ */ r("div", { style: { fontSize: 15, fontWeight: 700 }, children: "No task in focus" }),
        /* @__PURE__ */ r("p", { style: { color: n.muted, fontSize: 12, margin: "6px 0 14px" }, children: "Add your first task — the taskmaster agent can draft its micro-steps." }),
        Ge()
      ] });
    const e = T, t = dt ?? { done: 0, total: 0, pct: 0 }, l = re(e), i = se[e.id] ?? null, a = !!(x && (i == null ? void 0 : i.kind) === "step" && i.stepIndex === q), u = (i == null ? void 0 : i.kind) === "draft", f = (i == null ? void 0 : i.kind) === "all";
    return /* @__PURE__ */ m(he, { children: [
      /* @__PURE__ */ m("section", { className: "tm-card", style: { ...o.card, paddingTop: 20, position: "relative", overflow: "hidden" }, children: [
        /* @__PURE__ */ r("div", { style: o.gradientStrip }),
        /* @__PURE__ */ m("div", { style: o.centerCol, children: [
          /* @__PURE__ */ m("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }, children: [
            /* @__PURE__ */ r("span", { style: { ...o.chip, color: n.focus, borderColor: "rgba(52,211,153,0.35)", background: "rgba(52,211,153,0.08)" }, children: "★ TASKMASTER ACTIVE" }),
            /* @__PURE__ */ m(
              "button",
              {
                className: "tm-btn",
                style: {
                  ...o.chip,
                  cursor: "pointer",
                  ...je ? { color: n.kiro, borderColor: "rgba(129,140,248,0.35)", background: "rgba(129,140,248,0.08)" } : { color: n.muted, borderColor: n.border, background: "transparent" }
                },
                title: "One lesson is stored per completed task when ON",
                onClick: () => v((p) => ({ ...p, settings: { memorySync: !p.settings.memorySync } })),
                children: [
                  "🧠 MEMORY SYNC: ",
                  je ? "ON" : "OFF"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ r("p", { style: { color: n.muted, fontSize: 11, fontStyle: "italic", margin: "10px 0 6px" }, children: "Isolation mode active. Execute one step at a time." }),
          /* @__PURE__ */ r("h2", { style: o.taskTitle, children: e.title }),
          /* @__PURE__ */ m("div", { style: { display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", justifyContent: "center" }, children: [
            e.estimateMinutes != null && /* @__PURE__ */ m("span", { style: { ...o.chip, color: "#38bdf8", borderColor: n.border, fontFamily: D }, children: [
              "~",
              e.estimateMinutes,
              "m"
            ] }),
            /* @__PURE__ */ r("button", { className: "tm-btn", style: { ...o.chip, cursor: "pointer", color: n.text, borderColor: n.border }, onClick: () => void ot(e), children: "⏰ SCHEDULE ROUTINE (CRON)" }),
            /* @__PURE__ */ r("button", { className: "tm-btn", style: { ...o.chip, cursor: "pointer", color: n.text, borderColor: n.border }, onClick: () => We(e), children: "💬 OPEN IN CHAT" })
          ] })
        ] }),
        /* @__PURE__ */ r("div", { style: o.progressTrack, role: "progressbar", "aria-valuenow": t.pct, "aria-valuemin": 0, "aria-valuemax": 100, children: /* @__PURE__ */ r("div", { style: { ...o.progressFill, width: `${t.pct}%` } }) }),
        /* @__PURE__ */ m("div", { style: { textAlign: "right", color: n.muted, fontSize: 11, marginTop: 6, fontFamily: D }, children: [
          t.done,
          "/",
          t.total,
          " · ",
          t.pct,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ m("section", { className: "tm-card", style: { ...o.card, borderColor: "rgba(52,211,153,0.3)" }, children: [
        /* @__PURE__ */ m("div", { style: o.stepHeader, children: [
          /* @__PURE__ */ m("span", { style: { ...o.stepCounter, color: n.focus }, children: [
            /* @__PURE__ */ r("span", { className: "tm-pulse", style: o.pulseDot }),
            e.subtasks.length === 0 ? "NO MICRO-STEPS YET" : `ACTIVE MICRO-STEP ${q + 1} OF ${e.subtasks.length}`
          ] }),
          /* @__PURE__ */ m("span", { style: { display: "flex", gap: 6, alignItems: "center" }, children: [
            i && /* @__PURE__ */ r(
              "button",
              {
                className: "tm-btn",
                style: { ...o.btnGhost, color: n.danger, borderColor: "rgba(229,83,75,0.45)" },
                title: "Stops Taskmaster waiting; the underlying agent turn may continue in the task chat.",
                "aria-label": "Stop waiting for the agent run",
                onClick: () => void et(e),
                children: "STOP WAITING"
              }
            ),
            /* @__PURE__ */ r("button", { className: "tm-btn", style: o.navBtn, onClick: () => te(e.id, Math.max(0, q - 1)), children: "◄" }),
            /* @__PURE__ */ r(
              "button",
              {
                className: "tm-btn",
                style: o.navBtn,
                onClick: () => te(e.id, Math.min(e.subtasks.length - 1, q + 1)),
                children: "►"
              }
            )
          ] })
        ] }),
        x ? /* @__PURE__ */ m("div", { style: { display: "flex", gap: 14, alignItems: "flex-start" }, children: [
          /* @__PURE__ */ r(
            "button",
            {
              className: "tm-btn",
              style: o.checkBtn,
              "aria-label": x.done ? "Mark step incomplete" : "Mark step complete",
              onClick: () => Z(e.id, x.id, !x.done),
              children: x.done ? /* @__PURE__ */ r("span", { style: { ...o.checkCircle, background: "rgba(52,211,153,0.18)", borderColor: "rgba(52,211,153,0.5)", color: n.focus }, children: "✓" }) : /* @__PURE__ */ r("span", { style: { ...o.checkCircle, borderColor: "#475569", color: "transparent" }, children: "✓" })
            }
          ),
          /* @__PURE__ */ m("div", { style: { flex: 1, minWidth: 0 }, children: [
            /* @__PURE__ */ r(
              "h3",
              {
                style: {
                  margin: "2px 0 10px",
                  fontSize: 16,
                  fontWeight: 600,
                  ...x.done ? { textDecoration: "line-through", color: n.muted } : {}
                },
                children: x.title
              }
            ),
            x.command && /* @__PURE__ */ m("div", { style: o.commandBox, children: [
              /* @__PURE__ */ m("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
                /* @__PURE__ */ r("span", { style: o.commandLabel, children: "KIRO TERMINAL EXECUTABLE" }),
                /* @__PURE__ */ m("span", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
                  x.runState === "failed" && !a && /* @__PURE__ */ r("span", { style: { ...o.execChip, ...o.failedChip }, children: "LAST RUN FAILED" }),
                  /* @__PURE__ */ r("span", { style: { ...o.commandLabel, color: n.kiro }, children: "VIA TASKMASTER AGENT" })
                ] })
              ] }),
              /* @__PURE__ */ r("code", { style: o.commandCode, children: x.command }),
              /* @__PURE__ */ r("div", { children: /* @__PURE__ */ r(
                "button",
                {
                  className: "tm-btn",
                  style: {
                    ...o.btnPrimary,
                    ...x.done ? { opacity: 0.5, cursor: "default" } : {},
                    ...a ? { background: "rgba(129,140,248,0.25)", color: n.kiro } : {}
                  },
                  disabled: x.done || !!i,
                  onClick: () => nt(e, x, q),
                  children: a ? "⚙ EXECUTING VIA AGENT…" : x.done ? "✓ COMPLETED" : x.runState === "failed" ? "↻ RETRY VIA AGENT" : "▶ RUN COMMAND NATIVELY"
                }
              ) }),
              (a || x.output) && /* @__PURE__ */ r(
                "div",
                {
                  style: {
                    ...o.outputPre,
                    // Always longhand: toggling borderColor against the
                    // shorthand `border` triggers a React style warning.
                    borderColor: x.runState === "failed" && !a ? "rgba(229,83,75,0.45)" : n.border
                  },
                  children: a ? `$ ${x.command}
… taskmaster agent is executing — the reply lands here and in the task chat below` : /* @__PURE__ */ r(xt, { content: x.output ?? "" })
                }
              )
            ] }),
            /* @__PURE__ */ r("p", { style: { color: n.muted, fontSize: 11, marginTop: 10 }, children: "Focus purely on completing this single micro-step." })
          ] })
        ] }) : /* @__PURE__ */ r("p", { style: { color: n.muted, fontSize: 12 }, children: "No micro-steps yet — add one, or let the taskmaster agent draft the breakdown." }),
        /* @__PURE__ */ m("div", { style: { borderTop: `1px solid ${n.border}`, marginTop: 18, paddingTop: 12 }, children: [
          /* @__PURE__ */ m("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 8, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ m("span", { style: o.queueLabel, children: [
              "ALL SUBTASKS (",
              t.done,
              "/",
              t.total,
              " COMPLETED)"
            ] }),
            /* @__PURE__ */ m("span", { style: { display: "flex", gap: 6 }, children: [
              /* @__PURE__ */ r(
                "button",
                {
                  className: "tm-btn",
                  style: { ...o.btnGhost, ...u ? { color: n.kiro } : {} },
                  disabled: !!i,
                  onClick: () => ze(e),
                  children: u ? "⚙ AGENT DRAFTING…" : "✦ DRAFT STEPS WITH AI"
                }
              ),
              /* @__PURE__ */ r(
                "button",
                {
                  className: "tm-btn",
                  style: { ...o.btnGhost, ...f ? { color: n.kiro } : { color: n.focus, borderColor: "rgba(52,211,153,0.3)" } },
                  disabled: !!i || ee === 0,
                  onClick: () => rt(e),
                  children: f ? "⚙ AGENT RUNNING STEPS…" : `▶ RUN REMAINING (${ee})`
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ r("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: e.subtasks.map((p, h) => {
            const I = h === q, z = !!i;
            return we === p.id ? /* @__PURE__ */ r("div", { style: { ...o.queueRow, ...I ? o.queueRowActive : {}, cursor: "default" }, children: /* @__PURE__ */ m("span", { style: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", flex: 1, minWidth: 0 }, children: [
              /* @__PURE__ */ r(
                "input",
                {
                  style: { ...o.input, flex: 2, minWidth: 140 },
                  "aria-label": "Step title",
                  value: ie,
                  autoFocus: !0,
                  onChange: (b) => Ie(b.target.value),
                  onKeyDown: (b) => {
                    b.key === "Enter" && fe(e, p.id), b.key === "Escape" && V(null);
                  }
                }
              ),
              /* @__PURE__ */ r(
                "input",
                {
                  style: { ...o.input, flex: 3, minWidth: 160, fontFamily: D, fontSize: 11 },
                  "aria-label": "Step command (empty removes it)",
                  placeholder: "optional terminal command",
                  value: Ee,
                  onChange: (b) => Re(b.target.value),
                  onKeyDown: (b) => {
                    b.key === "Enter" && fe(e, p.id), b.key === "Escape" && V(null);
                  }
                }
              ),
              /* @__PURE__ */ r(
                "button",
                {
                  className: "tm-btn",
                  style: { ...o.btnGhost, color: n.focus, borderColor: "rgba(52,211,153,0.3)" },
                  disabled: !ie.trim(),
                  onClick: () => fe(e, p.id),
                  children: "SAVE"
                }
              ),
              /* @__PURE__ */ r("button", { className: "tm-btn", style: o.btnGhost, onClick: () => V(null), children: "CANCEL" })
            ] }) }, p.id) : /* @__PURE__ */ m(
              "div",
              {
                style: { ...o.queueRow, ...I ? o.queueRowActive : {} },
                onClick: () => te(e.id, h),
                children: [
                  /* @__PURE__ */ m("span", { style: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 }, children: [
                    /* @__PURE__ */ r(
                      "button",
                      {
                        className: "tm-btn",
                        style: o.queueCheck,
                        "aria-label": p.done ? "Mark incomplete" : "Mark complete",
                        onClick: (b) => {
                          b.stopPropagation(), Z(e.id, p.id, !p.done);
                        },
                        children: p.done ? /* @__PURE__ */ r("span", { style: { color: n.focus, fontWeight: 700 }, children: "✓" }) : /* @__PURE__ */ r("span", { style: { color: "#475569" }, children: "○" })
                      }
                    ),
                    /* @__PURE__ */ m(
                      "button",
                      {
                        className: "tm-btn",
                        style: o.queueSelect,
                        "aria-current": I || void 0,
                        onClick: (b) => {
                          b.stopPropagation(), te(e.id, h);
                        },
                        children: [
                          /* @__PURE__ */ r("span", { style: { fontSize: 12, ...p.done ? { textDecoration: "line-through", color: n.muted } : {} }, children: p.title }),
                          /* @__PURE__ */ m("span", { style: { display: "flex", gap: 6, marginTop: 2 }, children: [
                            p.runState === "failed" && !p.done && /* @__PURE__ */ r("span", { style: { ...o.execChip, ...o.failedChip }, children: "FAILED" }),
                            p.command && !p.done && /* @__PURE__ */ r("span", { style: o.execChip, children: "EXECUTABLE" }),
                            p.source === "agent" && /* @__PURE__ */ r("span", { style: { ...o.execChip, color: n.kiro, borderColor: "rgba(129,140,248,0.3)", background: "rgba(129,140,248,0.08)" }, children: "AGENT-DRAFTED" })
                          ] })
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ m("span", { style: { display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }, children: [
                    I && /* @__PURE__ */ r("span", { style: o.activeChip, children: "ACTIVE" }),
                    /* @__PURE__ */ r(
                      "button",
                      {
                        className: "tm-btn",
                        style: o.stepCtrl,
                        "aria-label": `Move step ${h + 1} up`,
                        disabled: z || h === 0,
                        onClick: (b) => {
                          b.stopPropagation(), Pe(e, h, -1);
                        },
                        children: "▲"
                      }
                    ),
                    /* @__PURE__ */ r(
                      "button",
                      {
                        className: "tm-btn",
                        style: o.stepCtrl,
                        "aria-label": `Move step ${h + 1} down`,
                        disabled: z || h === e.subtasks.length - 1,
                        onClick: (b) => {
                          b.stopPropagation(), Pe(e, h, 1);
                        },
                        children: "▼"
                      }
                    ),
                    /* @__PURE__ */ r(
                      "button",
                      {
                        className: "tm-btn",
                        style: o.stepCtrl,
                        "aria-label": `Edit step ${h + 1}`,
                        disabled: z,
                        onClick: (b) => {
                          b.stopPropagation(), it(p);
                        },
                        children: "✎"
                      }
                    ),
                    /* @__PURE__ */ r(
                      "button",
                      {
                        className: "tm-btn",
                        style: {
                          ...o.stepCtrl,
                          ...G === p.id ? { color: n.danger, borderColor: n.danger } : {}
                        },
                        "aria-label": G === p.id ? `Confirm delete step ${h + 1}` : `Delete step ${h + 1}`,
                        disabled: z,
                        onClick: (b) => {
                          b.stopPropagation(), G === p.id ? st(e, h) : U(p.id);
                        },
                        onBlur: () => U(null),
                        children: G === p.id ? "SURE?" : "✕"
                      }
                    )
                  ] })
                ]
              },
              p.id
            );
          }) }),
          /* @__PURE__ */ m("div", { style: { ...o.addRow, marginTop: 10 }, children: [
            /* @__PURE__ */ r(
              "input",
              {
                style: { ...o.input, flex: 2 },
                placeholder: "Add micro-step…",
                value: xe,
                onChange: (p) => Ce(p.target.value),
                onKeyDown: (p) => {
                  p.key === "Enter" && me(e);
                }
              }
            ),
            /* @__PURE__ */ r(
              "input",
              {
                style: { ...o.input, flex: 3, fontFamily: D, fontSize: 11 },
                placeholder: "optional terminal command",
                value: ve,
                onChange: (p) => Te(p.target.value),
                onKeyDown: (p) => {
                  p.key === "Enter" && me(e);
                }
              }
            ),
            /* @__PURE__ */ r("button", { className: "tm-btn", style: o.btnGhost, onClick: () => me(e), children: "ADD" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ m("section", { className: "tm-card", style: { ...o.card, padding: 0, overflow: "hidden" }, children: [
        /* @__PURE__ */ m(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderBottom: `1px solid ${n.border}`
            },
            children: [
              /* @__PURE__ */ r("span", { style: o.queueLabel, children: "TASK AGENT SESSION" }),
              /* @__PURE__ */ m("span", { style: { ...o.execChip, color: n.kiro, borderColor: "rgba(129,140,248,0.3)", background: "rgba(129,140,248,0.08)" }, children: [
                l,
                " · taskmaster"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ r("div", { style: { height: 380 }, children: /* @__PURE__ */ r(
          St,
          {
            slotKey: l,
            agent: "taskmaster",
            frameless: !0,
            startAtBottom: !0,
            placeholder: "Message the taskmaster agent about this task…"
          }
        ) })
      ] })
    ] });
  }
  function pt() {
    return /* @__PURE__ */ m(he, { children: [
      /* @__PURE__ */ m("section", { className: "tm-card", style: o.card, children: [
        /* @__PURE__ */ m("div", { style: { ...o.queueLabel, marginBottom: 10 }, children: [
          "ALL BACKLOGS (",
          Fe,
          " TASKS)"
        ] }),
        Ge()
      ] }),
      k.tasks.map((e) => {
        const t = Ke(e), l = e.id === (T == null ? void 0 : T.id), i = se[e.id] ?? null, a = (i == null ? void 0 : i.kind) === "draft";
        return /* @__PURE__ */ m(
          "section",
          {
            className: "tm-card",
            style: { ...o.card, ...l ? { borderColor: "rgba(52,211,153,0.4)" } : {} },
            children: [
              /* @__PURE__ */ m("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }, children: [
                /* @__PURE__ */ r("span", { style: { fontWeight: 600, fontSize: 14, minWidth: 0 }, children: e.title }),
                /* @__PURE__ */ m("span", { style: { display: "flex", gap: 6, flexWrap: "wrap" }, children: [
                  e.estimateMinutes != null && /* @__PURE__ */ m("span", { style: { ...o.chip, color: "#38bdf8", borderColor: n.border, fontFamily: D }, children: [
                    "~",
                    e.estimateMinutes,
                    "m"
                  ] }),
                  /* @__PURE__ */ r("button", { className: "tm-btn", style: { ...o.btnGhost, color: n.focus, borderColor: "rgba(52,211,153,0.3)" }, onClick: () => lt(e.id), children: "FOCUS" }),
                  /* @__PURE__ */ r(
                    "button",
                    {
                      className: "tm-btn",
                      style: { ...o.btnGhost, ...a ? { color: n.kiro } : {} },
                      disabled: !!i,
                      onClick: () => ze(e),
                      children: a ? "⚙ DRAFTING…" : "✦ DRAFT STEPS"
                    }
                  ),
                  /* @__PURE__ */ r("button", { className: "tm-btn", style: o.btnGhost, onClick: () => We(e), children: "💬 CHAT" }),
                  /* @__PURE__ */ r(
                    "button",
                    {
                      className: "tm-btn",
                      style: { ...o.btnGhost, ...G === e.id ? { color: n.danger, borderColor: n.danger } : {} },
                      onClick: () => G === e.id ? at(e.id) : U(e.id),
                      onBlur: () => U(null),
                      children: G === e.id ? "SURE?" : "DELETE"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ r("div", { style: { ...o.progressTrack, marginTop: 12 }, children: /* @__PURE__ */ r("div", { style: { ...o.progressFill, width: `${t.pct}%` } }) }),
              /* @__PURE__ */ m("div", { style: { display: "flex", flexDirection: "column", gap: 4, marginTop: 10 }, children: [
                e.subtasks.length === 0 && /* @__PURE__ */ r("span", { style: { color: n.muted, fontSize: 11 }, children: "No micro-steps yet." }),
                e.subtasks.map((u) => {
                  const f = u.runState === "failed" && !u.done;
                  return /* @__PURE__ */ m("div", { style: o.backlogSubRow, children: [
                    /* @__PURE__ */ r("span", { style: { color: u.done ? n.focus : f ? n.danger : "#475569" }, children: u.done ? "✓" : f ? "✗" : "○" }),
                    /* @__PURE__ */ r("span", { style: { fontSize: 11, ...u.done ? { textDecoration: "line-through", color: n.muted } : {} }, children: u.title }),
                    f && /* @__PURE__ */ r("span", { style: { ...o.execChip, ...o.failedChip }, children: "FAILED" })
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
  function mt() {
    return /* @__PURE__ */ m(he, { children: [
      /* @__PURE__ */ m("section", { className: "tm-card", style: o.card, children: [
        /* @__PURE__ */ m("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }, children: [
          /* @__PURE__ */ r("span", { style: o.queueLabel, children: "KIRO GATEWAY" }),
          /* @__PURE__ */ r(
            "button",
            {
              className: "tm-btn",
              style: o.btnGhost,
              onClick: () => {
                s.get("/api/status").then((e) => {
                  W(typeof e == "object" && e !== null ? e : {}), g("ok", "Gateway status refreshed.");
                }).catch((e) => g("warn", `Status refresh failed: ${String(e)}`));
              },
              children: "REFRESH"
            }
          )
        ] }),
        /* @__PURE__ */ m("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ r(oe, { label: "STATUS", value: S ? "ONLINE" : "UNKNOWN", accent: S ? n.focus : n.warn }),
          /* @__PURE__ */ r(oe, { label: "VERSION", value: String((S == null ? void 0 : S.version) ?? "—"), accent: n.kiro }),
          /* @__PURE__ */ r(oe, { label: "UPTIME", value: String((S == null ? void 0 : S.uptime) ?? "—"), accent: n.text }),
          /* @__PURE__ */ r(oe, { label: "PROVIDER", value: String((S == null ? void 0 : S.provider) ?? "—"), accent: n.text })
        ] })
      ] }),
      /* @__PURE__ */ m("section", { className: "tm-card", style: { ...o.card, fontFamily: D }, children: [
        /* @__PURE__ */ m("div", { style: { display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", borderBottom: `1px solid ${n.border}`, paddingBottom: 8, marginBottom: 10 }, children: [
          /* @__PURE__ */ r("span", { style: { color: n.muted, fontSize: 11 }, children: "Taskmaster activity + gateway console" }),
          /* @__PURE__ */ r("span", { style: { ...o.execChip, color: n.muted }, children: Je })
        ] }),
        /* @__PURE__ */ m("div", { style: { display: "flex", flexDirection: "column", gap: 6, maxHeight: 380, overflowY: "auto" }, children: [
          F.length === 0 && /* @__PURE__ */ r("span", { style: { color: n.muted, fontSize: 11 }, children: "No events yet." }),
          F.map((e, t) => /* @__PURE__ */ m("div", { style: { display: "flex", gap: 10, alignItems: "flex-start" }, children: [
            /* @__PURE__ */ r("span", { style: { color: "#475569", fontSize: 10, flexShrink: 0, paddingTop: 1 }, children: e.ts }),
            /* @__PURE__ */ r(
              "span",
              {
                style: {
                  ...o.levelChip,
                  ...e.level === "ok" ? { background: "rgba(52,211,153,0.15)", color: n.focus } : e.level === "warn" ? { background: "rgba(210,153,34,0.15)", color: n.warn } : e.level === "err" ? { background: "rgba(229,83,75,0.15)", color: n.danger } : { background: "rgba(148,163,184,0.12)", color: n.muted }
                },
                children: e.level.toUpperCase()
              }
            ),
            /* @__PURE__ */ r("span", { style: { fontSize: 11, color: n.text, wordBreak: "break-word" }, children: e.msg })
          ] }, `${e.ts}-${t}`))
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ m("div", { style: o.root, children: [
    /* @__PURE__ */ r("style", { children: Pt }),
    /* @__PURE__ */ m("header", { style: o.header, children: [
      /* @__PURE__ */ m("span", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
        /* @__PURE__ */ r("span", { style: o.logoBox, "aria-hidden": "true", children: /* @__PURE__ */ r("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "#030712", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ r("path", { d: "M13 10V3L4 14h7v7l9-11h-7z" }) }) }),
        /* @__PURE__ */ m("span", { children: [
          /* @__PURE__ */ r("span", { style: o.brandTitle, children: "Taskmaster Pro" }),
          /* @__PURE__ */ r("span", { style: { ...o.chip, marginLeft: 8, color: n.kiro, borderColor: "rgba(129,140,248,0.3)", background: "rgba(129,140,248,0.08)" }, children: "EXECUTION ENGINE" }),
          /* @__PURE__ */ r("div", { style: { color: n.muted, fontSize: 10, marginTop: 2 }, children: "Task focus · agent-run commands · memory sync" })
        ] })
      ] }),
      ct()
    ] }),
    j && /* @__PURE__ */ r("div", { style: o.errorBanner, children: j }),
    ne
  ] });
}
function oe({ label: s, value: d, accent: c }) {
  return /* @__PURE__ */ m("div", { style: o.statBox, children: [
    /* @__PURE__ */ r("div", { style: { color: n.muted, fontSize: 9, letterSpacing: "0.1em", marginBottom: 4 }, children: s }),
    /* @__PURE__ */ r("div", { style: { color: c, fontSize: 13, fontWeight: 700, fontFamily: D, wordBreak: "break-all" }, children: d })
  ] });
}
const Pt = `
  .tm-btn { cursor: pointer; transition: filter 120ms ease, background 120ms ease; }
  .tm-btn:hover:not(:disabled) { filter: brightness(1.25); }
  .tm-btn:disabled { cursor: default; }
  .tm-btn:focus-visible { outline: 2px solid #34d399; outline-offset: 2px; }
  .tm-card { box-shadow: 0 8px 24px rgba(0,0,0,0.25); }
  @keyframes tm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
  .tm-pulse { animation: tm-pulse 1.6s ease-in-out infinite; }
`, o = {
  root: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    padding: 18,
    maxWidth: 920,
    margin: "0 auto",
    minHeight: "100%",
    background: n.bg,
    color: n.text,
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
    background: n.card,
    border: `1px solid ${n.border}`,
    borderRadius: 14
  },
  logoBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: `linear-gradient(45deg, ${n.kiro}, ${n.focus})`,
    flexShrink: 0
  },
  brandTitle: { fontWeight: 800, fontSize: 16, letterSpacing: "-0.01em" },
  tabRow: {
    display: "flex",
    gap: 4,
    padding: 4,
    borderRadius: 12,
    border: `1px solid ${n.border}`,
    background: n.bg
  },
  tab: {
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 600,
    color: n.muted,
    background: "transparent",
    border: "1px solid transparent"
  },
  tabActive: { background: n.focus, color: "#030712" },
  card: { background: n.card, border: `1px solid ${n.border}`, borderRadius: 14, padding: 18 },
  gradientStrip: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: `linear-gradient(90deg, ${n.kiro}, ${n.focus}, #38bdf8)`
  },
  centerCol: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "4px 10px",
    borderRadius: 999,
    border: `1px solid ${n.border}`,
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
    border: `1px solid ${n.border}`,
    background: n.bg,
    overflow: "hidden",
    padding: 2,
    boxSizing: "border-box"
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    background: `linear-gradient(90deg, ${n.kiro}, ${n.focus})`,
    transition: "width 300ms ease"
  },
  stepHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `1px solid ${n.border}`,
    paddingBottom: 12,
    marginBottom: 14
  },
  stepCounter: { fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", display: "inline-flex", alignItems: "center", gap: 7 },
  pulseDot: { width: 8, height: 8, borderRadius: 999, background: n.focus, display: "inline-block" },
  navBtn: {
    padding: "4px 10px",
    borderRadius: 8,
    border: `1px solid ${n.border}`,
    background: n.bg,
    color: n.text,
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
    border: `1px solid ${n.border}`,
    background: n.bg
  },
  commandLabel: { fontSize: 9, letterSpacing: "0.14em", color: n.muted, fontFamily: D },
  commandCode: {
    display: "block",
    padding: 8,
    borderRadius: 8,
    border: `1px solid ${n.border}`,
    background: n.card,
    color: "#6ee7b7",
    fontSize: 11,
    fontFamily: D,
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
    border: `1px solid ${n.border}`,
    background: "transparent",
    color: n.muted,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.05em"
  },
  outputPre: {
    margin: 0,
    padding: 10,
    borderRadius: 8,
    border: `1px solid ${n.border}`,
    background: "#000",
    color: "#cbd5e1",
    fontSize: 10.5,
    fontFamily: D,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    maxHeight: 200,
    overflowY: "auto"
  },
  queueLabel: { fontSize: 10, letterSpacing: "0.1em", fontWeight: 700, color: n.muted },
  queueRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    padding: "8px 12px",
    borderRadius: 12,
    border: `1px solid ${n.border}`,
    background: "rgba(3,7,18,0.4)",
    cursor: "pointer"
  },
  queueRowActive: { borderColor: "rgba(52,211,153,0.45)", background: "rgba(52,211,153,0.08)" },
  queueCheck: { background: "transparent", border: "none", padding: 0, fontSize: 13, flexShrink: 0 },
  stepCtrl: {
    padding: "3px 7px",
    borderRadius: 7,
    border: `1px solid ${n.border}`,
    background: "transparent",
    color: n.muted,
    fontSize: 10,
    fontWeight: 700,
    lineHeight: 1.4,
    flexShrink: 0
  },
  queueSelect: {
    background: "transparent",
    border: "none",
    padding: 0,
    margin: 0,
    minWidth: 0,
    textAlign: "left",
    color: "inherit",
    font: "inherit",
    borderRadius: 6
  },
  execChip: {
    display: "inline-block",
    padding: "1px 5px",
    borderRadius: 4,
    border: "1px solid rgba(52,211,153,0.3)",
    background: "rgba(52,211,153,0.08)",
    color: n.focus,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: "0.08em",
    fontFamily: D
  },
  failedChip: {
    color: n.danger,
    borderColor: "rgba(229,83,75,0.35)",
    background: "rgba(229,83,75,0.08)"
  },
  activeChip: {
    padding: "2px 8px",
    borderRadius: 6,
    background: "rgba(52,211,153,0.2)",
    color: n.focus,
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: "0.08em",
    flexShrink: 0
  },
  addRow: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
  input: {
    padding: "8px 10px",
    borderRadius: 10,
    border: `1px solid ${n.border}`,
    background: n.bg,
    color: n.text,
    fontSize: 12,
    outline: "none",
    minWidth: 0
  },
  backlogSubRow: { display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", borderRadius: 8, background: "rgba(3,7,18,0.45)" },
  statBox: {
    flex: "1 1 120px",
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${n.border}`,
    background: n.bg
  },
  levelChip: { padding: "1px 6px", borderRadius: 4, fontSize: 9, fontWeight: 800, letterSpacing: "0.06em", flexShrink: 0 },
  errorBanner: {
    padding: "10px 14px",
    borderRadius: 12,
    border: `1px solid ${n.danger}`,
    background: "rgba(229,83,75,0.08)",
    color: n.danger,
    fontSize: 12
  }
};
export {
  qt as default
};
