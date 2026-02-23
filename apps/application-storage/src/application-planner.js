const fs = require('node:fs/promises');
const path = require('node:path');

function applicationFlow(options = {}) {
  const state = {
    options: {
      cwd: options.cwd || process.cwd(),
      appRoot: options.appRoot || path.resolve(__dirname, '..'),
      verbose: !!options.verbose,
    },
    stack: [],
    handlers: {
      locateLocalJson: stepLocateLocalJson,
      useRemoteJson: stepUseRemoteJson,
      readJson: stepReadJson,
      normalizeApplications: stepNormalizeApplications,
    },
  };

  const api = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'then') {
          return undefined;
        }

        if (prop === 'execute') {
          return () => execute(state);
        }

        if (prop === 'stack') {
          return state.stack;
        }

        return (...args) => {
          state.stack.push({ type: String(prop), args });
          return api;
        };
      },
    }
  );

  return api;
}

async function execute(state) {
  const context = {
    options: state.options,
    source: null,
    raw: null,
    result: {
      ok: false,
      needsUrl: false,
      source: null,
      applications: [],
      error: null,
    },
  };

  for (const step of state.stack) {
    const handler = state.handlers[step.type];

    if (!handler) {
      context.result.error = `Unknown planner step: ${step.type}`;
      return context.result;
    }

    try {
      await handler(context, ...step.args);
    } catch (error) {
      context.result.error = error instanceof Error ? error.message : String(error);
      return context.result;
    }
  }

  context.result.ok = !context.result.error;
  return context.result;
}

async function stepLocateLocalJson(context, fileName = 'applications.json') {
  const candidatePaths = [
    path.join(context.options.cwd, fileName),
    path.join(context.options.appRoot, fileName),
  ];

  for (const candidatePath of uniquePaths(candidatePaths)) {
    if (await isFile(candidatePath)) {
      context.source = {
        kind: 'file',
        value: candidatePath,
      };
      return;
    }
  }

  context.result.needsUrl = true;
  context.result.source = null;
}

async function stepUseRemoteJson(context, inputUrl) {
  if (typeof inputUrl !== 'string' || !inputUrl.trim()) {
    throw new Error('Provide a URL for applications.json.');
  }

  let parsed;
  try {
    parsed = new URL(inputUrl.trim());
  } catch {
    throw new Error('The provided URL is invalid.');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP(S) URLs are supported.');
  }

  context.source = {
    kind: 'url',
    value: parsed.toString(),
  };
}

async function stepReadJson(context) {
  if (!context.source) {
    if (context.result.needsUrl) {
      return;
    }
    throw new Error('No JSON source was selected.');
  }

  if (context.source.kind === 'file') {
    const fileText = await fs.readFile(context.source.value, 'utf8');
    context.raw = JSON.parse(fileText);
    return;
  }

  if (context.source.kind === 'url') {
    const response = await fetch(context.source.value);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    context.raw = await response.json();
    return;
  }

  throw new Error(`Unsupported source kind: ${context.source.kind}`);
}

async function stepNormalizeApplications(context) {
  if (context.result.needsUrl && !context.raw) {
    return;
  }

  const list = extractApplicationList(context.raw);

  if (!Array.isArray(list)) {
    throw new Error('applications.json must be an array or an object with an "applications" array.');
  }

  const normalized = list
    .map(normalizeApplication)
    .filter((entry) => entry && entry.title.length > 0);

  context.result.applications = normalized;
  context.result.source = context.source ? context.source.value : null;
}

function extractApplicationList(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === 'object' && Array.isArray(payload.applications)) {
    return payload.applications;
  }

  return null;
}

function normalizeApplication(entry) {
  if (typeof entry === 'string') {
    const title = entry.trim();
    return {
      title,
      description: '',
    };
  }

  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const title =
    firstString(entry.name) ||
    firstString(entry.title) ||
    firstString(entry.text) ||
    firstString(entry.label) ||
    '';

  const description =
    firstString(entry.description) ||
    firstString(entry.summary) ||
    firstString(entry.details) ||
    '';

  return {
    title,
    description,
  };
}

function firstString(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function uniquePaths(paths) {
  return Array.from(new Set(paths));
}

async function isFile(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

module.exports = {
  applicationFlow,
};
