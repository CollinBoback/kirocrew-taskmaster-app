import { constants, accessSync, readFileSync, realpathSync } from "node:fs";
import { delimiter, dirname, isAbsolute, relative, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const EXPERIMENT_ROOT = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(EXPERIMENT_ROOT, "../..");
const CONFIG_PATH = resolve(EXPERIMENT_ROOT, "routing.json");
const BENCHMARK_PATH = resolve(EXPERIMENT_ROOT, "benchmark.json");
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "use",
  "when",
  "with",
]);

function fail(message) {
  throw new Error(message);
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function hasTerm(text, term) {
  const textTokens = text.split(" ");
  const termTokens = normalize(term).split(" ");
  for (let start = 0; start <= textTokens.length - termTokens.length; start += 1) {
    if (termTokens.every((token, offset) => textTokens[start + offset] === token)) {
      return true;
    }
  }
  return false;
}

function adapterSkillPath(config, skillId) {
  return config.adapters[config.defaultHost].skills[skillId];
}

function validateConfig(config) {
  if (config.schemaVersion !== 1) fail("routing.json schemaVersion must be 1");
  if (!Number.isInteger(config.minimumScore) || config.minimumScore < 1) {
    fail("routing.json minimumScore must be a positive integer");
  }
  if (!Array.isArray(config.routes) || config.routes.length === 0) {
    fail("routing.json must define routes");
  }
  if (!Array.isArray(config.priority)) fail("routing.json priority must be an array");
  if (!config.defaultHost || !config.adapters?.[config.defaultHost]?.skills) {
    fail("routing.json must define a default host adapter");
  }

  const capabilityIds = new Set();
  for (const capability of config.capabilities ?? []) {
    if (!capability.id || capabilityIds.has(capability.id)) {
      fail(`duplicate or missing capability id: ${capability.id ?? "(missing)"}`);
    }
    if (!["cli", "mcp"].includes(capability.kind)) {
      fail(`unsupported capability kind for ${capability.id}`);
    }
    if (
      capability.kind === "cli" &&
      (!Array.isArray(capability.commands) || capability.commands.length === 0)
    ) {
      fail(`CLI capability ${capability.id} needs at least one command`);
    }
    capabilityIds.add(capability.id);
  }

  const routeIds = new Set();
  for (const route of config.routes) {
    if (!route.id || routeIds.has(route.id)) {
      fail(`duplicate or missing route id: ${route.id ?? "(missing)"}`);
    }
    if (!route.skillId || !Array.isArray(route.matches) || route.matches.length === 0) {
      fail(`route ${route.id} needs a skillId and matches`);
    }
    for (const match of route.matches) {
      if (!match.term || !Number.isFinite(match.weight) || match.weight <= 0) {
        fail(`route ${route.id} has an invalid match`);
      }
    }
    for (const capabilityId of route.capabilities ?? []) {
      if (!capabilityIds.has(capabilityId)) {
        fail(`route ${route.id} references unknown capability ${capabilityId}`);
      }
    }

    const configuredSkillPath = adapterSkillPath(config, route.skillId);
    if (!configuredSkillPath) {
      fail(`default host adapter has no path for ${route.skillId}`);
    }
    const skillPath = resolve(REPO_ROOT, configuredSkillPath);
    const skillRelativePath = relative(realpathSync(REPO_ROOT), realpathSync(skillPath));
    if (skillRelativePath.startsWith("..") || isAbsolute(skillRelativePath)) {
      fail(`adapter path for ${route.skillId} escapes the repository`);
    }
    accessSync(skillPath, constants.R_OK);
    routeIds.add(route.id);
  }

  if (
    config.priority.length !== routeIds.size ||
    new Set(config.priority).size !== routeIds.size ||
    config.priority.some((routeId) => !routeIds.has(routeId))
  ) {
    fail("priority must contain every route id exactly once");
  }
}

function routeTask(task, config) {
  const text = normalize(task);
  const priority = new Map(config.priority.map((routeId, index) => [routeId, index]));
  const candidates = config.routes
    .map((route) => {
      const matched = route.matches.filter((match) => hasTerm(text, match.term));
      return {
        id: route.id,
        skillId: route.skillId,
        capabilities: route.capabilities ?? [],
        score: matched.reduce((total, match) => total + match.weight, 0),
        matched: matched.map((match) => match.term),
      };
    })
    .filter((candidate) => candidate.score >= config.minimumScore)
    .sort(
      (left, right) =>
        right.score - left.score || priority.get(left.id) - priority.get(right.id),
    );

  if (candidates.length === 0) {
    return {
      route: null,
      confidence: "none",
      reason: "No configured term matched; leave routing to the client.",
      alternatives: [],
    };
  }

  const [winner, runnerUp] = candidates;
  if (runnerUp?.score === winner.score) {
    return {
      route: null,
      confidence: "none",
      reason: "Top routes tied; leave routing to the client.",
      alternatives: candidates.slice(0, 3).map(({ id, score }) => ({ id, score })),
    };
  }
  const gap = winner.score - (runnerUp?.score ?? 0);
  const confidence =
    winner.score >= 4 && gap >= 3 ? "high" : gap > 0 ? "medium" : "low";
  return {
    route: winner,
    confidence,
    reason: `Matched ${winner.matched.join(", ")}.`,
    alternatives: candidates.slice(1, 3).map(({ id, score }) => ({ id, score })),
  };
}

function skillDescription(skillPath) {
  const source = readFileSync(resolve(REPO_ROOT, skillPath), "utf8");
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)?.[1] ?? "";
  const rawDescription = /^description:\s*(.+)$/m.exec(frontmatter)?.[1]?.trim() ?? "";
  if (
    rawDescription.length >= 2 &&
    rawDescription[0] === rawDescription[rawDescription.length - 1] &&
    ["'", '"'].includes(rawDescription[0])
  ) {
    return rawDescription.slice(1, -1);
  }
  return rawDescription;
}

