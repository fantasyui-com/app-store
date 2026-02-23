# The Fluent Planner Manifesto

We write programs that **explain themselves**.

## 1) Meaning First
The top of a program should read like intent, not plumbing.
If your reader must scroll to discover purpose, you failed.

## 2) Planning Is Not Doing
A plan is data.
Execution is the only place that touches reality.
Separate them, and the code becomes comprehensible.

## 3) Explicit Steps Beat Implicit Control Flow
We choose a stack of `{ type, args }` over invisible behavior.
We prefer “what happens” to be listable, inspectable, and replayable.

## 4) Name the World You’re Operating On
Use domain verbs:
- `readJSON`, `editJSON`, `writeJSON`, `rename`
Not generic verbs that hide purpose:
- `handle`, `process`, `doThing`, `util`

## 5) Centralize Side Effects
Side effects scattered across helpers create mystery.
Mystery kills correctness.
Put effects in `execute()` and `step*` functions.

## 6) Safety Is the Default
Dry-run is respect.
No clobber is respect.
MissingOk is reality.
Scripts should be safe to run twice.

## 7) Logs Are Part of the UX
A script that can’t narrate what it did is incomplete.
Logs must be stable, grep-able, and honest.

## 8) Reduce Cognitive Load, Not Line Count
Short code can still be opaque.
Longer code can be crystal clear.
We optimize for comprehension per line.

## 9) Make Change Easy
A readable plan invites safe edits.
A tangled script punishes improvement.
We build systems that want to be changed.

## 10) Write for Humans and AIs Alike
AI coding succeeds when intent is explicit.
Humans succeed when execution is centralized.
Fluent Planners serve both.

### In one sentence:
**Pull meaning to the surface, push effects to the bottom, and let the program read like a promise.**
