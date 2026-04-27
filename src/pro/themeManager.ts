import { getTheme } from '../utils/config';
import { isProActivated } from './licenceManager';

type ThemeName = 'default' | 'github' | 'githubDark' | 'notion' | 'bear';

// ---------------------------------------------------------------------------
// GitHub Light
// ---------------------------------------------------------------------------
const GITHUB_CSS = `
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #1f2328;
  background: #ffffff;
  padding: 32px 40px;
  max-width: 800px;
  margin: 0 auto;
  word-wrap: break-word;
}
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.25;
  margin-top: 24px;
  margin-bottom: 16px;
}
h1 { font-size: 2em; padding-bottom: .3em; border-bottom: 1px solid #d0d7de; }
h2 { font-size: 1.5em; padding-bottom: .3em; border-bottom: 1px solid #d0d7de; }
h3 { font-size: 1.25em; }
h4 { font-size: 1em; }
h5 { font-size: .875em; }
h6 { font-size: .85em; color: #57606a; }
p { margin-top: 0; margin-bottom: 16px; }
a { color: #0969da; text-decoration: none; }
a:hover { text-decoration: underline; }
code {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 85%;
  background: #f6f8fa;
  padding: .2em .4em;
  border-radius: 6px;
  border: 1px solid rgba(31,35,40,.15);
}
pre {
  background: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  border: 1px solid #d0d7de;
}
pre code { background: none; border: none; padding: 0; font-size: 100%; }
blockquote {
  padding: 0 1em;
  color: #57606a;
  border-left: .25em solid #d0d7de;
  margin: 0 0 16px;
}
table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
th, td { padding: 6px 13px; border: 1px solid #d0d7de; }
th { background: #f6f8fa; font-weight: 600; }
tr:nth-child(2n) { background: #f6f8fa; }
img { max-width: 100%; height: auto; }
hr { border: 0; height: 1px; background: #d0d7de; margin: 24px 0; }
ul, ol { padding-left: 2em; margin-bottom: 16px; }
li { margin: 4px 0; }
`;

// ---------------------------------------------------------------------------
// GitHub Dark
// ---------------------------------------------------------------------------
const GITHUB_DARK_CSS = `
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #e6edf3;
  background: #0d1117;
  padding: 32px 40px;
  max-width: 800px;
  margin: 0 auto;
  word-wrap: break-word;
}
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.25;
  margin-top: 24px;
  margin-bottom: 16px;
}
h1 { font-size: 2em; padding-bottom: .3em; border-bottom: 1px solid #30363d; }
h2 { font-size: 1.5em; padding-bottom: .3em; border-bottom: 1px solid #30363d; }
h3 { font-size: 1.25em; }
h4 { font-size: 1em; }
h5 { font-size: .875em; }
h6 { font-size: .85em; color: #8b949e; }
p { margin-top: 0; margin-bottom: 16px; }
a { color: #58a6ff; text-decoration: none; }
a:hover { text-decoration: underline; }
code {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 85%;
  background: #161b22;
  padding: .2em .4em;
  border-radius: 6px;
  border: 1px solid #30363d;
}
pre {
  background: #161b22;
  border-radius: 6px;
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  border: 1px solid #30363d;
}
pre code { background: none; border: none; padding: 0; font-size: 100%; }
blockquote {
  padding: 0 1em;
  color: #8b949e;
  border-left: .25em solid #30363d;
  margin: 0 0 16px;
}
table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
th, td { padding: 6px 13px; border: 1px solid #30363d; }
th { background: #161b22; font-weight: 600; }
tr:nth-child(2n) { background: #161b22; }
img { max-width: 100%; height: auto; }
hr { border: 0; height: 1px; background: #30363d; margin: 24px 0; }
ul, ol { padding-left: 2em; margin-bottom: 16px; }
li { margin: 4px 0; }
`;