function tokens(text) {
  return new Set(
    normalize(text)
      .split(" ")
      .filter((token) => token.length > 1 && !STOP_WORDS.has(token)),
  );
}

function routeByDescription(task, config) {
  const taskTokens = tokens(task);
  const priority = new Map(config.priority.map((routeId, index) => [routeId, index]));
  const candidates = config.routes
    .map((route) => {
      const catalogTokens = tokens(
        `${route.id} ${skillDescription(adapterSkillPath(config, route.skillId))}`,
      );
      const overlap = [...taskTokens].filter((token) => catalogTokens.has(token));
      return { id: route.id, score: overlap.length, matched: overlap };
    })
    .filter((candidate) => candidate.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score || priority.get(left.id) - priority.get(right.id),
    );
  return candidates[0] ?? null;
}

function runBenchmark(config, benchmark) {
  if (benchmark.schemaVersion !== 1 || !Array.isArray(benchmark.cases)) {
    fail("benchmark.json has an unsupported shape");
  }
  const knownRoutes = new Set(config.routes.map((route) => route.id));
  const results = benchmark.cases.map((benchmarkCase) => {
    if (benchmarkCase.expect !== null && !knownRoutes.has(benchmarkCase.expect)) {
      fail(`benchmark references unknown route ${benchmarkCase.expect}`);
    }
    if (
      benchmarkCase.expectAlternatives !== undefined &&
      (!Array.isArray(benchmarkCase.expectAlternatives) ||
        benchmarkCase.expectAlternatives.some((routeId) => !knownRoutes.has(routeId)))
    ) {
      fail(`benchmark has invalid alternatives for "${benchmarkCase.task}"`);
    }
    const structuredDecision = routeTask(benchmarkCase.task, config);
    const structured = structuredDecision.route?.id ?? null;
    const structuredAlternatives = structuredDecision.alternatives.map(({ id }) => id);
    const expectedAlternatives = benchmarkCase.expectAlternatives ?? [];
    const alternativesMismatch =
      benchmarkCase.expectAlternatives !== undefined &&
      (structuredAlternatives.length !== expectedAlternatives.length ||
        structuredAlternatives.some(
          (routeId, index) => routeId !== expectedAlternatives[index],
        ));
    const description = routeByDescription(benchmarkCase.task, config)?.id ?? null;
    return {
      task: benchmarkCase.task,
      expect: benchmarkCase.expect,
      structured,
      structuredAlternatives,
      expectedAlternatives,
      alternativesMismatch,
      description,
    };
  });
  const summarize = (method, selectedResults = results) => {
    const field = method === "structured" ? "structured" : "description";
    const failures = selectedResults
      .filter(
        (result) =>
          result[field] !== result.expect ||
          (method === "structured" && result.alternativesMismatch),
      )
      .map((result) => ({
        task: result.task,
        expect: result.expect,
        actual: result[field],
        ...(method === "structured" && result.alternativesMismatch
          ? {
              expectAlternatives: result.expectedAlternatives,
              actualAlternatives: result.structuredAlternatives,
            }
          : {}),
      }));
    return {
      correct: selectedResults.length - failures.length,
      total: selectedResults.length,
      accuracy:
        selectedResults.length === 0
          ? null
          : (selectedResults.length - failures.length) / selectedResults.length,
      failures,
    };
  };
  const structured = summarize("structured");
  const descriptionProxy = summarize("description");
  const routableResults = results.filter((result) => result.expect !== null);
  const abstentionResults = results.filter((result) => result.expect === null);
  return {
    cases: results.length,
    structured,
    descriptionProxy,
    accuracyDelta: Number((structured.accuracy - descriptionProxy.accuracy).toFixed(4)),
    routable: {
      structured: summarize("structured", routableResults),
      descriptionProxy: summarize("description", routableResults),
    },
    abstention: {
      structured: summarize("structured", abstentionResults),
      descriptionProxy: summarize("description", abstentionResults),
    },
    note: "descriptionProxy is deterministic metadata overlap, not a measurement of Kiro's model.",
  };
}

