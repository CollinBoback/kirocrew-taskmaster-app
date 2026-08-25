import { jsx as o, jsxs as u, Fragment as de } from "react/jsx-runtime";
import { useState as R, useRef as O, useCallback as E, useEffect as ce, useMemo as et } from "react";
import { useAppApi as tt, useNotify as nt, useNavBadge as ot, useChatLauncher as rt, useAppEvents as st, ChatEmbed as it } from "@kirocrew/app-sdk";
import { MarkdownRenderer as at } from "@kirocrew/ui";
function ue(s) {
  return `taskmaster-${s.id}`;
}
let Le = 0;
function H(s) {
  return Le += 1, `${s}-${Date.now().toString(36)}-${Le.toString(36)}`;
}
function lt() {
  return { version: 1, settings: { memorySync: !0 }, activeTaskId: null, tasks: [] };
}
function dt(s) {
  var I;
  const l = lt();
  if (typeof s != "object" || s === null) return l;
  const a = s, y = Array.isArray(a.tasks) ? a.tasks.filter(Fe).map(ct) : l.tasks, x = typeof a.settings == "object" && a.settings !== null ? { memorySync: a.settings.memorySync !== !1 } : l.settings, $ = typeof a.activeTaskId == "string" ? a.activeTaskId : null;
  return {
    version: 1,
    settings: x,
    activeTaskId: y.some((A) => A.id === $) ? $ : ((I = y[0]) == null ? void 0 : I.id) ?? null,
    tasks: y
  };
}
function Fe(s) {
  return typeof s == "object" && s !== null && typeof s.title == "string";
}
function ct(s) {
  const l = Array.isArray(s.subtasks) ? s.subtasks.filter(Fe).map((a) => ({
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
function Me(s) {
  const l = s.subtasks.length, a = s.subtasks.filter((y) => y.done).length;
  return { done: a, total: l, pct: l === 0 ? 0 : Math.round(a / l * 100) };
}
function ut(s) {
  const l = s.subtasks.findIndex((a) => !a.done);
  return l === -1 ? Math.max(0, s.subtasks.length - 1) : l;
}
function pt(s) {
  const l = /```(?:json)?\s*([\s\S]*?)```/.exec(s), a = [];
  l != null && l[1] && a.push(l[1]);
  const y = s.indexOf("["), x = s.lastIndexOf("]");
  y !== -1 && x > y && a.push(s.slice(y, x + 1));
  for (const $ of a)
    try {
      const I = JSON.parse($);
      if (!Array.isArray(I)) continue;
      const A = I.filter((k) => typeof k == "object" && k !== null).map((k) => ({
        title: typeof k.title == "string" ? k.title.trim() : "",
        ...typeof k.command == "string" && k.command.trim() ? { command: k.command.trim() } : {}
      })).filter((k) => k.title.length > 0).slice(0, 12);
      if (A.length > 0) return A;
    } catch {
    }
  return null;
}
function mt(s) {
  const l = s.subtasks.map((a, y) => `${y + 1}. ${a.title}${a.command ? ` [${a.command}]` : ""}`);
  return `Completed "${s.title}" via micro-steps: ${l.join(" ")}`;
}
const ft = 900 * 1e3;
function gt(s, l, a = ft) {
  return l - s.sentAt > a;
}
function ht(s) {
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
function De(s, l, a = !1) {
  return !a && s === l;
}
function bt(s) {
  if (typeof s != "object" || s === null) return { messages: [], running: !1 };
  const l = s;
  return { messages: Array.isArray(l.messages) ? l.messages.filter((y) => typeof y == "object" && y !== null) : [], running: l.running === !0 };
}
const ze = /^\s*STEP RESULT \[(\d+)\]:\s*(done|failed)\s*(?:[—–:-]\s*)?(.*)$/gim;
function yt(s) {
  const l = [];
  ze.lastIndex = 0;
  let a;
  for (; (a = ze.exec(s)) !== null; )
    l.push({
      index: Number.parseInt(a[1], 10),
      ok: a[2].toLowerCase() === "done",
      summary: a[3].trim()
    });
  return l;
}
const Oe = 4e3;
function kt(s) {
  const { work: l, data: a, seen: y, stepCount: x } = s, $ = a.running ? Math.max(0, a.messages.length - 1) : a.messages.length, I = a.messages.slice(y, $), A = Math.max(y, $);
  if (x === null)
    return { actions: [], nextSeen: A, sawReply: s.sawReply, settled: !0, stepSucceeded: !1 };
  const k = [];
  let U = s.sawReply, D = !1, q = !1;
  for (const h of I) {
    if (h.role === "user" || !h.content) continue;
    U = !0;
    const M = h.content;
    if (l.kind === "draft") {
      const T = pt(M);
      T && (k.push({ type: "append-draft", steps: T }), D = !0);
      continue;
    }
    const W = yt(M);
    for (const T of W) {
      if (T.index < 1 || T.index > x) {
        k.push({ type: "unknown-step", result: T });
        continue;
      }
      const V = W.length === 1 ? M.slice(0, Oe) : `${T.ok ? "done" : "failed"} — ${T.summary || "(no summary)"}`;
      k.push({ type: "step-result", result: T, output: V }), T.ok && (q = !0), l.kind === "step" && (D = !0);
    }
  }
  if (D && l.kind !== "all")
    return { actions: k, nextSeen: A, sawReply: U, settled: !0, stepSucceeded: q };
  if (!a.running && U) {
    const h = [...I].reverse().find((M) => M.role !== "user" && M.content);
    k.push({
      type: "turn-ended",
      kind: l.kind,
      ...l.kind === "step" && (h != null && h.content) ? { output: h.content.slice(0, Oe) } : {}
    }), D = !0;
  }
  return { actions: k, nextSeen: A, sawReply: U, settled: D, stepSucceeded: q };
}
const We = "/api/apps/taskmaster-pro/config", xt = 200, je = "notification scope · slot polling", St = 2500, t = {
  bg: "var(--bg, #030712)",
  card: "var(--card, #0b1329)",
  border: "var(--border, #1e293b)",
  text: "var(--text, #f1f5f9)",
  muted: "var(--muted, #94a3b8)",
  focus: "#34d399",
  kiro: "#818cf8",
  warn: "var(--warn, #d29922)",
  danger: "var(--danger, #e5534b)"
}, L = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
function Ct() {
  return (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0];
}
function $t() {
  const s = tt(), l = nt(), a = ot(), { openChat: y } = rt(), [x, $] = R(null), [I, A] = R("focus"), [k, U] = R({}), [D, q] = R([]), [h, M] = R(null), [W, T] = R(null), [V, pe] = R(""), [me, fe] = R(""), [ge, he] = R(""), [be, ye] = R(""), [Q, Z] = R(null), [w, ke] = R(null), j = O(null);
  j.current = x;
  const xe = O(Promise.resolve()), Se = O(0), ee = O({}), z = O(!1), N = O(null), F = O({}), te = O(!1), Pe = E((e) => {
    N.current = e, ke(e);
  }, []), ne = E((e) => N.current !== e ? !1 : (N.current = null, ke(null), !0), []), f = E((e, n) => {
    q((c) => [{ ts: Ct(), level: e, msg: n }, ...c].slice(0, xt));
  }, []), Ce = E(
    (e) => {
      $(e), j.current = e;
      const n = ++Se.current;
      xe.current = xe.current.then(async () => {
        if (n === Se.current)
          try {
            await s.put(We, e);
          } catch (c) {
            f("warn", `Config save failed: ${String(c)}`);
          }
      });
    },
    [s, f]
  ), v = E(
    (e) => {
      const n = j.current;
      n && Ce(e(n));
    },
    [Ce]
  ), oe = E(
    (e) => {
      s.get(We).then((n) => {
        e != null && e() || ($(dt(n)), T(null), f("info", "Loaded task state from gateway app config."));
      }).catch((n) => {
        e != null && e() || ($(null), T(`Config load failed (${String(n)}) — retry to continue.`), f("warn", `Config load failed: ${String(n)}`));
      });
    },
    [s, f]
  );
  ce(() => {
    let e = !1;
    return oe(() => e), s.get("/api/status").then((n) => {
      e || (M(typeof n == "object" && n !== null ? n : {}), f("ok", "Connected to Kiro Crew gateway."));
    }).catch(() => {
      e || f("warn", "Gateway status unavailable.");
    }), f("info", `Console mode: ${je} — gateway event forwarding to app pages is pending upstream.`), () => {
      e = !0;
    };
  }, [oe]);
  const ve = E(
    (e) => {
      l(`Task complete: ${e.title}`), f("ok", `Task "${e.title}" fully completed.`);
      const n = j.current;
      !(n != null && n.settings.memorySync) || e.lessonPosted || ee.current[e.id] || (ee.current[e.id] = !0, s.post("/api/lessons", { rule: mt(e), category: "knowledge" }).then(() => {
        v((c) => ({
          ...c,
          tasks: c.tasks.map((i) => i.id === e.id ? { ...i, lessonPosted: !0 } : i)
        })), f("ok", "Kiro Memory: appended solution path to lessons (category: knowledge).");
      }).catch((c) => f("warn", `Memory sync failed: ${String(c)}`)).finally(() => {
        delete ee.current[e.id];
      }));
    },
    [s, l, f, v]
  ), _ = E(
    (e, n, c, i, d) => {
      let p = null;
      v((m) => {
        const g = m.tasks.map((C) => {
          if (C.id !== e) return C;
          const B = C.subtasks.map((G) => {
            if (G.id !== n) return G;
            const le = { ...G, done: c, ...i !== void 0 ? { output: i } : {} };
            return d ? le.runState = d : delete le.runState, le;
          }), K = { ...C, subtasks: B }, Ze = C.subtasks.length > 0 && C.subtasks.every((G) => G.done);
          return B.length > 0 && B.every((G) => G.done) && !Ze && (p = K), K;
        });
        return { ...m, tasks: g };
      }), p && ve(p);
    },
    [v, ve]
  );
  st("notification", (e) => {
    const n = typeof e == "object" && e !== null ? e : {}, c = typeof n.title == "string" ? n.title : "notification", i = typeof n.text == "string" ? n.text : "";
    f("info", `Gateway notification [${c}]: ${i.slice(0, 200)}`);
  });
  const Te = E(
    (e, n) => {
      v((c) => ({
        ...c,
        tasks: c.tasks.map((i) => {
          if (i.id !== e) return i;
          const d = new Set(i.subtasks.map((m) => m.title.toLowerCase())), p = n.filter((m) => !d.has(m.title.toLowerCase())).map((m) => ({ id: H("sub"), title: m.title, done: !1, source: "agent", ...m.command ? { command: m.command } : {} }));
          return { ...i, subtasks: [...i.subtasks, ...p] };
        })
      })), f("ok", `Taskmaster agent drafted ${n.length} micro-step(s).`), l(`Added ${n.length} drafted micro-steps`);
    },
    [f, v, l]
  ), we = E(
    async (e) => bt(await s.get(`/api/chat/slots/${encodeURIComponent(e)}`)),
    [s]
  ), re = E(
    (e, n, c, i) => {
      v((d) => ({
        ...d,
        tasks: d.tasks.map(
          (p) => p.id === e ? {
            ...p,
            subtasks: p.subtasks.map(
              (m) => m.id === n ? { ...m, output: c, ...i ? { runState: i } : {} } : m
            )
          } : p
        )
      }));
    },
    [v]
  );
  async function se(e, n, c) {
    if (N.current || z.current) return;
    z.current = !0;
    const i = ue(e);
    if (F.current[i] === void 0)
      try {
        const p = (await we(i)).messages.length, m = Be(F.current[i], {
          status: "loaded",
          messageCount: p
        });
        if (m === null) {
          z.current = !1;
          return;
        }
        F.current[i] = m;
      } catch (p) {
        const m = Be(
          F.current[i],
          ht(p) ? { status: "missing" } : { status: "failed" }
        );
        if (m === null) {
          z.current = !1, f("warn", `Could not safely read task chat history; request was not sent: ${String(p)}`), l("Could not verify task chat history — retry the run", { type: "error" });
          return;
        }
        F.current[i] = m;
      }
    te.current = !1;
    const d = { ...c, sentAt: Date.now() };
    z.current = !1, Pe(d), e.slotStarted || v((p) => ({
      ...p,
      tasks: p.tasks.map((m) => m.id === e.id ? { ...m, slotStarted: !0 } : m)
    })), s.post("/api/chat", { message: n, slot: i, agent: "taskmaster" }).catch((p) => {
      p instanceof SyntaxError || (f("err", `Send to task slot failed: ${String(p)}`), l("Could not reach the gateway", { type: "error" }), ne(d));
    }), f("info", `Sent to task slot ${i}: ${n.split(`
`)[0].slice(0, 120)}`);
  }
  const Ge = E(
    (e, n) => {
      var c, i;
      for (const d of n) {
        if (d.type === "append-draft") {
          Te(e.taskId, d.steps);
          continue;
        }
        if (d.type === "unknown-step") {
          f("warn", `Agent reported STEP RESULT [${d.result.index}] but the task has no such step.`);
          continue;
        }
        if (d.type === "step-result") {
          const p = (c = j.current) == null ? void 0 : c.tasks.find((g) => g.id === e.taskId), m = p == null ? void 0 : p.subtasks[d.result.index - 1];
          if (!m) continue;
          d.result.ok ? (_(e.taskId, m.id, !0, d.output, "done"), f("ok", `Step ${d.result.index} completed by agent: ${d.result.summary || m.title}`)) : (re(e.taskId, m.id, d.output, "failed"), f("warn", `Step ${d.result.index} failed: ${d.result.summary || "(no summary)"}`));
          continue;
        }
        if (d.kind === "all")
          f("ok", "Agent finished the run — see per-step results above and the task chat.");
        else if (d.kind === "draft")
          f("warn", "Draft reply had no parseable json block — see the task chat."), l("Agent reply was not parseable — see the task chat");
        else {
          const p = (i = j.current) == null ? void 0 : i.tasks.find((g) => g.id === e.taskId), m = e.stepIndex != null ? p == null ? void 0 : p.subtasks[e.stepIndex] : void 0;
          m && d.output && re(e.taskId, m.id, d.output), f("warn", "Agent reply had no STEP RESULT marker — step left for manual toggle.");
        }
      }
    },
    [f, Te, l, re, _]
  );
  ce(() => {
    if (!w) return;
    const e = ue({ id: w.taskId });
    let n = !1;
    const c = async () => {
      var B;
      const d = N.current;
      if (!d || !De(N.current, d, n)) return;
      if (gt(d, Date.now())) {
        f("warn", "Agent request timed out — check the task chat."), ne(d);
        return;
      }
      let p;
      try {
        p = await we(e);
      } catch {
        return;
      }
      if (!De(N.current, d, n)) return;
      const m = F.current[e] ?? 0, g = (B = j.current) == null ? void 0 : B.tasks.find((K) => K.id === d.taskId), C = kt({
        work: d,
        data: p,
        seen: m,
        sawReply: te.current,
        stepCount: (g == null ? void 0 : g.subtasks.length) ?? null
      });
      F.current[e] = C.nextSeen, te.current = C.sawReply, Ge(d, C.actions), C.settled && (d.kind === "step" && C.stepSucceeded && l("Step completed via taskmaster agent", { type: "success" }), ne(d));
    }, i = setInterval(() => void c(), St);
    return c(), () => {
      n = !0, clearInterval(i);
    };
  }, [w == null ? void 0 : w.sentAt]);
  function Ue(e, n, c) {
    !n.command || N.current || z.current || (f("info", `Kiro terminal execute (step ${c + 1}): ${n.command}`), se(
      e,
      `Run micro-step [${c + 1}] of task "${e.title}": ${n.title}
Execute this terminal command and report concise output:
${n.command}
End your reply with exactly one line: STEP RESULT [${c + 1}]: done|failed — <short summary>`,
      { taskId: e.id, kind: "step", stepIndex: c }
    ));
  }
  function Ie(e) {
    if (N.current || z.current) return;
    const n = e.subtasks.map((c) => c.title).join("; ") || "none";
    f("info", `Requesting micro-step breakdown for "${e.title}".`), l("Taskmaster agent is drafting micro-steps…"), se(
      e,
      `Break the task "${e.title}"${e.estimateMinutes ? ` (~${e.estimateMinutes}m)` : ""} into micro-steps per the taskmaster-method skill. Reply with ONE fenced json code block containing an array of {"title", "command"?} objects and no prose outside it.
Existing steps (do not duplicate): ${n}`,
      { taskId: e.id, kind: "draft" }
    );
  }
  function Ke(e) {
    if (N.current || z.current) return;
    const n = e.subtasks.map((i, d) => ({ sub: i, index: d })).filter(({ sub: i }) => !i.done);
    if (n.length === 0) return;
    const c = n.map(({ sub: i, index: d }) => `[${d + 1}] ${i.title}${i.command ? ` — command: ${i.command}` : ""}`).join(`
`);
    f("info", `Running ${n.length} remaining step(s) unattended via taskmaster agent.`), l(`Agent is running ${n.length} remaining step(s)…`), se(
      e,
      `Execute the remaining micro-steps of task "${e.title}" in order, autonomously:
${c}
After finishing each step output one line: STEP RESULT [n]: done|failed — <short summary>. If a step cannot be completed autonomously, mark it failed with the reason and continue to the next.`,
      { taskId: e.id, kind: "all" }
    );
  }
  function Re(e) {
    const n = e.subtasks.filter((c) => !c.done).map((c) => c.title);
    y({
      agent: "taskmaster",
      message: `Check in on task "${e.title}". Remaining micro-steps: ${n.join("; ") || "none"}. Help me with the next one.`
    });
  }
  async function qe(e) {
    try {
      await s.post("/api/crons", {
        name: `taskmaster-${e.id}`,
        cron: "0 9 * * 1-5",
        agent: "taskmaster",
        message: `Taskmaster routine check-in on task "${e.title}". Review current progress and report the single next micro-step.`
      }), f("ok", `Cron registered: weekday 09:00 routine check-in on "${e.title}".`), l("Routine scheduled — weekdays 09:00");
    } catch (n) {
      f("err", `Cron registration failed: ${String(n)}`), l("Could not register the cron");
    }
  }
  function Ee() {
    const e = V.trim();
    if (!e) return;
    const n = Number.parseInt(me, 10), c = {
      id: H("task"),
      title: e,
      ...Number.isFinite(n) && n > 0 ? { estimateMinutes: n } : {},
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      subtasks: []
    };
    v((i) => ({ ...i, tasks: [...i.tasks, c], activeTaskId: i.activeTaskId ?? c.id })), pe(""), fe(""), f("info", `Task added to backlog: "${e}"`);
  }
  function ie(e) {
    const n = ge.trim();
    if (!n) return;
    const c = be.trim(), i = { id: H("sub"), title: n, done: !1, source: "manual", ...c ? { command: c } : {} };
    v((d) => ({
      ...d,
      tasks: d.tasks.map((p) => p.id === e.id ? { ...p, subtasks: [...p.subtasks, i] } : p)
    })), he(""), ye("");
  }
  function He(e) {
    v((n) => {
      var i;
      const c = n.tasks.filter((d) => d.id !== e);
      return { ...n, tasks: c, activeTaskId: n.activeTaskId === e ? ((i = c[0]) == null ? void 0 : i.id) ?? null : n.activeTaskId };
    }), Z(null), f("info", "Task removed from backlog.");
  }
  function Ve(e) {
    v((n) => ({ ...n, activeTaskId: e })), A("focus");
  }
  const S = et(() => x ? x.tasks.find((e) => e.id === x.activeTaskId) ?? x.tasks[0] ?? null : null, [x]), P = S ? Math.max(
    0,
    Math.min(k[S.id] ?? ut(S), Math.max(0, S.subtasks.length - 1))
  ) : 0, b = (S == null ? void 0 : S.subtasks[P]) ?? null, _e = S ? Me(S) : null, Y = S ? S.subtasks.filter((e) => !e.done).length : 0;
  ce(() => {
    try {
      a(Y);
    } catch {
    }
  }, [Y, a]);
  function ae(e, n) {
    U((c) => ({ ...c, [e]: n }));
  }
  if (!x)
    return /* @__PURE__ */ o("div", { style: { ...r.root, alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ u("div", { style: { display: "grid", gap: 10, justifyItems: "center" }, children: [
      /* @__PURE__ */ o("span", { style: { color: t.muted, fontSize: 13 }, children: W ?? "Loading Taskmaster Pro…" }),
      W ? /* @__PURE__ */ o("button", { className: "tm-btn", style: r.primaryBtn, onClick: () => oe(), children: "Retry load" }) : null
    ] }) });
  const $e = x.tasks.length, Ae = x.settings.memorySync;
  let X;
  switch (I) {
    case "focus":
      X = Xe();
      break;
    case "backlog":
      X = Je();
      break;
    case "console":
      X = Qe();
      break;
    default: {
      const e = I;
      throw new Error(`Unhandled view: ${String(e)}`);
    }
  }
  function Ye() {
    const e = [
      { id: "focus", label: "★ Focus" },
      { id: "backlog", label: `Backlog (${$e})` },
      { id: "console", label: "Console" }
    ];
    return /* @__PURE__ */ o("div", { style: r.tabRow, children: e.map((n) => /* @__PURE__ */ o(
      "button",
      {
        className: "tm-btn",
        style: { ...r.tab, ...I === n.id ? r.tabActive : {} },
        onClick: () => A(n.id),
        children: n.label
      },
      n.id
    )) });
  }
  function Ne() {
    return /* @__PURE__ */ u("div", { style: r.addRow, children: [
      /* @__PURE__ */ o(
        "input",
        {
          style: { ...r.input, flex: 1 },
          placeholder: "New task title…",
          value: V,
          onChange: (e) => pe(e.target.value),
          onKeyDown: (e) => {
            e.key === "Enter" && Ee();
          }
        }
      ),
      /* @__PURE__ */ o(
        "input",
        {
          style: { ...r.input, width: 74 },
          placeholder: "~min",
          inputMode: "numeric",
          value: me,
          onChange: (e) => fe(e.target.value)
        }
      ),
      /* @__PURE__ */ o("button", { className: "tm-btn", style: r.btnPrimary, onClick: Ee, children: "ADD TASK" })
    ] });
  }
  function Xe() {
    if (!S)
      return /* @__PURE__ */ u("section", { className: "tm-card", style: { ...r.card, textAlign: "center" }, children: [
        /* @__PURE__ */ o("div", { style: { fontSize: 28, marginBottom: 8 }, children: "⚡" }),
        /* @__PURE__ */ o("div", { style: { fontSize: 15, fontWeight: 700 }, children: "No task in focus" }),
        /* @__PURE__ */ o("p", { style: { color: t.muted, fontSize: 12, margin: "6px 0 14px" }, children: "Add your first task — the taskmaster agent can draft its micro-steps." }),
        Ne()
      ] });
    const e = S, n = _e ?? { done: 0, total: 0, pct: 0 }, c = ue(e), i = (w == null ? void 0 : w.taskId) === e.id ? w : null, d = !!(b && (i == null ? void 0 : i.kind) === "step" && i.stepIndex === P), p = (i == null ? void 0 : i.kind) === "draft", m = (i == null ? void 0 : i.kind) === "all";
    return /* @__PURE__ */ u(de, { children: [
      /* @__PURE__ */ u("section", { className: "tm-card", style: { ...r.card, paddingTop: 20, position: "relative", overflow: "hidden" }, children: [
        /* @__PURE__ */ o("div", { style: r.gradientStrip }),
        /* @__PURE__ */ u("div", { style: r.centerCol, children: [
          /* @__PURE__ */ u("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }, children: [
            /* @__PURE__ */ o("span", { style: { ...r.chip, color: t.focus, borderColor: "rgba(52,211,153,0.35)", background: "rgba(52,211,153,0.08)" }, children: "★ TASKMASTER ACTIVE" }),
            /* @__PURE__ */ u(
              "button",
              {
                className: "tm-btn",
                style: {
                  ...r.chip,
                  cursor: "pointer",
                  ...Ae ? { color: t.kiro, borderColor: "rgba(129,140,248,0.35)", background: "rgba(129,140,248,0.08)" } : { color: t.muted, borderColor: t.border, background: "transparent" }
                },
                title: "One lesson is stored per completed task when ON",
                onClick: () => v((g) => ({ ...g, settings: { memorySync: !g.settings.memorySync } })),
                children: [
                  "🧠 MEMORY SYNC: ",
                  Ae ? "ON" : "OFF"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ o("p", { style: { color: t.muted, fontSize: 11, fontStyle: "italic", margin: "10px 0 6px" }, children: "Isolation mode active. Execute one step at a time." }),
          /* @__PURE__ */ o("h2", { style: r.taskTitle, children: e.title }),
          /* @__PURE__ */ u("div", { style: { display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", justifyContent: "center" }, children: [
            e.estimateMinutes != null && /* @__PURE__ */ u("span", { style: { ...r.chip, color: "#38bdf8", borderColor: t.border, fontFamily: L }, children: [
              "~",
              e.estimateMinutes,
              "m"
            ] }),
            /* @__PURE__ */ o("button", { className: "tm-btn", style: { ...r.chip, cursor: "pointer", color: t.text, borderColor: t.border }, onClick: () => void qe(e), children: "⏰ SCHEDULE ROUTINE (CRON)" }),
            /* @__PURE__ */ o("button", { className: "tm-btn", style: { ...r.chip, cursor: "pointer", color: t.text, borderColor: t.border }, onClick: () => Re(e), children: "💬 OPEN IN CHAT" })
          ] })
        ] }),
        /* @__PURE__ */ o("div", { style: r.progressTrack, role: "progressbar", "aria-valuenow": n.pct, "aria-valuemin": 0, "aria-valuemax": 100, children: /* @__PURE__ */ o("div", { style: { ...r.progressFill, width: `${n.pct}%` } }) }),
        /* @__PURE__ */ u("div", { style: { textAlign: "right", color: t.muted, fontSize: 11, marginTop: 6, fontFamily: L }, children: [
          n.done,
          "/",
          n.total,
          " · ",
          n.pct,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ u("section", { className: "tm-card", style: { ...r.card, borderColor: "rgba(52,211,153,0.3)" }, children: [
        /* @__PURE__ */ u("div", { style: r.stepHeader, children: [
          /* @__PURE__ */ u("span", { style: { ...r.stepCounter, color: t.focus }, children: [
            /* @__PURE__ */ o("span", { className: "tm-pulse", style: r.pulseDot }),
            e.subtasks.length === 0 ? "NO MICRO-STEPS YET" : `ACTIVE MICRO-STEP ${P + 1} OF ${e.subtasks.length}`
          ] }),
          /* @__PURE__ */ u("span", { style: { display: "flex", gap: 6 }, children: [
            /* @__PURE__ */ o("button", { className: "tm-btn", style: r.navBtn, onClick: () => ae(e.id, Math.max(0, P - 1)), children: "◄" }),
            /* @__PURE__ */ o(
              "button",
              {
                className: "tm-btn",
                style: r.navBtn,
                onClick: () => ae(e.id, Math.min(e.subtasks.length - 1, P + 1)),
                children: "►"
              }
            )
          ] })
        ] }),
        b ? /* @__PURE__ */ u("div", { style: { display: "flex", gap: 14, alignItems: "flex-start" }, children: [
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
          /* @__PURE__ */ u("div", { style: { flex: 1, minWidth: 0 }, children: [
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
            b.command && /* @__PURE__ */ u("div", { style: r.commandBox, children: [
              /* @__PURE__ */ u("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
                /* @__PURE__ */ o("span", { style: r.commandLabel, children: "KIRO TERMINAL EXECUTABLE" }),
                /* @__PURE__ */ u("span", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
                  b.runState === "failed" && !d && /* @__PURE__ */ o("span", { style: { ...r.execChip, ...r.failedChip }, children: "LAST RUN FAILED" }),
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
                    ...d ? { background: "rgba(129,140,248,0.25)", color: t.kiro } : {}
                  },
                  disabled: b.done || !!i,
                  onClick: () => Ue(e, b, P),
                  children: d ? "⚙ EXECUTING VIA AGENT…" : b.done ? "✓ COMPLETED" : b.runState === "failed" ? "↻ RETRY VIA AGENT" : "▶ RUN COMMAND NATIVELY"
                }
              ) }),
              (d || b.output) && /* @__PURE__ */ o(
                "div",
                {
                  style: {
                    ...r.outputPre,
                    // Always longhand: toggling borderColor against the
                    // shorthand `border` triggers a React style warning.
                    borderColor: b.runState === "failed" && !d ? "rgba(229,83,75,0.45)" : t.border
                  },
                  children: d ? `$ ${b.command}
… taskmaster agent is executing — the reply lands here and in the task chat below` : /* @__PURE__ */ o(at, { content: b.output ?? "" })
                }
              )
            ] }),
            /* @__PURE__ */ o("p", { style: { color: t.muted, fontSize: 11, marginTop: 10 }, children: "Focus purely on completing this single micro-step." })
          ] })
        ] }) : /* @__PURE__ */ o("p", { style: { color: t.muted, fontSize: 12 }, children: "No micro-steps yet — add one, or let the taskmaster agent draft the breakdown." }),
        /* @__PURE__ */ u("div", { style: { borderTop: `1px solid ${t.border}`, marginTop: 18, paddingTop: 12 }, children: [
          /* @__PURE__ */ u("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 8, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ u("span", { style: r.queueLabel, children: [
              "ALL SUBTASKS (",
              n.done,
              "/",
              n.total,
              " COMPLETED)"
            ] }),
            /* @__PURE__ */ u("span", { style: { display: "flex", gap: 6 }, children: [
              /* @__PURE__ */ o(
                "button",
                {
                  className: "tm-btn",
                  style: { ...r.btnGhost, ...p ? { color: t.kiro } : {} },
                  disabled: !!i,
                  onClick: () => Ie(e),
                  children: p ? "⚙ AGENT DRAFTING…" : "✦ DRAFT STEPS WITH AI"
                }
              ),
              /* @__PURE__ */ o(
                "button",
                {
                  className: "tm-btn",
                  style: { ...r.btnGhost, ...m ? { color: t.kiro } : { color: t.focus, borderColor: "rgba(52,211,153,0.3)" } },
                  disabled: !!i || Y === 0,
                  onClick: () => Ke(e),
                  children: m ? "⚙ AGENT RUNNING STEPS…" : `▶ RUN REMAINING (${Y})`
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ o("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: e.subtasks.map((g, C) => {
            const B = C === P;
            return /* @__PURE__ */ u(
              "div",
              {
                style: { ...r.queueRow, ...B ? r.queueRowActive : {} },
                onClick: () => ae(e.id, C),
                children: [
                  /* @__PURE__ */ u("span", { style: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 }, children: [
                    /* @__PURE__ */ o(
                      "button",
                      {
                        className: "tm-btn",
                        style: r.queueCheck,
                        "aria-label": g.done ? "Mark incomplete" : "Mark complete",
                        onClick: (K) => {
                          K.stopPropagation(), _(e.id, g.id, !g.done);
                        },
                        children: g.done ? /* @__PURE__ */ o("span", { style: { color: t.focus, fontWeight: 700 }, children: "✓" }) : /* @__PURE__ */ o("span", { style: { color: "#475569" }, children: "○" })
                      }
                    ),
                    /* @__PURE__ */ u("span", { style: { minWidth: 0 }, children: [
                      /* @__PURE__ */ o("span", { style: { fontSize: 12, ...g.done ? { textDecoration: "line-through", color: t.muted } : {} }, children: g.title }),
                      /* @__PURE__ */ u("span", { style: { display: "flex", gap: 6, marginTop: 2 }, children: [
                        g.runState === "failed" && !g.done && /* @__PURE__ */ o("span", { style: { ...r.execChip, ...r.failedChip }, children: "FAILED" }),
                        g.command && !g.done && /* @__PURE__ */ o("span", { style: r.execChip, children: "EXECUTABLE" }),
                        g.source === "agent" && /* @__PURE__ */ o("span", { style: { ...r.execChip, color: t.kiro, borderColor: "rgba(129,140,248,0.3)", background: "rgba(129,140,248,0.08)" }, children: "AGENT-DRAFTED" })
                      ] })
                    ] })
                  ] }),
                  B && /* @__PURE__ */ o("span", { style: r.activeChip, children: "ACTIVE" })
                ]
              },
              g.id
            );
          }) }),
          /* @__PURE__ */ u("div", { style: { ...r.addRow, marginTop: 10 }, children: [
            /* @__PURE__ */ o(
              "input",
              {
                style: { ...r.input, flex: 2 },
                placeholder: "Add micro-step…",
                value: ge,
                onChange: (g) => he(g.target.value),
                onKeyDown: (g) => {
                  g.key === "Enter" && ie(e);
                }
              }
            ),
            /* @__PURE__ */ o(
              "input",
              {
                style: { ...r.input, flex: 3, fontFamily: L, fontSize: 11 },
                placeholder: "optional terminal command",
                value: be,
                onChange: (g) => ye(g.target.value),
                onKeyDown: (g) => {
                  g.key === "Enter" && ie(e);
                }
              }
            ),
            /* @__PURE__ */ o("button", { className: "tm-btn", style: r.btnGhost, onClick: () => ie(e), children: "ADD" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ u("section", { className: "tm-card", style: { ...r.card, padding: 0, overflow: "hidden" }, children: [
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
              /* @__PURE__ */ o("span", { style: r.queueLabel, children: "TASK AGENT SESSION" }),
              /* @__PURE__ */ u("span", { style: { ...r.execChip, color: t.kiro, borderColor: "rgba(129,140,248,0.3)", background: "rgba(129,140,248,0.08)" }, children: [
                c,
                " · taskmaster"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ o("div", { style: { height: 380 }, children: /* @__PURE__ */ o(
          it,
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
  function Je() {
    return /* @__PURE__ */ u(de, { children: [
      /* @__PURE__ */ u("section", { className: "tm-card", style: r.card, children: [
        /* @__PURE__ */ u("div", { style: { ...r.queueLabel, marginBottom: 10 }, children: [
          "ALL BACKLOGS (",
          $e,
          " TASKS)"
        ] }),
        Ne()
      ] }),
      x.tasks.map((e) => {
        const n = Me(e), c = e.id === (S == null ? void 0 : S.id), i = (w == null ? void 0 : w.taskId) === e.id ? w : null, d = (i == null ? void 0 : i.kind) === "draft";
        return /* @__PURE__ */ u(
          "section",
          {
            className: "tm-card",
            style: { ...r.card, ...c ? { borderColor: "rgba(52,211,153,0.4)" } : {} },
            children: [
              /* @__PURE__ */ u("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }, children: [
                /* @__PURE__ */ o("span", { style: { fontWeight: 600, fontSize: 14, minWidth: 0 }, children: e.title }),
                /* @__PURE__ */ u("span", { style: { display: "flex", gap: 6, flexWrap: "wrap" }, children: [
                  e.estimateMinutes != null && /* @__PURE__ */ u("span", { style: { ...r.chip, color: "#38bdf8", borderColor: t.border, fontFamily: L }, children: [
                    "~",
                    e.estimateMinutes,
                    "m"
                  ] }),
                  /* @__PURE__ */ o("button", { className: "tm-btn", style: { ...r.btnGhost, color: t.focus, borderColor: "rgba(52,211,153,0.3)" }, onClick: () => Ve(e.id), children: "FOCUS" }),
                  /* @__PURE__ */ o(
                    "button",
                    {
                      className: "tm-btn",
                      style: { ...r.btnGhost, ...d ? { color: t.kiro } : {} },
                      disabled: !!i,
                      onClick: () => Ie(e),
                      children: d ? "⚙ DRAFTING…" : "✦ DRAFT STEPS"
                    }
                  ),
                  /* @__PURE__ */ o("button", { className: "tm-btn", style: r.btnGhost, onClick: () => Re(e), children: "💬 CHAT" }),
                  /* @__PURE__ */ o(
                    "button",
                    {
                      className: "tm-btn",
                      style: { ...r.btnGhost, ...Q === e.id ? { color: t.danger, borderColor: t.danger } : {} },
                      onClick: () => Q === e.id ? He(e.id) : Z(e.id),
                      onBlur: () => Z(null),
                      children: Q === e.id ? "SURE?" : "DELETE"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ o("div", { style: { ...r.progressTrack, marginTop: 12 }, children: /* @__PURE__ */ o("div", { style: { ...r.progressFill, width: `${n.pct}%` } }) }),
              /* @__PURE__ */ u("div", { style: { display: "flex", flexDirection: "column", gap: 4, marginTop: 10 }, children: [
                e.subtasks.length === 0 && /* @__PURE__ */ o("span", { style: { color: t.muted, fontSize: 11 }, children: "No micro-steps yet." }),
                e.subtasks.map((p) => {
                  const m = p.runState === "failed" && !p.done;
                  return /* @__PURE__ */ u("div", { style: r.backlogSubRow, children: [
                    /* @__PURE__ */ o("span", { style: { color: p.done ? t.focus : m ? t.danger : "#475569" }, children: p.done ? "✓" : m ? "✗" : "○" }),
                    /* @__PURE__ */ o("span", { style: { fontSize: 11, ...p.done ? { textDecoration: "line-through", color: t.muted } : {} }, children: p.title }),
                    m && /* @__PURE__ */ o("span", { style: { ...r.execChip, ...r.failedChip }, children: "FAILED" })
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
  function Qe() {
    return /* @__PURE__ */ u(de, { children: [
      /* @__PURE__ */ u("section", { className: "tm-card", style: r.card, children: [
        /* @__PURE__ */ u("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }, children: [
          /* @__PURE__ */ o("span", { style: r.queueLabel, children: "KIRO GATEWAY" }),
          /* @__PURE__ */ o(
            "button",
            {
              className: "tm-btn",
              style: r.btnGhost,
              onClick: () => {
                s.get("/api/status").then((e) => {
                  M(typeof e == "object" && e !== null ? e : {}), f("ok", "Gateway status refreshed.");
                }).catch((e) => f("warn", `Status refresh failed: ${String(e)}`));
              },
              children: "REFRESH"
            }
          )
        ] }),
        /* @__PURE__ */ u("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ o(J, { label: "STATUS", value: h ? "ONLINE" : "UNKNOWN", accent: h ? t.focus : t.warn }),
          /* @__PURE__ */ o(J, { label: "VERSION", value: String((h == null ? void 0 : h.version) ?? "—"), accent: t.kiro }),
          /* @__PURE__ */ o(J, { label: "UPTIME", value: String((h == null ? void 0 : h.uptime) ?? "—"), accent: t.text }),
          /* @__PURE__ */ o(J, { label: "PROVIDER", value: String((h == null ? void 0 : h.provider) ?? "—"), accent: t.text })
        ] })
      ] }),
      /* @__PURE__ */ u("section", { className: "tm-card", style: { ...r.card, fontFamily: L }, children: [
        /* @__PURE__ */ u("div", { style: { display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", borderBottom: `1px solid ${t.border}`, paddingBottom: 8, marginBottom: 10 }, children: [
          /* @__PURE__ */ o("span", { style: { color: t.muted, fontSize: 11 }, children: "Taskmaster activity + gateway console" }),
          /* @__PURE__ */ o("span", { style: { ...r.execChip, color: t.muted }, children: je })
        ] }),
        /* @__PURE__ */ u("div", { style: { display: "flex", flexDirection: "column", gap: 6, maxHeight: 380, overflowY: "auto" }, children: [
          D.length === 0 && /* @__PURE__ */ o("span", { style: { color: t.muted, fontSize: 11 }, children: "No events yet." }),
          D.map((e, n) => /* @__PURE__ */ u("div", { style: { display: "flex", gap: 10, alignItems: "flex-start" }, children: [
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
  return /* @__PURE__ */ u("div", { style: r.root, children: [
    /* @__PURE__ */ o("style", { children: vt }),
    /* @__PURE__ */ u("header", { style: r.header, children: [
      /* @__PURE__ */ u("span", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
        /* @__PURE__ */ o("span", { style: r.logoBox, "aria-hidden": "true", children: /* @__PURE__ */ o("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "#030712", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ o("path", { d: "M13 10V3L4 14h7v7l9-11h-7z" }) }) }),
        /* @__PURE__ */ u("span", { children: [
          /* @__PURE__ */ o("span", { style: r.brandTitle, children: "Taskmaster Pro" }),
          /* @__PURE__ */ o("span", { style: { ...r.chip, marginLeft: 8, color: t.kiro, borderColor: "rgba(129,140,248,0.3)", background: "rgba(129,140,248,0.08)" }, children: "EXECUTION ENGINE" }),
          /* @__PURE__ */ o("div", { style: { color: t.muted, fontSize: 10, marginTop: 2 }, children: "Task focus · agent-run commands · memory sync" })
        ] })
      ] }),
      Ye()
    ] }),
    W && /* @__PURE__ */ o("div", { style: r.errorBanner, children: W }),
    X
  ] });
}
function J({ label: s, value: l, accent: a }) {
  return /* @__PURE__ */ u("div", { style: r.statBox, children: [
    /* @__PURE__ */ o("div", { style: { color: t.muted, fontSize: 9, letterSpacing: "0.1em", marginBottom: 4 }, children: s }),
    /* @__PURE__ */ o("div", { style: { color: a, fontSize: 13, fontWeight: 700, fontFamily: L, wordBreak: "break-all" }, children: l })
  ] });
}
const vt = `
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
  commandLabel: { fontSize: 9, letterSpacing: "0.14em", color: t.muted, fontFamily: L },
  commandCode: {
    display: "block",
    padding: 8,
    borderRadius: 8,
    border: `1px solid ${t.border}`,
    background: t.card,
    color: "#6ee7b7",
    fontSize: 11,
    fontFamily: L,
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
    fontFamily: L,
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
    fontFamily: L
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
  $t as default
};
