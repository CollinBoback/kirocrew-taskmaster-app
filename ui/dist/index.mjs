import { jsx as r, jsxs as u, Fragment as me } from "react/jsx-runtime";
import { useState as $, useRef as z, useCallback as E, useEffect as fe, useMemo as ot } from "react";
import { useAppApi as it, useNotify as st, useNavBadge as at, useChatLauncher as lt, useAppEvents as dt, ChatEmbed as ct } from "@kirocrew/app-sdk";
import { MarkdownRenderer as ut } from "@kirocrew/ui";
function Z(i) {
  return `taskmaster-${i.id}`;
}
let Be = 0;
function q(i) {
  return Be += 1, `${i}-${Date.now().toString(36)}-${Be.toString(36)}`;
}
function pt() {
  return { version: 1, settings: { memorySync: !0 }, activeTaskId: null, tasks: [] };
}
function mt(i) {
  var I;
  const d = pt();
  if (typeof i != "object" || i === null) return d;
  const a = i, k = Array.isArray(a.tasks) ? a.tasks.filter(Ke).map(ft) : d.tasks, S = typeof a.settings == "object" && a.settings !== null ? { memorySync: a.settings.memorySync !== !1 } : d.settings, A = typeof a.activeTaskId == "string" ? a.activeTaskId : null;
  return {
    version: 1,
    settings: S,
    activeTaskId: k.some((N) => N.id === A) ? A : ((I = k[0]) == null ? void 0 : I.id) ?? null,
    tasks: k
  };
}
function Ke(i) {
  return typeof i == "object" && i !== null && typeof i.title == "string";
}
function ft(i) {
  const d = Array.isArray(i.subtasks) ? i.subtasks.filter(Ke).map((a) => ({
    id: typeof a.id == "string" ? a.id : q("sub"),
    title: String(a.title),
    done: a.done === !0,
    ...typeof a.command == "string" && a.command.trim() ? { command: a.command } : {},
    ...typeof a.output == "string" && a.output ? { output: a.output } : {},
    ...a.runState === "done" || a.runState === "failed" ? { runState: a.runState } : {},
    ...a.source === "agent" || a.source === "manual" ? { source: a.source } : {}
  })) : [];
  return {
    id: typeof i.id == "string" ? i.id : q("task"),
    title: String(i.title),
    ...typeof i.estimateMinutes == "number" && i.estimateMinutes > 0 ? { estimateMinutes: Math.round(i.estimateMinutes) } : {},
    createdAt: typeof i.createdAt == "string" ? i.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
    subtasks: d,
    ...i.lessonPosted === !0 ? { lessonPosted: !0 } : {},
    ...i.slotStarted === !0 ? { slotStarted: !0 } : {}
  };
}
function Oe(i) {
  const d = i.subtasks.length, a = i.subtasks.filter((k) => k.done).length;
  return { done: a, total: d, pct: d === 0 ? 0 : Math.round(a / d * 100) };
}
function gt(i) {
  const d = i.subtasks.findIndex((a) => !a.done);
  return d === -1 ? Math.max(0, i.subtasks.length - 1) : d;
}
function ht(i) {
  const d = /```(?:json)?\s*([\s\S]*?)```/.exec(i), a = [];
  d != null && d[1] && a.push(d[1]);
  const k = i.indexOf("["), S = i.lastIndexOf("]");
  k !== -1 && S > k && a.push(i.slice(k, S + 1));
  for (const A of a)
    try {
      const I = JSON.parse(A);
      if (!Array.isArray(I)) continue;
      const N = I.filter((x) => typeof x == "object" && x !== null).map((x) => ({
        title: typeof x.title == "string" ? x.title.trim() : "",
        ...typeof x.command == "string" && x.command.trim() ? { command: x.command.trim() } : {}
      })).filter((x) => x.title.length > 0).slice(0, 12);
      if (N.length > 0) return N;
    } catch {
    }
  return null;
}
function bt(i) {
  const d = i.subtasks.map((a, k) => `${k + 1}. ${a.title}${a.command ? ` [${a.command}]` : ""}`);
  return `Completed "${i.title}" via micro-steps: ${d.join(" ")}`;
}
const yt = 900 * 1e3;
function kt(i, d, a = yt) {
  return d - i.sentAt > a;
}
function xt(i) {
  if (typeof i == "object" && i !== null) {
    const a = i;
    if (a.status === 404 || a.statusCode === 404 || typeof a.response == "object" && a.response !== null && a.response.status === 404)
      return !0;
  }
  const d = i instanceof Error ? i.message : String(i);
  return /(?:^|\D)404(?:\D|$)|slot not found/i.test(d);
}
function ze(i, d) {
  return i !== void 0 ? i : d.status === "loaded" ? d.messageCount : d.status === "missing" ? 0 : null;
}
function We(i, d) {
  return Math.max(i ?? 0, Math.max(0, d));
}
function Pe(i, d, a = !1) {
  return !a && i === d;
}
function St(i) {
  if (typeof i != "object" || i === null) return { messages: [], running: !1 };
  const d = i;
  return { messages: Array.isArray(d.messages) ? d.messages.filter((k) => typeof k == "object" && k !== null) : [], running: d.running === !0 };
}
const je = /^\s*STEP RESULT \[(\d+)\]:\s*(done|failed)\s*(?:[—–:-]\s*)?(.*)$/gim;
function Ct(i) {
  const d = [];
  je.lastIndex = 0;
  let a;
  for (; (a = je.exec(i)) !== null; )
    d.push({
      index: Number.parseInt(a[1], 10),
      ok: a[2].toLowerCase() === "done",
      summary: a[3].trim()
    });
  return d;
}
const Fe = 4e3;
function vt(i) {
  const { work: d, data: a, seen: k, stepCount: S } = i, A = a.running ? Math.max(0, a.messages.length - 1) : a.messages.length, I = a.messages.slice(k, A), N = Math.max(k, A);
  if (S === null)
    return { actions: [], nextSeen: N, sawReply: i.sawReply, settled: !0, stepSucceeded: !1 };
  const x = [];
  let U = i.sawReply, W = !1, K = !1;
  for (const h of I) {
    if (h.role === "user" || !h.content) continue;
    U = !0;
    const B = h.content;
    if (d.kind === "draft") {
      const T = ht(B);
      T && (x.push({ type: "append-draft", steps: T }), W = !0);
      continue;
    }
    const P = Ct(B);
    for (const T of P) {
      if (T.index < 1 || T.index > S) {
        x.push({ type: "unknown-step", result: T });
        continue;
      }
      const H = P.length === 1 ? B.slice(0, Fe) : `${T.ok ? "done" : "failed"} — ${T.summary || "(no summary)"}`;
      x.push({ type: "step-result", result: T, output: H }), T.ok && (K = !0), d.kind === "step" && (W = !0);
    }
  }
  if (W && d.kind !== "all")
    return { actions: x, nextSeen: N, sawReply: U, settled: !0, stepSucceeded: K };
  if (!a.running && U) {
    const h = [...I].reverse().find((B) => B.role !== "user" && B.content);
    x.push({
      type: "turn-ended",
      kind: d.kind,
      ...d.kind === "step" && (h != null && h.content) ? { output: h.content.slice(0, Fe) } : {}
    }), W = !0;
  }
  return { actions: x, nextSeen: N, sawReply: U, settled: W, stepSucceeded: K };
}
const Ge = "/api/apps/taskmaster-pro/config", Tt = 200, Ue = "notification scope · slot polling", wt = 2500, t = {
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
function It() {
  return (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0];
}
function Lt() {
  const i = it(), d = st(), a = at(), { openChat: k } = lt(), [S, A] = $(null), [I, N] = $("focus"), [x, U] = $({}), [W, K] = $([]), [h, B] = $(null), [P, T] = $(null), [H, ge] = $(""), [he, be] = $(""), [ye, ke] = $(""), [xe, Se] = $(""), [te, ne] = $(null), [re, Ce] = $({}), j = z(null);
  j.current = S;
  const ve = z(Promise.resolve()), Te = z(0), oe = z({}), R = z({}), M = z({}), L = z({}), V = z(/* @__PURE__ */ new Set()), ie = z({}), qe = E((e) => {
    M.current[e.taskId] = e, Ce((n) => ({ ...n, [e.taskId]: e }));
  }, []), _ = E((e) => M.current[e.taskId] !== e ? !1 : (delete M.current[e.taskId], Ce((n) => {
    const c = { ...n };
    return delete c[e.taskId], c;
  }), !0), []), g = E((e, n) => {
    K((c) => [{ ts: It(), level: e, msg: n }, ...c].slice(0, Tt));
  }, []), we = E(
    (e) => {
      A(e), j.current = e;
      const n = ++Te.current;
      ve.current = ve.current.then(async () => {
        if (n === Te.current)
          try {
            await i.put(Ge, e);
          } catch (c) {
            g("warn", `Config save failed: ${String(c)}`);
          }
      });
    },
    [i, g]
  ), v = E(
    (e) => {
      const n = j.current;
      n && we(e(n));
    },
    [we]
  ), se = E(
    (e) => {
      i.get(Ge).then((n) => {
        e != null && e() || (A(mt(n)), T(null), g("info", "Loaded task state from gateway app config."));
      }).catch((n) => {
        e != null && e() || (A(null), T(`Config load failed (${String(n)}) — retry to continue.`), g("warn", `Config load failed: ${String(n)}`));
      });
    },
    [i, g]
  );
  fe(() => {
    let e = !1;
    return se(() => e), i.get("/api/status").then((n) => {
      e || (B(typeof n == "object" && n !== null ? n : {}), g("ok", "Connected to Kiro Crew gateway."));
    }).catch(() => {
      e || g("warn", "Gateway status unavailable.");
    }), g("info", `Console mode: ${Ue} — gateway event forwarding to app pages is pending upstream.`), () => {
      e = !0;
    };
  }, [se]);
  const Ie = E(
    (e) => {
      d(`Task complete: ${e.title}`), g("ok", `Task "${e.title}" fully completed.`);
      const n = j.current;
      !(n != null && n.settings.memorySync) || e.lessonPosted || oe.current[e.id] || (oe.current[e.id] = !0, i.post("/api/lessons", { rule: bt(e), category: "knowledge" }).then(() => {
        v((c) => ({
          ...c,
          tasks: c.tasks.map((s) => s.id === e.id ? { ...s, lessonPosted: !0 } : s)
        })), g("ok", "Kiro Memory: appended solution path to lessons (category: knowledge).");
      }).catch((c) => g("warn", `Memory sync failed: ${String(c)}`)).finally(() => {
        delete oe.current[e.id];
      }));
    },
    [i, d, g, v]
  ), Y = E(
    (e, n, c, s, l) => {
      let m = null;
      v((p) => {
        const f = p.tasks.map((y) => {
          if (y.id !== e) return y;
          const w = y.subtasks.map((G) => {
            if (G.id !== n) return G;
            const pe = { ...G, done: c, ...s !== void 0 ? { output: s } : {} };
            return l ? pe.runState = l : delete pe.runState, pe;
          }), O = { ...y, subtasks: w }, ue = y.subtasks.length > 0 && y.subtasks.every((G) => G.done);
          return w.length > 0 && w.every((G) => G.done) && !ue && (m = O), O;
        });
        return { ...p, tasks: f };
      }), m && Ie(m);
    },
    [v, Ie]
  );
  dt("notification", (e) => {
    const n = typeof e == "object" && e !== null ? e : {}, c = typeof n.title == "string" ? n.title : "notification", s = typeof n.text == "string" ? n.text : "";
    g("info", `Gateway notification [${c}]: ${s.slice(0, 200)}`);
  });
  const Re = E(
    (e, n) => {
      v((c) => ({
        ...c,
        tasks: c.tasks.map((s) => {
          if (s.id !== e) return s;
          const l = new Set(s.subtasks.map((p) => p.title.toLowerCase())), m = n.filter((p) => !l.has(p.title.toLowerCase())).map((p) => ({ id: q("sub"), title: p.title, done: !1, source: "agent", ...p.command ? { command: p.command } : {} }));
          return { ...s, subtasks: [...s.subtasks, ...m] };
        })
      })), g("ok", `Taskmaster agent drafted ${n.length} micro-step(s).`), d(`Added ${n.length} drafted micro-steps`);
    },
    [g, v, d]
  ), ae = E(
    async (e) => St(await i.get(`/api/chat/slots/${encodeURIComponent(e)}`)),
    [i]
  ), le = E(
    (e, n, c, s) => {
      v((l) => ({
        ...l,
        tasks: l.tasks.map(
          (m) => m.id === e ? {
            ...m,
            subtasks: m.subtasks.map(
              (p) => p.id === n ? { ...p, output: c, ...s ? { runState: s } : {} } : p
            )
          } : m
        )
      }));
    },
    [v]
  );
  async function de(e, n, c) {
    if (M.current[e.id] || R.current[e.id]) return;
    R.current[e.id] = !0;
    const s = Z(e), l = V.current.has(s);
    if (L.current[s] === void 0 || l)
      try {
        const p = await ae(s);
        if (l && p.running) {
          R.current[e.id] = !1, g("info", "The stopped agent turn is still running in chat; request was not sent."), d("The previous agent turn is still finishing — retry after it ends");
          return;
        }
        const f = p.messages.length, y = l ? We(L.current[s], f) : ze(L.current[s], {
          status: "loaded",
          messageCount: f
        });
        if (y === null) {
          R.current[e.id] = !1;
          return;
        }
        L.current[s] = y, V.current.delete(s);
      } catch (p) {
        const f = xt(p);
        if (l && !f) {
          R.current[e.id] = !1, g("info", `Could not verify that the stopped agent turn ended: ${String(p)}`), d("Could not verify the previous agent turn — retry after it ends", { type: "error" });
          return;
        }
        const y = ze(
          L.current[s],
          f ? { status: "missing" } : { status: "failed" }
        );
        if (y === null) {
          R.current[e.id] = !1, g("warn", `Could not safely read task chat history; request was not sent: ${String(p)}`), d("Could not verify task chat history — retry the run", { type: "error" });
          return;
        }
        L.current[s] = y, V.current.delete(s);
      }
    ie.current[e.id] = !1;
    const m = { ...c, sentAt: Date.now() };
    R.current[e.id] = !1, qe(m), e.slotStarted || v((p) => ({
      ...p,
      tasks: p.tasks.map((f) => f.id === e.id ? { ...f, slotStarted: !0 } : f)
    })), i.post("/api/chat", { message: n, slot: s, agent: "taskmaster" }).catch((p) => {
      p instanceof SyntaxError || (g("err", `Send to task slot failed: ${String(p)}`), d("Could not reach the gateway", { type: "error" }), _(m));
    }), g("info", `Sent to task slot ${s}: ${n.split(`
`)[0].slice(0, 120)}`);
  }
  async function He(e) {
    const n = M.current[e.id];
    if (!n || n.taskId !== e.id || !_(n)) return;
    const c = Z(e);
    V.current.add(c), R.current[e.id] = !0, g("warn", "Stopped waiting for the agent; its turn may continue in the task chat."), d("Stopped waiting — the agent may continue in the task chat");
    try {
      const s = await ae(c);
      L.current[c] = We(L.current[c], s.messages.length);
    } catch {
    } finally {
      R.current[e.id] = !1;
    }
  }
  const Ve = E(
    (e, n) => {
      var c, s;
      for (const l of n) {
        if (l.type === "append-draft") {
          Re(e.taskId, l.steps);
          continue;
        }
        if (l.type === "unknown-step") {
          g("warn", `Agent reported STEP RESULT [${l.result.index}] but the task has no such step.`);
          continue;
        }
        if (l.type === "step-result") {
          const m = (c = j.current) == null ? void 0 : c.tasks.find((f) => f.id === e.taskId), p = m == null ? void 0 : m.subtasks[l.result.index - 1];
          if (!p) continue;
          l.result.ok ? (Y(e.taskId, p.id, !0, l.output, "done"), g("ok", `Step ${l.result.index} completed by agent: ${l.result.summary || p.title}`)) : (le(e.taskId, p.id, l.output, "failed"), g("warn", `Step ${l.result.index} failed: ${l.result.summary || "(no summary)"}`));
          continue;
        }
        if (l.kind === "all")
          g("ok", "Agent finished the run — see per-step results above and the task chat.");
        else if (l.kind === "draft")
          g("warn", "Draft reply had no parseable json block — see the task chat."), d("Agent reply was not parseable — see the task chat");
        else {
          const m = (s = j.current) == null ? void 0 : s.tasks.find((f) => f.id === e.taskId), p = e.stepIndex != null ? m == null ? void 0 : m.subtasks[e.stepIndex] : void 0;
          p && l.output && le(e.taskId, p.id, l.output), g("warn", "Agent reply had no STEP RESULT marker — step left for manual toggle.");
        }
      }
    },
    [g, Re, d, le, Y]
  ), $e = Object.keys(re).length > 0;
  fe(() => {
    if (!$e) return;
    let e = !1;
    const n = async () => {
      const s = Object.values(M.current);
      s.length !== 0 && await Promise.all(
        s.map(async (l) => {
          var O;
          if (e) return;
          const m = Z({ id: l.taskId });
          if (!Pe(M.current[l.taskId] ?? null, l, e)) return;
          if (kt(l, Date.now())) {
            g("warn", "Agent request timed out — check the task chat."), _(l);
            return;
          }
          let p;
          try {
            p = await ae(m);
          } catch {
            return;
          }
          if (!Pe(M.current[l.taskId] ?? null, l, e)) return;
          const f = L.current[m] ?? 0, y = (O = j.current) == null ? void 0 : O.tasks.find((ue) => ue.id === l.taskId), w = vt({
            work: l,
            data: p,
            seen: f,
            sawReply: ie.current[l.taskId] ?? !1,
            stepCount: (y == null ? void 0 : y.subtasks.length) ?? null
          });
          L.current[m] = w.nextSeen, ie.current[l.taskId] = w.sawReply, Ve(l, w.actions), w.settled && (l.kind === "step" && w.stepSucceeded && d("Step completed via taskmaster agent", { type: "success" }), _(l));
        })
      );
    }, c = setInterval(() => void n(), wt);
    return n(), () => {
      e = !0, clearInterval(c);
    };
  }, [$e]);
  function _e(e, n, c) {
    !n.command || M.current[e.id] || R.current[e.id] || (g("info", `Kiro terminal execute (step ${c + 1}): ${n.command}`), de(
      e,
      `Run micro-step [${c + 1}] of task "${e.title}": ${n.title}
Execute this terminal command and report concise output:
${n.command}
End your reply with exactly one line: STEP RESULT [${c + 1}]: done|failed — <short summary>`,
      { taskId: e.id, kind: "step", stepIndex: c }
    ));
  }
  function Ee(e) {
    if (M.current[e.id] || R.current[e.id]) return;
    const n = e.subtasks.map((c) => c.title).join("; ") || "none";
    g("info", `Requesting micro-step breakdown for "${e.title}".`), d("Taskmaster agent is drafting micro-steps…"), de(
      e,
      `Break the task "${e.title}"${e.estimateMinutes ? ` (~${e.estimateMinutes}m)` : ""} into micro-steps per the taskmaster-method skill. Reply with ONE fenced json code block containing an array of {"title", "command"?} objects and no prose outside it.
Existing steps (do not duplicate): ${n}`,
      { taskId: e.id, kind: "draft" }
    );
  }
  function Ye(e) {
    if (M.current[e.id] || R.current[e.id]) return;
    const n = e.subtasks.map((s, l) => ({ sub: s, index: l })).filter(({ sub: s }) => !s.done);
    if (n.length === 0) return;
    const c = n.map(({ sub: s, index: l }) => `[${l + 1}] ${s.title}${s.command ? ` — command: ${s.command}` : ""}`).join(`
`);
    g("info", `Running ${n.length} remaining step(s) unattended via taskmaster agent.`), d(`Agent is running ${n.length} remaining step(s)…`), de(
      e,
      `Execute the remaining micro-steps of task "${e.title}" in order, autonomously:
${c}
After finishing each step output one line: STEP RESULT [n]: done|failed — <short summary>. If a step cannot be completed autonomously, mark it failed with the reason and continue to the next.`,
      { taskId: e.id, kind: "all" }
    );
  }
  function Ae(e) {
    const n = e.subtasks.filter((c) => !c.done).map((c) => c.title);
    k({
      agent: "taskmaster",
      message: `Check in on task "${e.title}". Remaining micro-steps: ${n.join("; ") || "none"}. Help me with the next one.`
    });
  }
  async function Xe(e) {
    try {
      await i.post("/api/crons", {
        name: `taskmaster-${e.id}`,
        cron: "0 9 * * 1-5",
        agent: "taskmaster",
        message: `Taskmaster routine check-in on task "${e.title}". Review current progress and report the single next micro-step.`
      }), g("ok", `Cron registered: weekday 09:00 routine check-in on "${e.title}".`), d("Routine scheduled — weekdays 09:00");
    } catch (n) {
      g("err", `Cron registration failed: ${String(n)}`), d("Could not register the cron");
    }
  }
  function Ne() {
    const e = H.trim();
    if (!e) return;
    const n = Number.parseInt(he, 10), c = {
      id: q("task"),
      title: e,
      ...Number.isFinite(n) && n > 0 ? { estimateMinutes: n } : {},
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      subtasks: []
    };
    v((s) => ({ ...s, tasks: [...s.tasks, c], activeTaskId: s.activeTaskId ?? c.id })), ge(""), be(""), g("info", `Task added to backlog: "${e}"`);
  }
  function ce(e) {
    const n = ye.trim();
    if (!n) return;
    const c = xe.trim(), s = { id: q("sub"), title: n, done: !1, source: "manual", ...c ? { command: c } : {} };
    v((l) => ({
      ...l,
      tasks: l.tasks.map((m) => m.id === e.id ? { ...m, subtasks: [...m.subtasks, s] } : m)
    })), ke(""), Se("");
  }
  function Je(e) {
    v((n) => {
      var s;
      const c = n.tasks.filter((l) => l.id !== e);
      return { ...n, tasks: c, activeTaskId: n.activeTaskId === e ? ((s = c[0]) == null ? void 0 : s.id) ?? null : n.activeTaskId };
    }), ne(null), g("info", "Task removed from backlog.");
  }
  function Qe(e) {
    v((n) => ({ ...n, activeTaskId: e })), N("focus");
  }
  const C = ot(() => S ? S.tasks.find((e) => e.id === S.activeTaskId) ?? S.tasks[0] ?? null : null, [S]), F = C ? Math.max(
    0,
    Math.min(x[C.id] ?? gt(C), Math.max(0, C.subtasks.length - 1))
  ) : 0, b = (C == null ? void 0 : C.subtasks[F]) ?? null, Ze = C ? Oe(C) : null, X = C ? C.subtasks.filter((e) => !e.done).length : 0;
  fe(() => {
    try {
      a(X);
    } catch {
    }
  }, [X, a]);
  function J(e, n) {
    U((c) => ({ ...c, [e]: n }));
  }
  if (!S)
    return /* @__PURE__ */ r("div", { style: { ...o.root, alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ u("div", { style: { display: "grid", gap: 10, justifyItems: "center" }, children: [
      /* @__PURE__ */ r("span", { style: { color: t.muted, fontSize: 13 }, children: P ?? "Loading Taskmaster Pro…" }),
      P ? /* @__PURE__ */ r("button", { className: "tm-btn", style: o.primaryBtn, onClick: () => se(), children: "Retry load" }) : null
    ] }) });
  const Me = S.tasks.length, Le = S.settings.memorySync;
  let Q;
  switch (I) {
    case "focus":
      Q = tt();
      break;
    case "backlog":
      Q = nt();
      break;
    case "console":
      Q = rt();
      break;
    default: {
      const e = I;
      throw new Error(`Unhandled view: ${String(e)}`);
    }
  }
  function et() {
    const e = [
      { id: "focus", label: "★ Focus" },
      { id: "backlog", label: `Backlog (${Me})` },
      { id: "console", label: "Console" }
    ];
    return /* @__PURE__ */ r("div", { style: o.tabRow, children: e.map((n) => /* @__PURE__ */ r(
      "button",
      {
        className: "tm-btn",
        style: { ...o.tab, ...I === n.id ? o.tabActive : {} },
        onClick: () => N(n.id),
        children: n.label
      },
      n.id
    )) });
  }
  function De() {
    return /* @__PURE__ */ u("div", { style: o.addRow, children: [
      /* @__PURE__ */ r(
        "input",
        {
          style: { ...o.input, flex: 1 },
          placeholder: "New task title…",
          value: H,
          onChange: (e) => ge(e.target.value),
          onKeyDown: (e) => {
            e.key === "Enter" && Ne();
          }
        }
      ),
      /* @__PURE__ */ r(
        "input",
        {
          style: { ...o.input, width: 74 },
          placeholder: "~min",
          inputMode: "numeric",
          value: he,
          onChange: (e) => be(e.target.value)
        }
      ),
      /* @__PURE__ */ r("button", { className: "tm-btn", style: o.btnPrimary, onClick: Ne, children: "ADD TASK" })
    ] });
  }
  function tt() {
    if (!C)
      return /* @__PURE__ */ u("section", { className: "tm-card", style: { ...o.card, textAlign: "center" }, children: [
        /* @__PURE__ */ r("div", { style: { fontSize: 28, marginBottom: 8 }, children: "⚡" }),
        /* @__PURE__ */ r("div", { style: { fontSize: 15, fontWeight: 700 }, children: "No task in focus" }),
        /* @__PURE__ */ r("p", { style: { color: t.muted, fontSize: 12, margin: "6px 0 14px" }, children: "Add your first task — the taskmaster agent can draft its micro-steps." }),
        De()
      ] });
    const e = C, n = Ze ?? { done: 0, total: 0, pct: 0 }, c = Z(e), s = re[e.id] ?? null, l = !!(b && (s == null ? void 0 : s.kind) === "step" && s.stepIndex === F), m = (s == null ? void 0 : s.kind) === "draft", p = (s == null ? void 0 : s.kind) === "all";
    return /* @__PURE__ */ u(me, { children: [
      /* @__PURE__ */ u("section", { className: "tm-card", style: { ...o.card, paddingTop: 20, position: "relative", overflow: "hidden" }, children: [
        /* @__PURE__ */ r("div", { style: o.gradientStrip }),
        /* @__PURE__ */ u("div", { style: o.centerCol, children: [
          /* @__PURE__ */ u("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }, children: [
            /* @__PURE__ */ r("span", { style: { ...o.chip, color: t.focus, borderColor: "rgba(52,211,153,0.35)", background: "rgba(52,211,153,0.08)" }, children: "★ TASKMASTER ACTIVE" }),
            /* @__PURE__ */ u(
              "button",
              {
                className: "tm-btn",
                style: {
                  ...o.chip,
                  cursor: "pointer",
                  ...Le ? { color: t.kiro, borderColor: "rgba(129,140,248,0.35)", background: "rgba(129,140,248,0.08)" } : { color: t.muted, borderColor: t.border, background: "transparent" }
                },
                title: "One lesson is stored per completed task when ON",
                onClick: () => v((f) => ({ ...f, settings: { memorySync: !f.settings.memorySync } })),
                children: [
                  "🧠 MEMORY SYNC: ",
                  Le ? "ON" : "OFF"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ r("p", { style: { color: t.muted, fontSize: 11, fontStyle: "italic", margin: "10px 0 6px" }, children: "Isolation mode active. Execute one step at a time." }),
          /* @__PURE__ */ r("h2", { style: o.taskTitle, children: e.title }),
          /* @__PURE__ */ u("div", { style: { display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", justifyContent: "center" }, children: [
            e.estimateMinutes != null && /* @__PURE__ */ u("span", { style: { ...o.chip, color: "#38bdf8", borderColor: t.border, fontFamily: D }, children: [
              "~",
              e.estimateMinutes,
              "m"
            ] }),
            /* @__PURE__ */ r("button", { className: "tm-btn", style: { ...o.chip, cursor: "pointer", color: t.text, borderColor: t.border }, onClick: () => void Xe(e), children: "⏰ SCHEDULE ROUTINE (CRON)" }),
            /* @__PURE__ */ r("button", { className: "tm-btn", style: { ...o.chip, cursor: "pointer", color: t.text, borderColor: t.border }, onClick: () => Ae(e), children: "💬 OPEN IN CHAT" })
          ] })
        ] }),
        /* @__PURE__ */ r("div", { style: o.progressTrack, role: "progressbar", "aria-valuenow": n.pct, "aria-valuemin": 0, "aria-valuemax": 100, children: /* @__PURE__ */ r("div", { style: { ...o.progressFill, width: `${n.pct}%` } }) }),
        /* @__PURE__ */ u("div", { style: { textAlign: "right", color: t.muted, fontSize: 11, marginTop: 6, fontFamily: D }, children: [
          n.done,
          "/",
          n.total,
          " · ",
          n.pct,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ u("section", { className: "tm-card", style: { ...o.card, borderColor: "rgba(52,211,153,0.3)" }, children: [
        /* @__PURE__ */ u("div", { style: o.stepHeader, children: [
          /* @__PURE__ */ u("span", { style: { ...o.stepCounter, color: t.focus }, children: [
            /* @__PURE__ */ r("span", { className: "tm-pulse", style: o.pulseDot }),
            e.subtasks.length === 0 ? "NO MICRO-STEPS YET" : `ACTIVE MICRO-STEP ${F + 1} OF ${e.subtasks.length}`
          ] }),
          /* @__PURE__ */ u("span", { style: { display: "flex", gap: 6, alignItems: "center" }, children: [
            s && /* @__PURE__ */ r(
              "button",
              {
                className: "tm-btn",
                style: { ...o.btnGhost, color: t.danger, borderColor: "rgba(229,83,75,0.45)" },
                title: "Stops Taskmaster waiting; the underlying agent turn may continue in the task chat.",
                "aria-label": "Stop waiting for the agent run",
                onClick: () => void He(e),
                children: "STOP WAITING"
              }
            ),
            /* @__PURE__ */ r("button", { className: "tm-btn", style: o.navBtn, onClick: () => J(e.id, Math.max(0, F - 1)), children: "◄" }),
            /* @__PURE__ */ r(
              "button",
              {
                className: "tm-btn",
                style: o.navBtn,
                onClick: () => J(e.id, Math.min(e.subtasks.length - 1, F + 1)),
                children: "►"
              }
            )
          ] })
        ] }),
        b ? /* @__PURE__ */ u("div", { style: { display: "flex", gap: 14, alignItems: "flex-start" }, children: [
          /* @__PURE__ */ r(
            "button",
            {
              className: "tm-btn",
              style: o.checkBtn,
              "aria-label": b.done ? "Mark step incomplete" : "Mark step complete",
              onClick: () => Y(e.id, b.id, !b.done),
              children: b.done ? /* @__PURE__ */ r("span", { style: { ...o.checkCircle, background: "rgba(52,211,153,0.18)", borderColor: "rgba(52,211,153,0.5)", color: t.focus }, children: "✓" }) : /* @__PURE__ */ r("span", { style: { ...o.checkCircle, borderColor: "#475569", color: "transparent" }, children: "✓" })
            }
          ),
          /* @__PURE__ */ u("div", { style: { flex: 1, minWidth: 0 }, children: [
            /* @__PURE__ */ r(
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
            b.command && /* @__PURE__ */ u("div", { style: o.commandBox, children: [
              /* @__PURE__ */ u("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
                /* @__PURE__ */ r("span", { style: o.commandLabel, children: "KIRO TERMINAL EXECUTABLE" }),
                /* @__PURE__ */ u("span", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
                  b.runState === "failed" && !l && /* @__PURE__ */ r("span", { style: { ...o.execChip, ...o.failedChip }, children: "LAST RUN FAILED" }),
                  /* @__PURE__ */ r("span", { style: { ...o.commandLabel, color: t.kiro }, children: "VIA TASKMASTER AGENT" })
                ] })
              ] }),
              /* @__PURE__ */ r("code", { style: o.commandCode, children: b.command }),
              /* @__PURE__ */ r("div", { children: /* @__PURE__ */ r(
                "button",
                {
                  className: "tm-btn",
                  style: {
                    ...o.btnPrimary,
                    ...b.done ? { opacity: 0.5, cursor: "default" } : {},
                    ...l ? { background: "rgba(129,140,248,0.25)", color: t.kiro } : {}
                  },
                  disabled: b.done || !!s,
                  onClick: () => _e(e, b, F),
                  children: l ? "⚙ EXECUTING VIA AGENT…" : b.done ? "✓ COMPLETED" : b.runState === "failed" ? "↻ RETRY VIA AGENT" : "▶ RUN COMMAND NATIVELY"
                }
              ) }),
              (l || b.output) && /* @__PURE__ */ r(
                "div",
                {
                  style: {
                    ...o.outputPre,
                    // Always longhand: toggling borderColor against the
                    // shorthand `border` triggers a React style warning.
                    borderColor: b.runState === "failed" && !l ? "rgba(229,83,75,0.45)" : t.border
                  },
                  children: l ? `$ ${b.command}
… taskmaster agent is executing — the reply lands here and in the task chat below` : /* @__PURE__ */ r(ut, { content: b.output ?? "" })
                }
              )
            ] }),
            /* @__PURE__ */ r("p", { style: { color: t.muted, fontSize: 11, marginTop: 10 }, children: "Focus purely on completing this single micro-step." })
          ] })
        ] }) : /* @__PURE__ */ r("p", { style: { color: t.muted, fontSize: 12 }, children: "No micro-steps yet — add one, or let the taskmaster agent draft the breakdown." }),
        /* @__PURE__ */ u("div", { style: { borderTop: `1px solid ${t.border}`, marginTop: 18, paddingTop: 12 }, children: [
          /* @__PURE__ */ u("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 8, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ u("span", { style: o.queueLabel, children: [
              "ALL SUBTASKS (",
              n.done,
              "/",
              n.total,
              " COMPLETED)"
            ] }),
            /* @__PURE__ */ u("span", { style: { display: "flex", gap: 6 }, children: [
              /* @__PURE__ */ r(
                "button",
                {
                  className: "tm-btn",
                  style: { ...o.btnGhost, ...m ? { color: t.kiro } : {} },
                  disabled: !!s,
                  onClick: () => Ee(e),
                  children: m ? "⚙ AGENT DRAFTING…" : "✦ DRAFT STEPS WITH AI"
                }
              ),
              /* @__PURE__ */ r(
                "button",
                {
                  className: "tm-btn",
                  style: { ...o.btnGhost, ...p ? { color: t.kiro } : { color: t.focus, borderColor: "rgba(52,211,153,0.3)" } },
                  disabled: !!s || X === 0,
                  onClick: () => Ye(e),
                  children: p ? "⚙ AGENT RUNNING STEPS…" : `▶ RUN REMAINING (${X})`
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ r("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: e.subtasks.map((f, y) => {
            const w = y === F;
            return /* @__PURE__ */ u(
              "div",
              {
                style: { ...o.queueRow, ...w ? o.queueRowActive : {} },
                onClick: () => J(e.id, y),
                children: [
                  /* @__PURE__ */ u("span", { style: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 }, children: [
                    /* @__PURE__ */ r(
                      "button",
                      {
                        className: "tm-btn",
                        style: o.queueCheck,
                        "aria-label": f.done ? "Mark incomplete" : "Mark complete",
                        onClick: (O) => {
                          O.stopPropagation(), Y(e.id, f.id, !f.done);
                        },
                        children: f.done ? /* @__PURE__ */ r("span", { style: { color: t.focus, fontWeight: 700 }, children: "✓" }) : /* @__PURE__ */ r("span", { style: { color: "#475569" }, children: "○" })
                      }
                    ),
                    /* @__PURE__ */ u(
                      "button",
                      {
                        className: "tm-btn",
                        style: o.queueSelect,
                        "aria-current": w || void 0,
                        onClick: (O) => {
                          O.stopPropagation(), J(e.id, y);
                        },
                        children: [
                          /* @__PURE__ */ r("span", { style: { fontSize: 12, ...f.done ? { textDecoration: "line-through", color: t.muted } : {} }, children: f.title }),
                          /* @__PURE__ */ u("span", { style: { display: "flex", gap: 6, marginTop: 2 }, children: [
                            f.runState === "failed" && !f.done && /* @__PURE__ */ r("span", { style: { ...o.execChip, ...o.failedChip }, children: "FAILED" }),
                            f.command && !f.done && /* @__PURE__ */ r("span", { style: o.execChip, children: "EXECUTABLE" }),
                            f.source === "agent" && /* @__PURE__ */ r("span", { style: { ...o.execChip, color: t.kiro, borderColor: "rgba(129,140,248,0.3)", background: "rgba(129,140,248,0.08)" }, children: "AGENT-DRAFTED" })
                          ] })
                        ]
                      }
                    )
                  ] }),
                  w && /* @__PURE__ */ r("span", { style: o.activeChip, children: "ACTIVE" })
                ]
              },
              f.id
            );
          }) }),
          /* @__PURE__ */ u("div", { style: { ...o.addRow, marginTop: 10 }, children: [
            /* @__PURE__ */ r(
              "input",
              {
                style: { ...o.input, flex: 2 },
                placeholder: "Add micro-step…",
                value: ye,
                onChange: (f) => ke(f.target.value),
                onKeyDown: (f) => {
                  f.key === "Enter" && ce(e);
                }
              }
            ),
            /* @__PURE__ */ r(
              "input",
              {
                style: { ...o.input, flex: 3, fontFamily: D, fontSize: 11 },
                placeholder: "optional terminal command",
                value: xe,
                onChange: (f) => Se(f.target.value),
                onKeyDown: (f) => {
                  f.key === "Enter" && ce(e);
                }
              }
            ),
            /* @__PURE__ */ r("button", { className: "tm-btn", style: o.btnGhost, onClick: () => ce(e), children: "ADD" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ u("section", { className: "tm-card", style: { ...o.card, padding: 0, overflow: "hidden" }, children: [
        /* @__PURE__ */ u(
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
              /* @__PURE__ */ r("span", { style: o.queueLabel, children: "TASK AGENT SESSION" }),
              /* @__PURE__ */ u("span", { style: { ...o.execChip, color: t.kiro, borderColor: "rgba(129,140,248,0.3)", background: "rgba(129,140,248,0.08)" }, children: [
                c,
                " · taskmaster"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ r("div", { style: { height: 380 }, children: /* @__PURE__ */ r(
          ct,
          {
            slotKey: c,
            agent: "taskmaster",
            frameless: !0,
            startAtBottom: !0,
            placeholder: "Message the taskmaster agent about this task…"
          }
        ) })
      ] })
    ] });
  }
  function nt() {
    return /* @__PURE__ */ u(me, { children: [
      /* @__PURE__ */ u("section", { className: "tm-card", style: o.card, children: [
        /* @__PURE__ */ u("div", { style: { ...o.queueLabel, marginBottom: 10 }, children: [
          "ALL BACKLOGS (",
          Me,
          " TASKS)"
        ] }),
        De()
      ] }),
      S.tasks.map((e) => {
        const n = Oe(e), c = e.id === (C == null ? void 0 : C.id), s = re[e.id] ?? null, l = (s == null ? void 0 : s.kind) === "draft";
        return /* @__PURE__ */ u(
          "section",
          {
            className: "tm-card",
            style: { ...o.card, ...c ? { borderColor: "rgba(52,211,153,0.4)" } : {} },
            children: [
              /* @__PURE__ */ u("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }, children: [
                /* @__PURE__ */ r("span", { style: { fontWeight: 600, fontSize: 14, minWidth: 0 }, children: e.title }),
                /* @__PURE__ */ u("span", { style: { display: "flex", gap: 6, flexWrap: "wrap" }, children: [
                  e.estimateMinutes != null && /* @__PURE__ */ u("span", { style: { ...o.chip, color: "#38bdf8", borderColor: t.border, fontFamily: D }, children: [
                    "~",
                    e.estimateMinutes,
                    "m"
                  ] }),
                  /* @__PURE__ */ r("button", { className: "tm-btn", style: { ...o.btnGhost, color: t.focus, borderColor: "rgba(52,211,153,0.3)" }, onClick: () => Qe(e.id), children: "FOCUS" }),
                  /* @__PURE__ */ r(
                    "button",
                    {
                      className: "tm-btn",
                      style: { ...o.btnGhost, ...l ? { color: t.kiro } : {} },
                      disabled: !!s,
                      onClick: () => Ee(e),
                      children: l ? "⚙ DRAFTING…" : "✦ DRAFT STEPS"
                    }
                  ),
                  /* @__PURE__ */ r("button", { className: "tm-btn", style: o.btnGhost, onClick: () => Ae(e), children: "💬 CHAT" }),
                  /* @__PURE__ */ r(
                    "button",
                    {
                      className: "tm-btn",
                      style: { ...o.btnGhost, ...te === e.id ? { color: t.danger, borderColor: t.danger } : {} },
                      onClick: () => te === e.id ? Je(e.id) : ne(e.id),
                      onBlur: () => ne(null),
                      children: te === e.id ? "SURE?" : "DELETE"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ r("div", { style: { ...o.progressTrack, marginTop: 12 }, children: /* @__PURE__ */ r("div", { style: { ...o.progressFill, width: `${n.pct}%` } }) }),
              /* @__PURE__ */ u("div", { style: { display: "flex", flexDirection: "column", gap: 4, marginTop: 10 }, children: [
                e.subtasks.length === 0 && /* @__PURE__ */ r("span", { style: { color: t.muted, fontSize: 11 }, children: "No micro-steps yet." }),
                e.subtasks.map((m) => {
                  const p = m.runState === "failed" && !m.done;
                  return /* @__PURE__ */ u("div", { style: o.backlogSubRow, children: [
                    /* @__PURE__ */ r("span", { style: { color: m.done ? t.focus : p ? t.danger : "#475569" }, children: m.done ? "✓" : p ? "✗" : "○" }),
                    /* @__PURE__ */ r("span", { style: { fontSize: 11, ...m.done ? { textDecoration: "line-through", color: t.muted } : {} }, children: m.title }),
                    p && /* @__PURE__ */ r("span", { style: { ...o.execChip, ...o.failedChip }, children: "FAILED" })
                  ] }, m.id);
                })
              ] })
            ]
          },
          e.id
        );
      })
    ] });
  }
  function rt() {
    return /* @__PURE__ */ u(me, { children: [
      /* @__PURE__ */ u("section", { className: "tm-card", style: o.card, children: [
        /* @__PURE__ */ u("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }, children: [
          /* @__PURE__ */ r("span", { style: o.queueLabel, children: "KIRO GATEWAY" }),
          /* @__PURE__ */ r(
            "button",
            {
              className: "tm-btn",
              style: o.btnGhost,
              onClick: () => {
                i.get("/api/status").then((e) => {
                  B(typeof e == "object" && e !== null ? e : {}), g("ok", "Gateway status refreshed.");
                }).catch((e) => g("warn", `Status refresh failed: ${String(e)}`));
              },
              children: "REFRESH"
            }
          )
        ] }),
        /* @__PURE__ */ u("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ r(ee, { label: "STATUS", value: h ? "ONLINE" : "UNKNOWN", accent: h ? t.focus : t.warn }),
          /* @__PURE__ */ r(ee, { label: "VERSION", value: String((h == null ? void 0 : h.version) ?? "—"), accent: t.kiro }),
          /* @__PURE__ */ r(ee, { label: "UPTIME", value: String((h == null ? void 0 : h.uptime) ?? "—"), accent: t.text }),
          /* @__PURE__ */ r(ee, { label: "PROVIDER", value: String((h == null ? void 0 : h.provider) ?? "—"), accent: t.text })
        ] })
      ] }),
      /* @__PURE__ */ u("section", { className: "tm-card", style: { ...o.card, fontFamily: D }, children: [
        /* @__PURE__ */ u("div", { style: { display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", borderBottom: `1px solid ${t.border}`, paddingBottom: 8, marginBottom: 10 }, children: [
          /* @__PURE__ */ r("span", { style: { color: t.muted, fontSize: 11 }, children: "Taskmaster activity + gateway console" }),
          /* @__PURE__ */ r("span", { style: { ...o.execChip, color: t.muted }, children: Ue })
        ] }),
        /* @__PURE__ */ u("div", { style: { display: "flex", flexDirection: "column", gap: 6, maxHeight: 380, overflowY: "auto" }, children: [
          W.length === 0 && /* @__PURE__ */ r("span", { style: { color: t.muted, fontSize: 11 }, children: "No events yet." }),
          W.map((e, n) => /* @__PURE__ */ u("div", { style: { display: "flex", gap: 10, alignItems: "flex-start" }, children: [
            /* @__PURE__ */ r("span", { style: { color: "#475569", fontSize: 10, flexShrink: 0, paddingTop: 1 }, children: e.ts }),
            /* @__PURE__ */ r(
              "span",
              {
                style: {
                  ...o.levelChip,
                  ...e.level === "ok" ? { background: "rgba(52,211,153,0.15)", color: t.focus } : e.level === "warn" ? { background: "rgba(210,153,34,0.15)", color: t.warn } : e.level === "err" ? { background: "rgba(229,83,75,0.15)", color: t.danger } : { background: "rgba(148,163,184,0.12)", color: t.muted }
                },
                children: e.level.toUpperCase()
              }
            ),
            /* @__PURE__ */ r("span", { style: { fontSize: 11, color: t.text, wordBreak: "break-word" }, children: e.msg })
          ] }, `${e.ts}-${n}`))
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ u("div", { style: o.root, children: [
    /* @__PURE__ */ r("style", { children: Rt }),
    /* @__PURE__ */ u("header", { style: o.header, children: [
      /* @__PURE__ */ u("span", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
        /* @__PURE__ */ r("span", { style: o.logoBox, "aria-hidden": "true", children: /* @__PURE__ */ r("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "#030712", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ r("path", { d: "M13 10V3L4 14h7v7l9-11h-7z" }) }) }),
        /* @__PURE__ */ u("span", { children: [
          /* @__PURE__ */ r("span", { style: o.brandTitle, children: "Taskmaster Pro" }),
          /* @__PURE__ */ r("span", { style: { ...o.chip, marginLeft: 8, color: t.kiro, borderColor: "rgba(129,140,248,0.3)", background: "rgba(129,140,248,0.08)" }, children: "EXECUTION ENGINE" }),
          /* @__PURE__ */ r("div", { style: { color: t.muted, fontSize: 10, marginTop: 2 }, children: "Task focus · agent-run commands · memory sync" })
        ] })
      ] }),
      et()
    ] }),
    P && /* @__PURE__ */ r("div", { style: o.errorBanner, children: P }),
    Q
  ] });
}
function ee({ label: i, value: d, accent: a }) {
  return /* @__PURE__ */ u("div", { style: o.statBox, children: [
    /* @__PURE__ */ r("div", { style: { color: t.muted, fontSize: 9, letterSpacing: "0.1em", marginBottom: 4 }, children: i }),
    /* @__PURE__ */ r("div", { style: { color: a, fontSize: 13, fontWeight: 700, fontFamily: D, wordBreak: "break-all" }, children: d })
  ] });
}
const Rt = `
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
  commandLabel: { fontSize: 9, letterSpacing: "0.14em", color: t.muted, fontFamily: D },
  commandCode: {
    display: "block",
    padding: 8,
    borderRadius: 8,
    border: `1px solid ${t.border}`,
    background: t.card,
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
    fontFamily: D,
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
    color: t.focus,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: "0.08em",
    fontFamily: D
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
  Lt as default
};