function commandPath(command) {
  const directories = (process.env.PATH ?? "").split(delimiter).filter(Boolean);
  const pathExtensions =
    process.platform === "win32"
      ? (process.env.PATHEXT ?? ".COM;.EXE;.BAT;.CMD").split(";")
      : [""];
  const hasExtension = /\.[^\\/]+$/.test(command);

  for (const directory of directories) {
    for (const extension of hasExtension ? [""] : pathExtensions) {
      const candidate = resolve(directory, `${command}${extension}`);
      try {
        accessSync(candidate, process.platform === "win32" ? constants.F_OK : constants.X_OK);
        return candidate;
      } catch {
        // Try the next PATH entry.
      }
    }
  }
  return null;
}

function indexCapabilities(config, discoveredMcpNames) {
  return {
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    capabilities: config.capabilities.map((capability) => {
      if (capability.kind === "mcp") {
        return {
          id: capability.id,
          kind: capability.kind,
          status: discoveredMcpNames.has(capability.id) ? "available" : "unknown",
          path: null,
          reason: discoveredMcpNames.has(capability.id)
            ? "Reported by the client adapter."
            : "MCP discovery requires a client adapter; no client config was assumed.",
        };
      }
      const path = capability.commands.map(commandPath).find(Boolean) ?? null;
      return {
        id: capability.id,
        kind: capability.kind,
        status: path ? "available" : "missing",
        path,
        reason: path ? "Found on PATH." : "No configured command was found on PATH.",
      };
    }),
  };
}

function mcpNamesFromArgs(args) {
  const index = args.indexOf("--mcp");
  if (index === -1) return new Set();
  if (!args[index + 1]) fail("--mcp requires a comma-separated list");
  return new Set(args[index + 1].split(",").map((name) => name.trim()).filter(Boolean));
}

function printHelp() {
  console.log(`Usage:
  node experiments/skill-router/router.mjs route "<task>"
  node experiments/skill-router/router.mjs benchmark
  node experiments/skill-router/router.mjs tool-index [--mcp name,name]`);
}

function main() {
  const config = loadJson(CONFIG_PATH);
  validateConfig(config);
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case "route":
      if (args.length === 0) fail("route requires task text");
      console.log(JSON.stringify(routeTask(args.join(" "), config), null, 2));
      break;
    case "benchmark": {
      const result = runBenchmark(config, loadJson(BENCHMARK_PATH));
      console.log(JSON.stringify(result, null, 2));
      if (
        result.structured.failures.length > 0 ||
        result.structured.correct < result.descriptionProxy.correct
      ) {
        process.exitCode = 1;
      }
      break;
    }
    case "tool-index":
      console.log(
        JSON.stringify(indexCapabilities(config, mcpNamesFromArgs(args)), null, 2),
      );
      break;
    case "--help":
    case "-h":
    case undefined:
      printHelp();
      break;
    default:
      fail(`unknown command: ${command}`);
  }
}

try {
  main();
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exitCode = 1;
}
