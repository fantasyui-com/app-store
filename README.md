# Application Storage

Application Storage is an Electron desktop catalog viewer now organized as a small npm workspace monorepo.

## Monorepo Layout

- `apps/application-storage`: desktop app package
- `notes/`: Fluent Planner notes
- root workspace scripts: start, make, lint, audit

## Security Remediation

- Ran `npm audit fix --force`.
- Removed the vulnerable Electron Forge toolchain dependencies.
- Replaced build/start tooling with a lean Electron workspace package.

## Catalog Format

The app reads `apps/application-storage/applications.json`.

Simple text entries are supported:

```json
[
  "My Application",
  "Another Tool"
]
```

Object entries are also supported:

```json
{
  "applications": [
    { "name": "My Application", "description": "Optional details" }
  ]
}
```

## Development

```bash
npm install
npm run start
```

## Release Build

```bash
npm run make
```

This generates a packaged app under `apps/application-storage/out/` for the current host platform.

Upload release binaries to:

- https://github.com/fantasyui-com/app-store/releases

Do not commit release binaries into git.
