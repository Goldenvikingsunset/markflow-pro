# Rule: Testing

## Framework
- @vscode/test-electron for extension host tests
- Mocha as test runner
- chai for assertions

## Test File Location
- Unit tests: src/**/__tests__/*.test.ts
- Integration tests: test/suite/*.test.ts

## What Must Be Tested
- PreviewManager: file switch triggers preview update (core differentiator — must not regress)
- PreviewManager: preview re-opens after manual close
- PreviewManager: handles non-.md file activation (no crash)
- PreviewManager: split group switching updates preview
- LicenceManager: valid key activates Pro
- LicenceManager: invalid key is rejected cleanly
- LicenceManager: offline grace period works
- Config: all settings read correctly with defaults
- All Pro features: gate correctly when not activated

## Test Before Every VSIX Package
Run `npm test` and fix all failures before packaging. Do not skip tests.

## Manual Test Checklist (sprint completion gate)
- [ ] Open a .md file → preview appears automatically
- [ ] Switch to a .ts file → preview behaviour matches autoClose setting
- [ ] Open second .md file → preview updates to show new file
- [ ] Close preview manually → open another .md → preview reappears
- [ ] Open two .md files side by side in split groups → clicking each updates preview
- [ ] Copilot Tab completion works in .md files (no conflict)
- [ ] Prettier format on save works in .md files (no conflict)
