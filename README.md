# Application Storage

Application Storage is a desktop Electron catalog viewer. It loads application entries from `applications.json` and displays them as Bootstrap cards.

## What Changed

- Program branding is now **Application Storage**.
- Electron runtime is upgraded to a modern Electron Forge setup.
- The catalog is sourced from `applications.json` (array or `{ "applications": [...] }`).
- If `applications.json` is missing, the app asks for a URL to a remote JSON catalog.
- Local binary artifacts are no longer stored in git under `downloads/`.

## Catalog Format

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

## Release Builds

```bash
npm run make
```

Build artifacts are generated under `out/make/`. Upload those files to:

- https://github.com/fantasyui-com/app-store/releases

This replaces committing binary zips into `downloads/`.
