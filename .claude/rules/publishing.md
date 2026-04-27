# Rule: Publishing

## Marketplace Publisher
- Publisher name: gingerturtleapps
- Extension name: MarkFlow Pro
- Extension ID: gingerturtleapps.markflow-pro

## package.json Requirements
- `publisher`: "gingerturtleapps"
- `engines.vscode`: "^1.85.0"
- `categories`: ["Other"]
- `keywords`: include "markdown", "preview", "auto-open", "markdown preview"
- `icon`: 128x128 PNG at ./assets/icon.png
- `license`: "SEE LICENSE IN LICENSE.md"
- `repository`: points to GitHub repo

## .vscodeignore Must Exclude
- src/ (ship compiled JS only)
- **/*.ts (except .d.ts)
- node_modules/
- .claude/
- sprints/
- CLAUDE.md
- CLAUDE.local.md
- .vscode/

## VSIX Packaging Steps
1. `npm run compile`
2. `npm test` (must pass)
3. `npm run package` (esbuild bundle)
4. `npx vsce package` → produces markflow-pro-x.x.x.vsix

## Publish Steps (human does this, not Claude)
1. Review VSIX contents: `npx vsce ls`
2. `npx vsce publish` — requires PAT in VSCE_PAT env var
3. Update CHANGELOG.md
4. Tag git commit: `git tag vX.X.X`

## Version Bumping
- Patch (0.0.x): bug fixes
- Minor (0.x.0): new free features
- Major (x.0.0): significant Pro feature additions or breaking changes

## Marketplace Listing Copy
- Short description (max 100 chars): "Smart Markdown preview that actually follows your active file. Free + Pro."
- Full description: see sprints/sprint-01-core-preview.md → Marketplace Listing section
