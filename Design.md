# Design.md — SkillSwap

## 1. Design Philosophy
The visual system is anchored to **Linear** — clean typography, generous whitespace, subtle borders, restrained color usage. Other product inspirations below are borrowed **only for layout and interaction patterns**, never for their own colors, fonts, or shadow styles. This keeps the app visually cohesive instead of looking like a patchwork of six different products.

**Rule of thumb:** if it's about *how something is structured or behaves*, borrow it. If it's about *color, type, or shadow*, it comes from SkillSwap's own system below.

## 2. Inspiration Reference

| Feature | Inspiration | What's actually borrowed |
|---|---|---|
| Entire Design System | Linear | Typography scale, spacing rhythm, subtle borders over heavy shadows, minimal color use |
| Profile | GitHub + LinkedIn | Layout structure: avatar + stats row + activity/skills sections beneath |
| Search | Airbnb | Filter bar placement, result-card grid layout |
| Chat | Discord | Message grouping, sidebar-style room list, timestamp placement |
| Portfolio | Instagram | Grid layout, tap-to-expand lightbox interaction |
| Forms | Notion | Inline, minimal-chrome form fields; clear field grouping |
| Notifications | GitHub | Dropdown/bell icon pattern, list grouped by recency |
| Cards | Linear | Flat cards, thin border instead of drop shadow, consistent padding |
| Typography | Linear | Type scale and weight hierarchy (see below) |
| Settings | Notion | Sidebar-navigated settings sections |

## 3. Color Palette

**Light mode**
| Token | Hex | Use |
|---|---|---|
| bg | `#F7F6F2` | Page background |
| surface | `#FFFFFF` | Cards, panels |
| border | `#E6E3DA` | Dividers, card borders |
| ink | `#16160F` | Primary text |
| ink-muted | `#6B6858` | Secondary text |
| accent (pine) | `#1B4332` | Primary actions, links, active states |
| accent-soft | `#E4EEE8` | Accent backgrounds, subtle highlights |
| gold | `#B8860B` | Ratings/stars only — never used for general UI |

**Dark mode**
| Token | Hex |
|---|---|
| bg | `#0F1210` |
| surface | `#181B18` |
| border | `#2A2E29` |
| ink | `#F2F1EC` |
| ink-muted | `#9C9A8C` |
| accent | `#3FA873` |
| accent-soft | `#1C2E24` |
| gold | `#D4A017` |

## 4. Spacing Tokens
```
xs  = 4px
sm  = 8px
md  = 16px
lg  = 24px
xl  = 32px
2xl = 48px
```
Maps directly to Tailwind's spacing scale — keeps padding/margin consistent across every component instead of ad-hoc values.

## 5. Border Radius Tokens
```
Cards:   16px
Buttons: 10px
Inputs:  10px
Badges:  fully rounded
Avatar:  fully circular
```

## 6. Typography (Linear-inspired)
- **Headings**: sans-serif, semi-bold to bold, tight letter-spacing, clear size hierarchy (e.g. 32/24/18/16px scale)
- **Body**: sans-serif, regular weight, comfortable line-height (~1.5)
- **Wordmark exception**: the SkillSwap logo/wordmark uses a serif typeface (Georgia) as a deliberate one-off brand accent — the rest of the app stays sans-serif

## 7. Component Patterns

**Cards** (Linear) — flat surface, 1px `border` token, consistent internal padding, no heavy drop shadows; hover state is a subtle border-color shift, not elevation.

**Profile Page** (GitHub + LinkedIn layout) — pfp + name + location at top, stats row (avg rating, completed swaps) beneath, skills-offered/wanted as tag lists, portfolio grid at the bottom.

**Search** (Airbnb layout) — persistent filter bar at top (skill search input), result cards in a responsive grid below, card shows pfp, name, location, top skills, rating.

**Chat** (Discord layout) — room list on the left (collapses on mobile), message thread on the right, grouped consecutive messages from the same sender, timestamp on hover/tap.

**Portfolio** (Instagram layout) — 3-column grid on desktop/tablet, 2-column on mobile, square thumbnails, tap opens a lightbox with caption and linked skill tag.

**Forms** (Notion layout) — minimal borders, label above field, inline validation messages, grouped sections with subtle dividers rather than boxed panels.

**Notifications** (GitHub layout) — bell icon with unread-count badge, dropdown list grouped by recency ("Today", "Earlier"), unread items visually distinct via `accent-soft` background.

**Settings** (Notion layout) — left sidebar with section links (Account, Privacy, Notifications), content panel on the right.

## 8. Responsive Behavior
- **Desktop (≥1024px):** multi-column layouts (search grid, chat sidebar + thread)
- **Tablet (768–1023px):** reduced grid columns, sidebar patterns collapse to a toggle where needed
- **Mobile (<768px):** single-column stacking, chat room list becomes a separate screen (not a persistent sidebar), portfolio grid drops to 2 columns

## 9. Accessibility Notes
- Maintain sufficient contrast between `ink`/`ink-muted` and `bg`/`surface` per WCAG AA
- Gold (`#B8860B` / `#D4A017`) reserved strictly for ratings — never used as a primary interactive color, avoiding confusion with action buttons
