# AGENTS.md — The Fluent Planner Contract

This repository prefers **Fluent Planners** for scripting and tool-like programs.

A Fluent Planner is a small DSL built in JavaScript that:

1) lets the top of the file read like a **sentence** (the plan), and
2) moves all side-effects into a single **interpreter** (`execute()`).

The result is dramatically higher readability, safer refactors, and more reliable AI assistance.

---

## What “Readable” Means Here

Readable code in this repo has these properties:

- **Meaning is visible first** (intent/config/flow at the top)
- **Side effects are centralized** (filesystem/network/etc. only in one place)
- **Steps are explicit** (a stack of `{ type, args }`)
- **Every step has a name that matches the domain** (e.g. `readJSON`, `editJSON`, `rename`, `writeJSON`)
- **Safety is default** (dry-run, no clobber, missingOk options)
- **Errors are counted and surfaced** (summary stats)

If you are an AI agent: optimize for *comprehension per line*, not cleverness.

---

## Core Pattern

### Planning phase (pure)
A fluent chain builds an **execution stack**:

```js
const plan = flow({ root, dryRun, verbose })
  .readdir()
  .dirs()
  .where(e => e.name.startsWith("poem-"))
  .file("post.json", { missingOk: true })
  .readJSON()
  .editJSON(fixChapter)
  .writeJSON({ atomic: true });
````

No I/O happens here. This is *just data* (a plan).

### Execution phase (effects)

Only `.execute()` touches the world:

```js
const summary = await plan.execute();
printSummary(summary);
```

---

## Contract Rules (Non-Negotiable)

### Rule 1 — Planning is pure

Fluent calls must not perform I/O or mutate external state.

Allowed in planning:

* pushing `{ type, args }` to a local `stack`
* returning the proxy to allow chaining

Not allowed in planning:

* `fs.*`, network, time-based logic, reading env files
* “smart” branching that changes meaning based on runtime conditions

### Rule 2 — Execution is a tiny interpreter

`execute()` iterates the stack and applies steps to a working set (`items`).

Keep it:

* simple
* linear
* readable
* safe

### Rule 3 — Steps are explicit objects

Each fluent call becomes:

```js
{ type: "where", args: [predicateFn] }
```

No hidden state machines. No magic.

### Rule 4 — Safety is the default behavior

Every action step must support:

* `--dry-run` (`-n`) prints what would change
* **no clobber**: skip if target exists (unless explicitly configured)
* ignore symlinks unless explicitly requested

### Rule 5 — Logs must be stable and grep-able

Use consistent prefixes:

* `DRY`
* `WRITE`
* `RENAME`
* `SKIP`
* `ERROR`

### Rule 6 — Summary counters are part of the API

`execute()` returns stats, not vibes.

Minimum recommended fields:

* scannedDirs / scannedFiles
* changed / renamed / written
* skippedMissing / skippedNoop / skippedTargetExists
* errors

### Rule 7 — Avoid thenable traps

When using Proxy, reserve `"then"` to avoid Promise-like coercion:

```js
if (prop === "then") return undefined;
```

### Rule 8 — Reserve internal method names

Proxy must reserve:

* `execute`
* `stack` (optional debug hook)
* maybe `options`

Do not allow fluent steps to collide with these names.

---

## “Pull Meaning to the Surface” Layout

Preferred script structure:

1. **Meaning / config** (constants, regexes, safety defaults)
2. **The sentence** (the fluent plan)
3. `execute()` and step interpreter
4. `step*` helpers (readdir, readJSON, rename, writeJSON)
5. Domain logic (pure transforms)
6. Utilities (assertDir, rel, exists, printSummary)

This layout is a comprehension accelerator.

---

## Recommended Data Shapes

### Step

```js
{ type: "rename", args: [mapperFn] }
```

### Entry (“working set item”)

Keep it small:

```js
{
  abs: "/abs/path/to/post.json",
  name: "post.json",
  kind: "file" | "dir",
  ctx: { ...optional breadcrumbs... },
  json:  ...optional parsed payload...,
  dirty: ...optional boolean...
}
```

---

## Step Taxonomy

### Transform steps (pure selection)

These change the working set without side effects:

* `readdir()`
* `dirs()`, `files()`
* `where(predicate)`
* `cd(subdir)`
* `file(filename)`

### Action steps (side effects)

These perform I/O:

* `readJSON()`
* `editJSON(editor)`
* `writeJSON(opts)`
* `rename(mapper)`

Action steps must honor dry-run and safety checks.

---

## Adding a New Fluent Step

1. Do **not** add a method to the builder (Proxy already captures anything).
2. Add a new `case` in the interpreter:

```js
case "hashFiles":
  items = await stepHashFiles(items, ...step.args);
  break;
```

3. Implement `stepHashFiles()` as a small function:

* clear input/output
* no hidden state
* update stats explicitly

4. Add at least one log line for dry-run behavior (if action step).

---

## Domain Logic Must Stay Pure

Write domain edits as pure functions:

```js
function normalizeChapter(json) {
  // return { json, changed, note }
}
```

Domain functions should never call `fs` and should be testable in isolation.

---

## Testing Guidance

When scripts are non-trivial:

* Test domain logic as pure functions
* For filesystem behavior, use a temp directory with fixture files
* Validate dry-run produces identical planned outputs but no writes

---

## Why This Helps Humans *and* AI

* Humans can read the “sentence” and understand the program in seconds.
* AI can make changes without breaking hidden side effects.
* Refactors are safer because meaning and effects are separated.
* Debugging is easier because steps and stats are explicit.
