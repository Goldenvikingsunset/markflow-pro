# Rule: Monetisation

## Model
- Free tier: unlimited, published to VS Code Marketplace
- Pro tier: licence key via LemonSqueezy, validated online at activation then cached locally

## LemonSqueezy Integration
- Store ID: 179829 (existing Ginger Turtle store — same as SaveFlow)
- Licence validation endpoint: https://api.lemonsqueezy.com/v1/licenses/validate
- Licence key stored in VS Code SecretStorage (never in plain settings.json)
- Validate on extension activate if key exists, re-validate every 7 days
- Grace period: if validation fails due to network error, allow 3 days offline use

## Pro Pricing (to be set in LemonSqueezy dashboard)
- Monthly: £2.99/month
- Annual: £19.99/year  
- Lifetime: £39.99 one-time

## Free Tier Features
- Auto-open preview when .md file opens
- Preview follows active editor across all split groups
- Preview re-opens after manual close
- Smart auto-close when leaving .md (configurable)
- Layout modes: side-by-side, below, tab
- Status bar indicator

## Pro Tier Features
- Custom preview themes (GitHub Dark, Notion-style, Bear, Obsidian)
- Export to PDF (via VS Code print API + headless)
- Export to HTML (standalone, self-contained)
- Outline sidebar with drag-and-drop section reordering
- Frontmatter/YAML metadata display panel
- Word count + reading time in status bar
- Focus/Zen mode (distraction-free writing)

## Upgrade Flow
When user hits a Pro feature gate:
1. Show info message with "Activate Pro" and "Learn More" buttons
2. "Learn More" → opens https://gingerturtleapps.github.io/markflow-pro
3. "Activate Pro" → opens licence key input box → validates → stores in SecretStorage

## Do Not
- Do not disable or cripple core free features as a conversion tactic
- Do not nag on every session — show upgrade prompt max once per day
