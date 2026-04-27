# Command: Package VSIX

## Usage
Run this when ready to package for release or testing.

## Steps
1. Confirm all tests pass: `npm test`
2. Confirm CHANGELOG.md has an entry for this version
3. Confirm package.json version is bumped appropriately
4. Run: `npm run compile`
5. Run: `npm run package`
6. Run: `npx vsce package`
7. Report the output .vsix filename and size
8. Remind user to install locally with: Extensions → Install from VSIX
9. Remind user that publishing to Marketplace is a manual step
