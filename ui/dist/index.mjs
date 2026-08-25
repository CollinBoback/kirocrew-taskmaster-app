import { jsx as r, jsxs as u, Fragment as pe } from "react/jsx-runtime";
import { useState as $, useRef as O, useCallback as E, useEffect as me, useMemo as rt } from "react";
import { useAppApi as ot, useNotify as st, useNavBadge as it, useChatLauncher as at, useAppEvents as lt, ChatEmbed as dt } from "@kirocrew/app-sdk";
import { MarkdownRenderer as ct } from "@kirocrew/ui";
function Z(s) {
  return `taskmaster-${s.id}`;
}
let Le = 0;
function H(s) {
  return Le += 1, `${s}-${Date.now().toString(36)}-${Le.toString(36)}`;
}
function ut() {
  return { version: 1, settings: { memorySync: !0 }, activeTaskId: null, tasks: [] };
}
function pt(s) {
  var I;
  const l = ut();
  if (typeof s != "object" || s === null) return l;
  const a = s, k = Array.isArray(a.tasks) ? a.tasks.filter(Ge).map(mt) : l.tasks, S = typeof a.settings == "object" && a.settings !== null ? { memorySync: a.settings.memorySync !== !1 } : l.settings, A = typeof a.activeTaskId == "string" ? a.activeTaskId : null;
  return {
    version: 1,
    settings: S,
    activeTaskId: k.some((N) => N.id === A) ? A : ((I = k[0]) == null ? void 0 : I.id) ?? null,
    tasks: k
  };
}
function Ge(s) {
  return typeof s == "object" && s !== null && typeof s.title == "string";
}
function mt(s) {
  const l = Array.isArray(s.subtasks) ? s.subtasks.filter(Ge).map((a) => ({
    id: typeof a.id == "string" ? a.id : H("sub"),
    title: String(a.title),
    done: a.done === !0,
    ...typeof a.command == "string" && a.command.trim() ? { command: a.command } : {},
    ...typeof a.output == "string" && a.output ? { output: a.output } : {},
    ...a.runState === "done" || a.runState === "failed" ? { runState: a.runState } : {},
    ...a.source === "agent" || a.source === "manual" ? { source: a.source } : {}
  })) : [];
  return {
    id: typeof s.id == "string" ? s.id : H("task"),
    title: String(s.title),
    ...typeof s.estimateMinutes == "number" && s.estimateMinutes > 0 ? { estimateMinutes: Math.round(s.estimateMinutes) } : {},
    createdAt: typeof s.createdAt == "string" ? s.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
    subtasks: l,
    ...s.lessonPosted === !0 ? { lessonPosted: !0 } : {},
    ...s.slotStarted === !0 ? { slotStarted: !0 } : {}
  };
}
function De(s) {
  const l = s.subtasks.length, a = s.subtasks.filter((k) => k.done).length;
  return { done: a, total: l, pct: l === 0 ? 0 : Math.round(a / l * 100) };
}
function ft(s) {
  const l = s.subtasks.findIndex((a) => !a.done);
  return l === -1 ? Math.max(0, s.subtasks.length - 1) : l;
}
function gt(s) {
  const l = /```(?:json)?\s*([\s\S]*?)```/.exec(s), a = [];
  l != null && l[1] && a.push(l[1]);
  const k = s.indexOf("["), S = s.lastIndexOf("]");
  k !== -1 && S > k && a.push(s.slice(k, S + 1));
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
function ht(s) {
  const l = s.subtasks.map((a, k) => `${k + 1}. ${a.title}${a.command ? ` [${a.command}]` : ""}`);
  return `Completed "${s.title}" via micro-steps: ${l.join(" ")}`;
}
const bt = 900 * 1e3;
function yt(s, l, a = bt) {
  return l - s.sentAt > a;
}
function kt(s) {
  if (typeof s == "object" && s !== null) {
    const a = s;
    if (a.status === 404 || a.statusCode === 404 || typeof a.response == "object" && a.response !== null && a.response.status === 404)
      return !0;
  }
  const l = s instanceof Error ? s.message : String(s);
  return /(?:^|\D)404(?:\D|$)|slot not found/i.test(l);
}
function Be(s, l) {
  return s !== void 0 ? s : l.status === "loaded" ? l.messageCount : l.status === "missing" ? 0 : null;
}
function ze(s, l) {
  return Math.max(s ?? 0, Math.max(0, l));
}
function Oe(s, l, a = !1) {
  return !a && s === l;
}
function xt(s) {
  if (typeof s != "object" || s === null) return { messages: [], running: !1 };
  const l = s;
  return { messages: Array.isArray(l.messages) ? l.messages.filter((k) => typeof k == "object" && k !== null) : [], running: l.running === !0 };
}
const We = /^\s*STEP RESULT \[(\d+)\]:\s*(done|failed)\s*(?:[—–:-]\s*)?(.*)$/gim;
function St(s) {
  const l = [];
  We.lastIndex = 0;
  let a;
  for (; (a = We.exec(s)) !== null; )
    l.push({
      index: Number.parseInt(a[1], 10),
      ok: a[2].toLowerCase() === "done",
      summary: a[3].trim()
    });
  return l;
}
const Fe = 4e3;
function Ct(s) {
  const { work: l, data: a, seen: k, stepCount: S } = s, A = a.running ? Math.max(0, a.messages.length - 1) : a.messages.length, I = a.messages.slice(k, A), N = Math.max(k, A);
  if (S === null)
    return { actions: [], nextSeen: N, sawReply: s.sawReply, settled: !0, stepSucceeded: !1 };
  const x = [];
  let U = s.sawReply, W = !1, q = !1;
  for (const b of I) {
    if (b.role === "user" || !b.content) continue;
    U = !0;
    const B = b.content;
    if (l.kind === "draft") {
      const w = gt(B);
      w && (x.push({ type: "append-draft", steps: w }), W = !0);
      continue;
    }
    const F = St(B);
    for (const w of F) {
      if (w.index < 1 || w.index > S) {
        x.push({ type: "unknown-step", result: w });
        continue;
      }
      const V = F.length === 1 ? B.slice(0, Fe) : `${w.ok ? "done" : "failed"} — ${w.summary || "(no summary)"}`;
      x.push({ type: "step-result", result: w, output: V }), w.ok && (q = !0), l.kind === "step" && (W = !0);
    }
  }
  if (W && l.kind !== "all")
    return { actions: x, nextSeen: N, sawReply: U, settled: !0, stepSucceeded: q };
  if (!a.running && U) {
    const b = [...I].reverse().find((B) => B.role !== "user" && B.content);
    x.push({
      type: "turn-ended",
      kind: l.kind,
      ...l.kind === "step" && (b != null && b.content) ? { output: b.content.slice(0, Fe) } : {}
    }), W = !0;
  }
  return { actions: x, nextSeen: N, sawReply: U, settled: W, stepSucceeded: q };
}
const je = "/api/apps/taskmaster-pro/config", vt = 200, Pe = "notification scope · slot polling", wt = 2500, t = {
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
function Tt() {
  return (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0];
}
function Mt() {
  const s = ot(), l = st(), a = it(), { openChat: k } = at(), [S, A] = $(null), [I, N] = $("focus"), [x, U] = $({}), [W, q] = $([]), [b, B] = $(null), [F, w] = $(null), [V, fe] = $(""), [ge, he] = $(""), [be, ye] = $(""), [ke, xe] = $(""), [te, ne] = $(null), [T, Se] = $(null), j = O(null);
  j.current = S;
  const Ce = O(Promise.resolve()), ve = O(0), re = O({}), R = O(!1), M = O(null), L = O({}), _ = O(/* @__PURE__ */ new Set()), oe = O(!1), Ue = E((e) => {
    M.current = e, Se(e);
  }, []), Y = E((e) => M.current !== e ? !1 : (M.current = null, Se(null), !0), []), g = E((e, n) => {
    q((c) => [{ ts: Tt(), level: e, msg: n }, ...c].slice(0, vt));
  }, []), we = E(
    (e) => {
      A(e), j.current = e;
      const n = ++ve.current;
      Ce.current = Ce.current.then(async () => {
        if (n === ve.current)
          try {
            await s.put(je, e);
          } catch (c) {
            g("warn", `Config save failed: ${String(c)}`);
          }
      });
    },
    [s, g]
  ), v = E(
    (e) => {
      const n = j.current;
      n && we(e(n));
    },
    [we]
  ), se = E(
    (e) => {
      s.get(je).then((n) => {
        e != null && e() || (A(pt(n)), w(null), g("info", "Loaded task state from gateway app config."));
      }).catch((n) => {
        e != null && e() || (A(null), w(`Config load failed (${String(n)}) — retry to continue.`), g("warn", `Config load failed: ${String(n)}`));
      });
    },
    [s, g]
  );
  me(() => {
    let e = !1;
    return se(() => e), s.get("/api/status").then((n) => {
      e || (B(typeof n == "object" && n !== null ? n : {}), g("ok", "Connected to Kiro Crew gateway."));
    }).catch(() => {
      e || g("warn", "Gateway status unavailable.");
    }), g("info", `Console mode: ${Pe} — gateway event forwarding to app pages is pending upstream.`), () => {
      e = !0;
    };
  }, [se]);
  const Te = E(
    (e) => {
      l(`Task complete: ${e.title}`), g("ok", `Task "${e.title}" fully completed.`);
      const n = j.current;
      !(n != null && n.settings.memorySync) || e.lessonPosted || re.current[e.id] || (re.current[e.id] = !0, s.post("/api/lessons", { rule: ht(e), category: "knowledge" }).then(() => {
        v((c) => ({
          ...c,
          tasks: c.tasks.map((i) => i.id === e.id ? { ...i, lessonPosted: !0 } : i)
        })), g("ok", "Kiro Memory: appended solution path to lessons (category: knowledge).");
      }).catch((c) => g("warn", `Memory sync failed: ${String(c)}`)).finally(() => {
        delete re.current[e.id];
      }));
    },
    [s, l, g, v]
  ), X = E(
    (e, n, c, i, d) => {
      let f = null;
      v((p) => {
        const m = p.tasks.map((h) => {
          if (h.id !== e) return h;
          const z = h.subtasks.map((G) => {
            if (G.id !== n) return G;
            const ue = { ...G, done: c, ...i !== void 0 ? { output: i } : {} };
            return d ? ue.runState = d : delete ue.runState, ue;
          }), K = { ...h, subtasks: z }, nt = h.subtasks.length > 0 && h.subtasks.every((G) => G.done);
          return z.length > 0 && z.every((G) => G.done) && !nt && (f = K), K;
        });
        return { ...p, tasks: m };
      }), f && Te(f);
    },
    [v, Te]
  );
  lt("notification", (e) => {
    const n = typeof e == "object" && e !== null ? e : {}, c = typeof n.title == "string" ? n.title : "notification", i = typeof n.text == "string" ? n.text : "";
    g("info", `Gateway notification [${c}]: ${i.slice(0, 200)}`);
  });
  const Ie = E(
    (e, n) => {
      v((c) => ({
        ...c,
        tasks: c.tasks.map((i) => {
          if (i.id !== e) return i;
          const d = new Set(i.subtasks.map((p) => p.title.toLowerCase())), f = n.filter((p) => !d.has(p.title.toLowerCase())).map((p) => ({ id: H("sub"), title: p.title, done: !1, source: "agent", ...p.command ? { command: p.command } : {} }));
          return { ...i, subtasks: [...i.subtasks, ...f] };
        })
      })), g("ok", `Taskmaster agent drafted ${n.length} micro-step(s).`), l(`Added ${n.length} drafted micro-steps`);
    },
    [g, v, l]
  ), ie = E(
    async (e) => xt(await s.get(`/api/chat/slots/${encodeURIComponent(e)}`)),
    [s]
  ), ae = E(
    (e, n, c, i) => {
      v((d) => ({
        ...d,
        tasks: d.tasks.map(
          (f) => f.id === e ? {
            ...f,
            subtasks: f.subtasks.map(
              (p) => p.id === n ? { ...p, output: c, ...i ? { runState: i } : {} } : p
            )
          } : f
        )
      }));
    },
    [v]
  );
  async function le(e, n, c) {
    if (M.current || R.current) return;
    R.current = !0;
    const i = Z(e), d = _.current.has(i);
    if (L.current[i] === void 0 || d)
      try {
        const p = await ie(i);
        if (d && p.running) {
          R.current = !1, g("info", "The stopped agent turn is still running in chat; request was not sent."), l("The previous agent turn is still finishing — retry after it ends");
          return;
        }
        const m = p.messages.length, h = d ? ze(L.current[i], m) : Be(L.current[i], {
          status: "loaded",
          messageCount: m
        });
        if (h === null) {
          R.current = !1;
          return;
        }
        L.current[i] = h, _.current.delete(i);
      } catch (p) {
        const m = kt(p);
        if (d && !m) {
          R.current = !1, g("info", `Could not verify that the stopped agent turn ended: ${String(p)}`), l("Could not verify the previous agent turn — retry after it ends", { type: "error" });
          return;
        }
        const h = Be(
          L.current[i],
          m ? { status: "missing" } : { status: "failed" }
        );
        if (h === null) {
          R.current = !1, g("warn", `Could not safely read task chat history; request was not sent: ${String(p)}`), l("Could not verify task chat history — retry the run", { type: "error" });
          return;
        }
        L.current[i] = h, _.current.delete(i);
      }
    oe.current = !1;
    const f = { ...c, sentAt: Date.now() };
    R.current = !1, Ue(f), e.slotStarted || v((p) => ({
      ...p,
      tasks: p.tasks.map((m) => m.id === e.id ? { ...m, slotStarted: !0 } : m)
    })), s.post("/api/chat", { message: n, slot: i, agent: "taskmaster" }).catch((p) => {
      p instanceof SyntaxError || (g("err", `Send to task slot failed: ${String(p)}`), l("Could not reach the gateway", { type: "error" }), Y(f));
    }), g("info", `Sent to task slot ${i}: ${n.split(`
`)[0].slice(0, 120)}`);
  }
  async function Ke(e) {
    const n = M.current;
    if (!n || n.taskId !== e.id || !Y(n)) return;
    const c = Z(e);
    _.current.add(c), R.current = !0, g("warn", "Stopped waiting for the agent; its turn may continue in the task chat."), l("Stopped waiting — the agent may continue in the task chat");
    try {
      const i = await ie(c);
      L.current[c] = ze(L.current[c], i.messages.length);
    } catch {
    } finally {
      R.current = !1;
    }
  }
  const qe = E(
    (e, n) => {
      var c, i;
      for (const d of n) {
        if (d.type === "append-draft") {
          Ie(e.taskId, d.steps);
          continue;
        }
        if (d.type === "unknown-step") {
          g("warn", `Agent reported STEP RESULT [${d.result.index}] but the task has no such step.`);
          continue;
        }
        if (d.type === "step-result") {
          const f = (c = j.current) == null ? void 0 : c.tasks.find((m) => m.id === e.taskId), p = f == null ? void 0 : f.subtasks[d.result.index - 1];
          if (!p) continue;
          d.result.ok ? (X(e.taskId, p.id, !0, d.output, "done"), g("ok", `Step ${d.result.index} completed by agent: ${d.result.summary || p.title}`)) : (ae(e.taskId, p.id, d.output, "failed"), g("warn", `Step ${d.result.index} failed: ${d.result.summary || "(no summary)"}`));
          continue;
        }
        if (d.kind === "all")
          g("ok", "Agent finished the run — see per-step results above and the task chat.");
        else if (d.kind === "draft")
          g("warn", "Draft reply had no parseable json block — see the task chat."), l("Agent reply was not parseable — see the task chat");
        else {
          const f = (i = j.current) == null ? void 0 : i.tasks.find((m) => m.id === e.taskId), p = e.stepIndex != null ? f == null ? void 0 : f.subtasks[e.stepIndex] : void 0;
          p && d.output && ae(e.taskId, p.id, d.output), g("warn", "Agent reply had no STEP RESULT marker — step left for manual toggle.");
        }
      }
    },
    [g, Ie, l, ae, X]
  );
  me(() => {
    if (!T) return;
    const e = Z({ id: T.taskId });
    let n = !1;
    const c = async () => {
      var z;
      const d = M.current;
      if (!d || !Oe(M.current, d, n)) return;
      if (yt(d, Date.now())) {
        g("warn", "Agent request timed out — check the task chat."), Y(d);
        return;
      }
      let f;
      try {
        f = await ie(e);
      } catch {
        return;
      }
      if (!Oe(M.current, d, n)) return;
      const p = L.current[e] ?? 0, m = (z = j.current) == null ? void 0 : z.tasks.find((K) => K.id === d.taskId), h = Ct({
        work: d,
        data: f,
        seen: p,
        sawReply: oe.current,
        stepCount: (m == null ? void 0 : m.subtasks.length) ?? null
      });
      L.current[e] = h.nextSeen, oe.current = h.sawReply, qe(d, h.actions), h.settled && (d.kind === "step" && h.stepSucceeded && l("Step completed via taskmaster agent", { type: "success" }), Y(d));
    }, i = setInterval(() => void c(), wt);
    return c(), () => {
      n = !0, clearInterval(i);
    };
  }, [T == null ? void 0 : T.sentAt]);
  function He(e, n, c) {
    !n.command || M.current || R.current || (g("info", `Kiro terminal execute (step ${c + 1}): ${n.command}`), le(
      e,
      `Run micro-step [${c + 1}] of task "${e.title}": ${n.title}
Execute this terminal command and report concise output:
${n.command}
End your reply with exactly one line: STEP RESULT [${c + 1}]: done|failed — <short summary>`,
      { taskId: e.id, kind: "step", stepIndex: c }
    ));
  }
  function Re(e) {
    if (M.current || R.current) return;
    const n = e.subtasks.map((c) => c.title).join("; ") || "none";
    g("info", `Requesting micro-step breakdown for "${e.title}".`), l("Taskmaster agent is drafting micro-steps…"), le(
      e,
      `Break the task "${e.title}"${e.estimateMinutes ? ` (~${e.estimateMinutes}m)` : ""} into micro-steps per the taskmaster-method skill. Reply with ONE fenced json code block containing an array of {"title", "command"?} objects and no prose outside it.
Existing steps (do not duplicate): ${n}`,
      { taskId: e.id, kind: "draft" }
    );
  }
  function Ve(e) {
    if (M.current || R.current) return;
    const n = e.subtasks.map((i, d) => ({ sub: i, index: d })).filter(({ sub: i }) => !i.done);
    if (n.length === 0) return;
    const c = n.map(({ sub: i, index: d }) => `[${d + 1}] ${i.title}${i.command ? ` — command: ${i.command}` : ""}`).join(`
`);
    g("info", `Running ${n.length} remaining step(s) unattended via taskmaster agent.`), l(`Agent is running ${n.length} remaining step(s)…`), le(
      e,
      `Execute the remaining micro-steps of task "${e.title}" in order, autonomously:
${c}
After finishing each step output one line: STEP RESULT [n]: done|failed — <short summary>. If a step cannot be completed autonomously, mark it failed with the reason and continue to the next.`,
      { taskId: e.id, kind: "all" }
    );
  }
  function $e(e) {
    const n = e.subtasks.filter((c) => !c.done).map((c) => c.title);
    k({
      agent: "taskmaster",
      message: `Check in on task "${e.title}". Remaining micro-steps: ${n.join("; ") || "none"}. Help me with the next one.`
    });
  }
  async function _e(e) {
    try {
      await s.post("/api/crons", {
        name: `taskmaster-${e.id}`,
        cron: "0 9 * * 1-5",
        agent: "taskmaster",
        message: `Taskmaster routine check-in on task "${e.title}". Review current progress and report the single next micro-step.`
      }), g("ok", `Cron registered: weekday 09:00 routine check-in on "${e.title}".`), l("Routine scheduled — weekdays 09:00");
    } catch (n) {
      g("err", `Cron registration failed: ${String(n)}`), l("Could not register the cron");
    }
  }
  function Ee() {
    const e = V.trim();
    if (!e) return;
    const n = Number.parseInt(ge, 10), c = {
      id: H("task"),
      title: e,
      ...Number.isFinite(n) && n > 0 ? { estimateMinutes: n } : {},
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      subtasks: []
    };
    v((i) => ({ ...i, tasks: [...i.tasks, c], activeTaskId: i.activeTaskId ?? c.id })), fe(""), he(""), g("info", `Task added to backlog: "${e}"`);
  }
  function de(e) {
    const n = be.trim();
    if (!n) return;
    const c = ke.trim(), i = { id: H("sub"), title: n, done: !1, source: "manual", ...c ? { command: c } : {} };
    v((d) => ({
      ...d,
      tasks: d.tasks.map((f) => f.id === e.id ? { ...f, subtasks: [...f.subtasks, i] } : f)
    })), ye(""), xe("");
  }
  function Ye(e) {
    v((n) => {
      var i;
      const c = n.tasks.filter((d) => d.id !== e);
      return { ...n, tasks: c, activeTaskId: n.activeTaskId === e ? ((i = c[0]) == null ? void 0 : i.id) ?? null : n.activeTaskId };
    }), ne(null), g("info", "Task removed from backlog.");
  }
  function Xe(e) {
    v((n) => ({ ...n, activeTaskId: e })), N("focus");
  }
  const C = rt(() => S ? S.tasks.find((e) => e.id === S.activeTaskId) ?? S.tasks[0] ?? null : null, [S]), P = C ? Math.max(
    0,
    Math.min(x[C.id] ?? ft(C), Math.max(0, C.subtasks.length - 1))
  ) : 0, y = (C == null ? void 0 : C.subtasks[P]) ?? null, Je = C ? De(C) : null, J = C ? C.subtasks.filter((e) => !e.done).length : 0;
  me(() => {
    try {
      a(J);
    } catch {
    }
  }, [J, a]);
  function ce(e, n) {
    U((c) => ({ ...c, [e]: n }));
  }
  if (!S)
    return /* @__PURE__ */ r("div", { style: { ...o.root, alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ u("div", { style: { display: "grid", gap: 10, justifyItems: "center" }, children: [
      /* @__PURE__ */ r("span", { style: { color: t.muted, fontSize: 13 }, children: F ?? "Loading Taskmaster Pro…" }),
      F ? /* @__PURE__ */ r("button", { className: "tm-btn", style: o.primaryBtn, onClick: () => se(), children: "Retry load" }) : null
    ] }) });
  const Ae = S.tasks.length, Ne = S.settings.memorySync;
  let Q;
  switch (I) {
    case "focus":
      Q = Ze();
      break;
    case "backlog":
      Q = et();
      break;
    case "console":
      Q = tt();
      break;
    default: {
      const e = I;
      throw new Error(`Unhandled view: ${String(e)}`);
    }
  }
  function Qe() {
    const e = [
      { id: "focus", label: "★ Focus" },
      { id: "backlog", label: `Backlog (${Ae})` },
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
  function Me() {
    return /* @__PURE__ */ u("div", { style: o.addRow, children: [
      /* @__PURE__ */ r(
        "input",
        {
          style: { ...o.input, flex: 1 },
          placeholder: "New task title…",
          value: V,
          onChange: (e) => fe(e.target.value),
          onKeyDown: (e) => {
            e.key === "Enter" && Ee();
          }
        }
      ),
      /* @__PURE__ */ r(
        "input",
        {
          style: { ...o.input, width: 74 },
          placeholder: "~min",
          inputMode: "numeric",
          value: ge,
          onChange: (e) => he(e.target.value)
        }
      ),
      /* @__PURE__ */ r("button", { className: "tm-btn", style: o.btnPrimary, onClick: Ee, children: "ADD TASK" })
    ] });
  }
  function Ze() {
    if (!C)
      return /* @__PURE__ */ u("section", { className: "tm-card", style: { ...o.card, textAlign: "center" }, children: [
        /* @__PURE__ */ r("div", { style: { fontSize: 28, marginBottom: 8 }, children: "⚡" }),
        /* @__PURE__ */ r("div", { style: { fontSize: 15, fontWeight: 700 }, children: "No task in focus" }),
        /* @__PURE__ */ r("p", { style: { color: t.muted, fontSize: 12, margin: "6px 0 14px" }, children: "Add your first task — the taskmaster agent can draft its micro-steps." }),
        Me()
      ] });
    const e = C, n = Je ?? { done: 0, total: 0, pct: 0 }, c = Z(e), i = (T == null ? void 0 : T.taskId) === e.id ? T : null, d = !!(y && (i == null ? void 0 : i.kind) === "step" && i.stepIndex === P), f = (i == null ? void 0 : i.kind) === "draft", p = (i == null ? void 0 : i.kind) === "all";
    return /* @__PURE__ */ u(pe, { children: [
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
                  ...Ne ? { color: t.kiro, borderColor: "rgba(129,140,248,0.35)", background: "rgba(129,140,248,0.08)" } : { color: t.muted, borderColor: t.border, background: "transparent" }
                },
                title: "One lesson is stored per completed task when ON",
                onClick: () => v((m) => ({ ...m, settings: { memorySync: !m.settings.memorySync } })),
                children: [
                  "🧠 MEMORY SYNC: ",
                  Ne ? "ON" : "OFF"
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
            /* @__PURE__ */ r("button", { className: "tm-btn", style: { ...o.chip, cursor: "pointer", color: t.text, borderColor: t.border }, onClick: () => void _e(e), children: "⏰ SCHEDULE ROUTINE (CRON)" }),
            /* @__PURE__ */ r("button", { className: "tm-btn", style: { ...o.chip, cursor: "pointer", color: t.text, borderColor: t.border }, onClick: () => $e(e), children: "💬 OPEN IN CHAT" })
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
            e.subtasks.length === 0 ? "NO MICRO-STEPS YET" : `ACTIVE MICRO-STEP ${P + 1} OF ${e.subtasks.length}`
          ] }),
          /* @__PURE__ */ u("span", { style: { display: "flex", gap: 6, alignItems: "center" }, children: [
            i && /* @__PURE__ */ r(
              "button",
              {
                className: "tm-btn",
                style: { ...o.btnGhost, color: t.danger, borderColor: "rgba(229,83,75,0.45)" },
                title: "Stops Taskmaster waiting; the underlying agent turn may continue in the task chat.",
                "aria-label": "Stop waiting for the agent run",
                onClick: () => void Ke(e),
                children: "STOP WAITING"
              }
            ),
            /* @__PURE__ */ r("button", { className: "tm-btn", style: o.navBtn, onClick: () => ce(e.id, Math.max(0, P - 1)), children: "◄" }),
            /* @__PURE__ */ r(
              "button",
              {
                className: "tm-btn",
                style: o.navBtn,
                onClick: () => ce(e.id, Math.min(e.subtasks.length - 1, P + 1)),
                children: "►"
              }
            )
          ] })
        ] }),
        y ? /* @__PURE__ */ u("div", { style: { display: "flex", gap: 14, alignItems: "flex-start" }, children: [
          /* @__PURE__ */ r(
            "button",
            {
              className: "tm-btn",
              style: o.checkBtn,
              "aria-label": y.done ? "Mark step incomplete" : "Mark step complete",
              onClick: () => X(e.id, y.id, !y.done),
              children: y.done ? /* @__PURE__ */ r("span", { style: { ...o.checkCircle, background: "rgba(52,211,153,0.18)", borderColor: "rgba(52,211,153,0.5)", color: t.focus }, children: "✓" }) : /* @__PURE__ */ r("span", { style: { ...o.checkCircle, borderColor: "#475569", color: "transparent" }, children: "✓" })
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
                  ...y.done ? { textDecoration: "line-through", color: t.muted } : {}
                },
                children: y.title
              }
            ),
            y.command && /* @__PURE__ */ u("div", { style: o.commandBox, children: [
              /* @__PURE__ */ u("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
                /* @__PURE__ */ r("span", { style: o.commandLabel, children: "KIRO TERMINAL EXECUTABLE" }),
                /* @__PURE__ */ u("span", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
                  y.runState === "failed" && !d && /* @__PURE__ */ r("span", { style: { ...o.execChip, ...o.failedChip }, children: "LAST RUN FAILED" }),
                  /* @__PURE__ */ r("span", { style: { ...o.commandLabel, color: t.kiro }, children: "VIA TASKMASTER AGENT" })
                ] })
              ] }),
              /* @__PURE__ */ r("code", { style: o.commandCode, children: y.command }),
              /* @__PURE__ */ r("div", { children: /* @__PURE__ */ r(
                "button",
                {
                  className: "tm-btn",
                  style: {
                    ...o.btnPrimary,
                    ...y.done ? { opacity: 0.5, cursor: "default" } : {},
                    ...d ? { background: "rgba(129,140,248,0.25)", color: t.kiro } : {}
                  },
                  disabled: y.done || !!i,
                  onClick: () => He(e, y, P),
                  children: d ? "⚙ EXECUTING VIA AGENT…" : y.done ? "✓ COMPLETED" : y.runState === "failed" ? "↻ RETRY VIA AGENT" : "▶ RUN COMMAND NATIVELY"
                }
              ) }),
              (d || y.output) && /* @__PURE__ */ r(
                "div",
                {
                  style: {
                    ...o.outputPre,
                    // Always longhand: toggling borderColor against the
                    // shorthand `border` triggers a React style warning.
                    borderColor: y.runState === "failed" && !d ? "rgba(229,83,75,0.45)" : t.border
                  },
                  children: d ? `$ ${y.command}
… taskmaster agent is executing — the reply lands here and in the task chat below` : /* @__PURE__ */ r(ct, { content: y.output ?? "" })
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
                  style: { ...o.btnGhost, ...f ? { color: t.kiro } : {} },
                  disabled: !!i,
                  onClick: () => Re(e),
                  children: f ? "⚙ AGENT DRAFTING…" : "✦ DRAFT STEPS WITH AI"
                }
              ),
              /* @__PURE__ */ r(
                "button",
                {
                  className: "tm-btn",
                  style: { ...o.btnGhost, ...p ? { color: t.kiro } : { color: t.focus, borderColor: "rgba(52,211,153,0.3)" } },
                  disabled: !!i || J === 0,
                  onClick: () => Ve(e),
                  children: p ? "⚙ AGENT RUNNING STEPS…" : `▶ RUN REMAINING (${J})`
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ r("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: e.subtasks.map((m, h) => {
            const z = h === P;
            return /* @__PURE__ */ u(
              "div",
              {
                style: { ...o.queueRow, ...z ? o.queueRowActive : {} },
                onClick: () => ce(e.id, h),
                children: [
                  /* @__PURE__ */ u("span", { style: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 }, children: [
                    /* @__PURE__ */ r(
                      "button",
                      {
                        className: "tm-btn",
                        style: o.queueCheck,
                        "aria-label": m.done ? "Mark incomplete" : "Mark complete",
                        onClick: (K) => {
                          K.stopPropagation(), X(e.id, m.id, !m.done);
                        },
                        children: m.done ? /* @__PURE__ */ r("span", { style: { color: t.focus, fontWeight: 700 }, children: "✓" }) : /* @__PURE__ */ r("span", { style: { color: "#475569" }, children: "○" })
                      }
                    ),
                    /* @__PURE__ */ u("span", { style: { minWidth: 0 }, children: [
                      /* @__PURE__ */ r("span", { style: { fontSize: 12, ...m.done ? { textDecoration: "line-through", color: t.muted } : {} }, children: m.title }),
                      /* @__PURE__ */ u("span", { style: { display: "flex", gap: 6, marginTop: 2 }, children: [
                        m.runState === "failed" && !m.done && /* @__PURE__ */ r("span", { style: { ...o.execChip, ...o.failedChip }, children: "FAILED" }),
                        m.command && !m.done && /* @__PURE__ */ r("span", { style: o.execChip, children: "EXECUTABLE" }),
                        m.source === "agent" && /* @__PURE__ */ r("span", { style: { ...o.execChip, color: t.kiro, borderColor: "rgba(129,140,248,0.3)", background: "rgba(129,140,248,0.08)" }, children: "AGENT-DRAFTED" })
                      ] })
                    ] })
                  ] }),
                  z && /* @__PURE__ */ r("span", { style: o.activeChip, children: "ACTIVE" })
                ]
              },
              m.id
            );
          }) }),
          /* @__PURE__ */ u("div", { style: { ...o.addRow, marginTop: 10 }, children: [
            /* @__PURE__ */ r(
              "input",
              {
                style: { ...o.input, flex: 2 },
                placeholder: "Add micro-step…",
                value: be,
                onChange: (m) => ye(m.target.value),
                onKeyDown: (m) => {
                  m.key === "Enter" && de(e);
                }
              }
            ),
            /* @__PURE__ */ r(
              "input",
              {
                style: { ...o.input, flex: 3, fontFamily: D, fontSize: 11 },
                placeholder: "optional terminal command",
                value: ke,
                onChange: (m) => xe(m.target.value),
                onKeyDown: (m) => {
                  m.key === "Enter" && de(e);
                }
              }
            ),
            /* @__PURE__ */ r("button", { className: "tm-btn", style: o.btnGhost, onClick: () => de(e), children: "ADD" })
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
          dt,
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
  function et() {
    return /* @__PURE__ */ u(pe, { children: [
      /* @__PURE__ */ u("section", { className: "tm-card", style: o.card, children: [
        /* @__PURE__ */ u("div", { style: { ...o.queueLabel, marginBottom: 10 }, children: [
          "ALL BACKLOGS (",
          Ae,
          " TASKS)"
        ] }),
        Me()
      ] }),
      S.tasks.map((e) => {
        const n = De(e), c = e.id === (C == null ? void 0 : C.id), i = (T == null ? void 0 : T.taskId) === e.id ? T : null, d = (i == null ? void 0 : i.kind) === "draft";
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
                  /* @__PURE__ */ r("button", { className: "tm-btn", style: { ...o.btnGhost, color: t.focus, borderColor: "rgba(52,211,153,0.3)" }, onClick: () => Xe(e.id), children: "FOCUS" }),
                  /* @__PURE__ */ r(
                    "button",
                    {
                      className: "tm-btn",
                      style: { ...o.btnGhost, ...d ? { color: t.kiro } : {} },
                      disabled: !!i,
                      onClick: () => Re(e),
                      children: d ? "⚙ DRAFTING…" : "✦ DRAFT STEPS"
                    }
                  ),
                  /* @__PURE__ */ r("button", { className: "tm-btn", style: o.btnGhost, onClick: () => $e(e), children: "💬 CHAT" }),
                  /* @__PURE__ */ r(
                    "button",
                    {
                      className: "tm-btn",
                      style: { ...o.btnGhost, ...te === e.id ? { color: t.danger, borderColor: t.danger } : {} },
                      onClick: () => te === e.id ? Ye(e.id) : ne(e.id),
                      onBlur: () => ne(null),
                      children: te === e.id ? "SURE?" : "DELETE"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ r("div", { style: { ...o.progressTrack, marginTop: 12 }, children: /* @__PURE__ */ r("div", { style: { ...o.progressFill, width: `${n.pct}%` } }) }),
              /* @__PURE__ */ u("div", { style: { display: "flex", flexDirection: "column", gap: 4, marginTop: 10 }, children: [
                e.subtasks.length === 0 && /* @__PURE__ */ r("span", { style: { color: t.muted, fontSize: 11 }, children: "No micro-steps yet." }),
                e.subtasks.map((f) => {
                  const p = f.runState === "failed" && !f.done;
                  return /* @__PURE__ */ u("div", { style: o.backlogSubRow, children: [
                    /* @__PURE__ */ r("span", { style: { color: f.done ? t.focus : p ? t.danger : "#475569" }, children: f.done ? "✓" : p ? "✗" : "○" }),
                    /* @__PURE__ */ r("span", { style: { fontSize: 11, ...f.done ? { textDecoration: "line-through", color: t.muted } : {} }, children: f.title }),
                    p && /* @__PURE__ */ r("span", { style: { ...o.execChip, ...o.failedChip }, children: "FAILED" })
                  ] }, f.id);
                })
              ] })
            ]
          },
          e.id
        );
      })
    ] });
  }
  function tt() {
    return /* @__PURE__ */ u(pe, { children: [
      /* @__PURE__ */ u("section", { className: "tm-card", style: o.card, children: [
        /* @__PURE__ */ u("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }, children: [
          /* @__PURE__ */ r("span", { style: o.queueLabel, children: "KIRO GATEWAY" }),
          /* @__PURE__ */ r(
            "button",
            {
              className: "tm-btn",
              style: o.btnGhost,
              onClick: () => {
                s.get("/api/status").then((e) => {
                  B(typeof e == "object" && e !== null ? e : {}), g("ok", "Gateway status refreshed.");
                }).catch((e) => g("warn", `Status refresh failed: ${String(e)}`));
              },
              children: "REFRESH"
            }
          )
        ] }),
        /* @__PURE__ */ u("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ r(ee, { label: "STATUS", value: b ? "ONLINE" : "UNKNOWN", accent: b ? t.focus : t.warn }),
          /* @__PURE__ */ r(ee, { label: "VERSION", value: String((b == null ? void 0 : b.version) ?? "—"), accent: t.kiro }),
          /* @__PURE__ */ r(ee, { label: "UPTIME", value: String((b == null ? void 0 : b.uptime) ?? "—"), accent: t.text }),
          /* @__PURE__ */ r(ee, { label: "PROVIDER", value: String((b == null ? void 0 : b.provider) ?? "—"), accent: t.text })
        ] })
      ] }),
      /* @__PURE__ */ u("section", { className: "tm-card", style: { ...o.card, fontFamily: D }, children: [
        /* @__PURE__ */ u("div", { style: { display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", borderBottom: `1px solid ${t.border}`, paddingBottom: 8, marginBottom: 10 }, children: [
          /* @__PURE__ */ r("span", { style: { color: t.muted, fontSize: 11 }, children: "Taskmaster activity + gateway console" }),
          /* @__PURE__ */ r("span", { style: { ...o.execChip, color: t.muted }, children: Pe })
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
    /* @__PURE__ */ r("style", { children: It }),
    /* @__PURE__ */ u("header", { style: o.header, children: [
      /* @__PURE__ */ u("span", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
        /* @__PURE__ */ r("span", { style: o.logoBox, "aria-hidden": "true", children: /* @__PURE__ */ r("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "#030712", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ r("path", { d: "M13 10V3L4 14h7v7l9-11h-7z" }) }) }),
        /* @__PURE__ */ u("span", { children: [
          /* @__PURE__ */ r("span", { style: o.brandTitle, children: "Taskmaster Pro" }),
          /* @__PURE__ */ r("span", { style: { ...o.chip, marginLeft: 8, color: t.kiro, borderColor: "rgba(129,140,248,0.3)", background: "rgba(129,140,248,0.08)" }, children: "EXECUTION ENGINE" }),
          /* @__PURE__ */ r("div", { style: { color: t.muted, fontSize: 10, marginTop: 2 }, children: "Task focus · agent-run commands · memory sync" })
        ] })
      ] }),
      Qe()
    ] }),
    F && /* @__PURE__ */ r("div", { style: o.errorBanner, children: F }),
    Q
  ] });
}
function ee({ label: s, value: l, accent: a }) {
  return /* @__PURE__ */ u("div", { style: o.statBox, children: [
    /* @__PURE__ */ r("div", { style: { color: t.muted, fontSize: 9, letterSpacing: "0.1em", marginBottom: 4 }, children: s }),
    /* @__PURE__ */ r("div", { style: { color: a, fontSize: 13, fontWeight: 700, fontFamily: D, wordBreak: "break-all" }, children: l })
  ] });
}
const It = `
  .tm-btn { cursor: pointer; transition: filter 120ms ease, background 120ms ease; }
  .tm-btn:hover:not(:disabled) { filter: brightness(1.25); }
  .tm-btn:disabled { cursor: default; }
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
  Mt as default
};
