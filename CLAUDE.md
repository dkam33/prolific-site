# CLAUDE.md — Prolific Fiber Website

This file tells Claude Code how to work on this project. Read it fully before making changes.

## What this project is

A 5-page static marketing/recruitment website for **Prolific Fiber**, a company that does
accountable door-to-door field sales of residential fiber internet. The pages are plain,
self-contained HTML files (CSS is inlined inside each file's `<style>` block — there is no
external stylesheet, no build step, no framework, no dependencies).

### The pages
- `index.html` — Home. Hero ("EARNED. NOT GIVEN."), three "pick your lane" cards → rep/dealer/isp, stats, links out.
- `rep.html` — "I'm a Rep." Earnings calculator, tier ladder, focus cards, pay-schedule calendar. The most component-heavy page.
- `dealer.html` — "I'm a dealer." Opportunity pitch for people who want to run their own crew/org.
- `isp.html` — "For ISPs." B2B pitch to internet service providers to let Prolific sell their service.
- `apply.html` — Booking page. All "Apply"/"Join"/"Book a call" buttons across the site link here. Has a slot for a Calendly (or similar) embed.

All five files must stay in the same folder; they link to each other by filename.

## CRITICAL RULES — do not break these

1. **CSS stays inlined.** Every page keeps its full CSS inside its own `<style>` block. Do
   NOT extract CSS into a shared `.css` file — the site is opened/previewed in places that
   don't load external files, and an external stylesheet makes pages render as unstyled
   garbage. If you change a shared style, apply the same change in ALL pages that use it.
2. **Keep pages self-contained.** No external CSS/JS files, no new build tooling, no npm
   packages, no frameworks. Fonts load from Google Fonts via `<link>` — that's fine.
3. **The logo is an embedded base64 data URI** in the nav and footer of each page. Don't
   replace it with a file path.
4. **Never touch DNS, MX, or email-related config.** Not your job and not in this repo.

## Brand & design system (keep consistent across all pages)

- **Background:** near-black charcoal `#141414` (deepest `#0d0d0d`).
- **Primary accent:** khaki `#c4af9a`. Text on khaki fills uses `--accent-ink:#272727`.
- **Secondary:** grey text `#ECECEC`; the lighter split-headline word uses `#DCDCDC`.
- **Tertiary:** blue `#2a7f9e` (used sparingly — calculator bar tip, faint glows, some pins).
- **Display font:** Teko (headings, big numbers), weight 600, tight line-height.
- **Body/UI font:** Inter (400/500/600).
- **Mono font:** JetBrains Mono (eyebrow labels, tape, button labels, data captions).
- **Two-tone headlines:** first word grey `#DCDCDC` (`.out` class), second word khaki (`.hot` class).
- **Signature motifs:** topographic contour lines (`.topo`) behind heroes; dashed "tape"
  marquee divider; glass cards with corner ticks (`.ticked`); big faint section-index
  numbers (`.sec-idx`); page-load rise-in animation (`.load`); scroll reveal (`.reveal`).
- Respect `prefers-reduced-motion` (already wired in the CSS).

When adding new sections, reuse existing classes (`.glass`, `.btn`, `.eyebrow`, `.sec-head`,
`.feat`, `.stat`, `.tape`, etc.) so new content matches. Read an existing section in the same
file and mirror its structure before inventing new markup.

## Placeholder content that still needs real data

These are invented placeholders the owner will replace. If asked to update them, change the
value everywhere it appears across all pages, and remove the nearby dashed `.fillin` note box
once a value is confirmed real:
- Rep pay schedule: bi-weekly, paydays 12th & 26th, cutoffs 6th & 20th, 90-day chargeback window.
- Dealer override: $40 per install.
- ISP stats: 1,200+ installs/mo, 300+ reps, 18 markets, +22% take-rate lift.
- ISP carriers: Frontier, Kinetic, Brightspeed, Metronet.
- Apply page booking link: placeholder (needs a real Calendly/booking embed).

## Writing/voice

Confident, blue-collar, high-energy field-sales voice. Short punchy lines. The ethos is
"earned, not given" / "knock, close, install, get paid." Avoid corporate filler. Match the
tone of existing copy on the page before adding new copy.

## DEPLOY WORKFLOW — how to push changes live

This repo is connected to GitHub, and Vercel auto-deploys on every push to the `main` branch.
Pushing to GitHub = updating the live website (live within ~1 minute).

**After making and confirming edits, unless the user says not to, deploy by running:**

```bash
git add -A
git commit -m "<short clear message describing the change>"
git push
```

That's the whole deploy. Vercel handles the rest automatically. Notes:
- Use a concise, descriptive commit message about what actually changed.
- If the user says "deploy", "push it live", "publish", or "ship it", run the three commands above.
- If the user is just exploring or says "don't push yet" / "just show me", make the edits but
  do NOT commit or push — wait for them to approve.
- After pushing, tell the user it's live and that Vercel will reflect it within ~1 minute,
  and mention they can watch the deploy in the Vercel dashboard's Deployments tab.
- If `git push` fails for auth reasons, tell the user to run `gh auth login` (GitHub CLI) and retry.

## Before you finish any task
- Make sure every page you touched still has its CSS inlined and renders standalone.
- If you changed a shared component, confirm you applied it to all relevant pages.
- Keep internal links (nav, footer, buttons) pointing to the correct page filenames.