// ---------------------------------------------------------------------------
// Notion-style (serif, generous spacing)
// ---------------------------------------------------------------------------
const NOTION_CSS = `
body {
  font-family: Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif;
  font-size: 16px;
  line-height: 1.7;
  color: #37352f;
  background: #ffffff;
  padding: 48px 96px;
  max-width: 900px;
  margin: 0 auto;
  word-wrap: break-word;
}
h1, h2, h3, h4, h5, h6 {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-weight: 700;
  line-height: 1.3;
  margin-top: 2em;
  margin-bottom: .5em;
  color: #37352f;
}
h1 { font-size: 1.875em; }
h2 { font-size: 1.5em; }
h3 { font-size: 1.25em; }
h4 { font-size: 1.1em; }
h5, h6 { font-size: 1em; color: #6b6b6b; }
p { margin-top: 0; margin-bottom: 1em; }
a { color: #0f7b6c; text-decoration: underline; text-underline-offset: 2px; }
a:hover { color: #0b5e53; }
code {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 85%;
  background: rgba(55,53,47,.06);
  padding: .15em .35em;
  border-radius: 4px;
  color: #eb5757;
}
pre {
  background: rgba(55,53,47,.04);
  border: 1px solid rgba(55,53,47,.09);
  border-radius: 4px;
  padding: 16px 20px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.6;
}
pre code { background: none; color: inherit; padding: 0; font-size: 100%; }
blockquote {
  border-left: 3px solid rgba(55,53,47,.25);
  margin: 0 0 1em;
  padding: .2em 0 .2em 1.4em;
  color: #6b6b6b;
  font-style: italic;
}
table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
th, td { padding: 8px 14px; border: 1px solid rgba(55,53,47,.09); text-align: left; }
th { background: rgba(55,53,47,.04); font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
img { max-width: 100%; height: auto; border-radius: 4px; }
hr { border: 0; border-top: 1px solid rgba(55,53,47,.09); margin: 2em 0; }
ul, ol { padding-left: 1.6em; margin-bottom: 1em; }
li { margin: .3em 0; }
`;

// ---------------------------------------------------------------------------
// Bear — clean, warm, minimal
// ---------------------------------------------------------------------------
const BEAR_CSS = `
body {
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 15px;
  line-height: 1.7;
  color: #202124;
  background: #fafaf8;
  padding: 32px 48px;
  max-width: 720px;
  margin: 0 auto;
  word-wrap: break-word;
}
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.3;
  margin-top: 1.8em;
  margin-bottom: .5em;
  color: #1a1a1a;
}
h1 { font-size: 1.8em; }
h2 { font-size: 1.4em; }
h3 { font-size: 1.15em; }
h4, h5, h6 { font-size: 1em; }
p { margin-top: 0; margin-bottom: 1em; }
a { color: #d44000; text-decoration: none; border-bottom: 1px solid rgba(212,64,0,.3); }
a:hover { border-bottom-color: #d44000; }
code {
  font-family: Menlo, Monaco, "Courier New", monospace;
  font-size: 85%;
  background: #f2ede8;
  padding: .15em .4em;
  border-radius: 4px;
}
pre {
  background: #f2ede8;
  border-radius: 6px;
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.5;
}
pre code { background: none; padding: 0; font-size: 100%; }
blockquote {
  border-left: 4px solid #d4c5b0;
  margin: 0 0 1em;
  padding: .1em 0 .1em 1em;
  color: #6e6e6e;
  font-style: italic;
}
table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
th, td { padding: 6px 12px; border: 1px solid #e0d8cf; }
th { background: #f2ede8; font-weight: 600; }
tr:nth-child(2n) { background: #faf7f4; }
img { max-width: 100%; height: auto; border-radius: 4px; }
hr { border: 0; border-top: 1px solid #e0d8cf; margin: 2em 0; }
ul, ol { padding-left: 1.8em; margin-bottom: 1em; }
li { margin: .3em 0; }
`;

// ---------------------------------------------------------------------------
// Theme map — 'default' returns '' so PreviewManager uses its built-in CSS
// ---------------------------------------------------------------------------
const THEMES: Record<ThemeName, string> = {
  default: '',
  github: GITHUB_CSS,
  githubDark: GITHUB_DARK_CSS,
  notion: NOTION_CSS,
  bear: BEAR_CSS,
};

/**
 * Returns the CSS string for the currently selected Pro theme.
 * Returns '' when not Pro-activated or when theme is 'default',
 * causing PreviewManager to fall back to its built-in VS Code variable styles.
 */
export function getThemeCss(): string {
  if (!isProActivated()) { return ''; }
  const theme = getTheme() as ThemeName;
  return THEMES[theme] ?? '';
}
