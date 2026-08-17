# Execution Plan — m2-media-site Audit Fixes

Companion to `AUDIT.md`. One sweep, 14 subagents, 7 commits.
Target branch: `chore/audit-fixes`, cut from `add-open-social-ops-ai-sdlc-projects` (`7160e4c`).

| Decision | Your answer |
|---|---|
| Fonts | Self-host. Tooling limited to GitHub Pages + GitHub Actions. |
| Themes | Keep the switcher. Add dark mode. |
| Git | One branch. One commit per phase. No push. |

---

## 0. Prerequisites — read before you start

### 0.1 Switch the session model
This session runs `claude-opus-5`. You asked for **Sonnet 5 at medium effort** as the
orchestrator. Change the session model before you run this plan. The per-agent models below
are set inside the workflow script, so they do not depend on the session model — but the
orchestrator does.

### 0.2 The sandbox cannot build Jekyll
Two hard limits found during the audit:

| Limit | Effect |
|---|---|
| `rubygems.org` returns 403 from the sandbox | `gem install jekyll` is impossible here |
| Your `vendor/bundle` is compiled for Ruby 2.6, machine has Ruby 3.0.2 | `bundle exec jekyll build` fails locally too |

**Consequence:** local verification is static only (parity diffs, empty-tag greps, JSON
validity, link resolution). The real Jekyll build is verified by the CI workflow that Phase 2
adds. This is why Phase 2 runs early — CI becomes the verifier for Phases 3 to 7.

### 0.3 The sandbox cannot download fonts
`fonts.gstatic.com` returns 403 from the sandbox. The `.woff2` files must be fetched where
there is network. Two routes, both inside your constraint:

| Route | How | Recommended |
|---|---|---|
| A | One-shot workflow `.github/workflows/fetch-fonts.yml`, run manually from the Actions tab. It downloads the `.woff2` files and commits them. | Yes — no local tooling |
| B | Run `tools/fetch-fonts.sh` in your own terminal, then commit | Fallback |

Agent `fonts` writes the `@font-face` CSS, the workflow and the script. It cannot produce the
font binaries. **Until the fonts land, the site falls back to the system font stack.** That is
a safe intermediate state, not a broken one.

### 0.4 The sandbox cannot delete files on your disk
The device bridge refuses `rm`. Deletions (11.3 MB of images, `_pr-assets/`, two JS files,
`sitemap.xml`) are handled as:

1. The orchestrator tries `git rm` (a git operation, not `rm`).
2. If that is refused, files move to `_to_delete/` and agent `hygiene` writes
   `tools/cleanup.sh` for you to run.

Either way you get a clear list. Nothing is removed silently.

### 0.5 One decision left, and it changes your deployment
Your repo has no workflow, so GitHub Pages builds the site with its built-in Jekyll, which is
pinned to an older version than the `jekyll 4.2.2` in your `Gemfile`. Your local build and
your live build are not the same Jekyll.

Phase 2 can go two ways:

| Option | Result | Risk |
|---|---|---|
| **2a — build check only** (default) | CI runs `jekyll build` and fails the PR on error. Pages keeps building the live site as it does today. | None. Version mismatch stays. |
| **2b — build and deploy from Actions** | CI builds with *your* `Gemfile` and deploys the output. Local matches live. Any Jekyll plugin becomes usable. | Changes how the site publishes. Needs Pages set to "GitHub Actions" in repo settings. |

The plan below assumes **2a**. Say the word and I switch it to 2b — it is a better end state,
it just touches your deployment. `jekyll-sitemap` (finding N-6) works under both, because it
is on the GitHub Pages supported-plugin list.

---

## 1. Contracts — fixed before any agent runs

Agents work in parallel on different files. These four contracts stop them disagreeing.
The orchestrator writes them into every agent prompt.

| # | Contract | Consumers |
|---|---|---|
| C1 | **Analytics attribute:** `data-ga-event="click_advisory"` and optional `data-ga-label="dolarplus"`. No inline `onclick` survives. | `templates`, `js` |
| C2 | **Font families keep their exact names:** `Space Grotesk`, `Playfair Display`, `Roboto`. Only the delivery changes (`@import` → `@font-face`). No CSS variable is renamed. | `fonts`, `css-dark` |
| C3 | **Focus token:** one rule, `:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 3px; }`, with `--focus-ring` defined in every theme block. | `css-a11y`, `css-dark` |
| C4 | **Link style:** every internal link becomes `{{ '/en/contact/' \| relative_url }}`. No page-relative and no parent-relative paths remain. | `templates`, `layout` |

Two more rules that apply to everyone:

- **ES and EN stay byte-identical** after swapping `lang:` and the App Store badge filename.
  The verifier enforces this.
- **No agent touches a file it does not own.** The ownership table in section 3 is exclusive.

---

## 2. Phases and commits

Seven phases, seven commits, in this order. The order is deliberate: legal risk first,
then the safety net, then the risky edits.

| # | Commit message | Findings closed | Agents |
|---|---|---|---|
| 1 | `fix: remove third-party font requests, empty hero, exposed docs` | B-1, B-2, I-7, I-8 | `cfg`, `fonts`, `copy` |
| 2 | `build: add CI build check and sitemap plugin` | I-1, N-6, N-7 | `cfg`, `ci` |
| 3 | `chore: delete dead code and unused assets` | O-1 … O-7, B-3 | `css-dead`, `js`, `hygiene` |
| 4 | `a11y: focus styles, skip link, main landmark` | N-1, N-2, N-3 | `css-a11y`, `layout` |
| 5 | `refactor: unify links, script loading, analytics and docs` | I-2 … I-6, O-5, B-4, B-5, B-6 | `templates`, `js`, `root`, `docs` |
| 6 | `perf: lazy-load images and add intrinsic dimensions` | N-8 | `templates` |
| 7 | `feat: differentiate themes and add dark mode` | N-4 | `css-dark` |

Phase 6 has no agent of its own — the `templates` agent produces phases 5 and 6 in one pass,
and the orchestrator splits the commit. Phase 8 is verification and produces no commit.

`N-5` (project cards with no destination) is **not** in this sweep. It needs product copy
decisions from you, not code.

---

## 3. Agents — model and effort

Orchestrator: **Sonnet 5, medium effort.** It never edits a file itself. It cuts the branch,
stages the tree, writes the contracts into prompts, commits each phase, and reads the verifier.

| # | Agent | Owns (exclusive) | Model | Effort | Why this tier |
|---|---|---|---|---|---|
| 1 | `cfg` | `_config.yml`, `Gemfile`, `sitemap.xml` | Sonnet 5 | low | Small, fully specified edits |
| 2 | `ci` | `.github/workflows/*` | Sonnet 5 | medium | New YAML plus three custom check scripts |
| 3 | `fonts` | `style.css` lines 1–2, `assets/fonts/`, `tools/fetch-fonts.sh` | Sonnet 5 | medium | Must derive correct `@font-face` from the two `@import` URLs |
| 4 | `copy` | `_data/copy.json` | Sonnet 5 | medium | Bilingual legal text. Do not send this to a cheap tier. |
| 5 | `css-dead` | `style.css` (deletions) | **Haiku 4.5** | — | Mechanical. The exact 38 selectors are already listed in `AUDIT.md` O-3/O-4. |
| 6 | `css-a11y` | `style.css` (additions) | Sonnet 5 | medium | Contrast judgement across 3 themes |
| 7 | `css-dark` | `style.css` (theme blocks) | Sonnet 5 | medium | Design work. The largest single task. |
| 8 | `js` | `assets/js/*` | Sonnet 5 | medium | Rewrites `lang-switcher.js`, writes `analytics.js` |
| 9 | `layout` | `_layouts/default.html`, `_includes/head.html` | Sonnet 5 | medium | Touches every page at once. High blast radius. |
| 10 | `templates` | all 14 files under `es/` and `en/` | Sonnet 5 | medium | 4 concerns × 14 files, must hold ES/EN parity |
| 11 | `root` | `index.html` | **Haiku 4.5** | — | ~30 lines, fully specified |
| 12 | `docs` | `CLAUDE.md`, `IA.MD`, `README.MD` | **Haiku 4.5** | — | Prose rewrite from a supplied fact list |
| 13 | `hygiene` | `tools/cleanup.sh`, `.gitignore` | **Haiku 4.5** | — | File list is already known |
| 14 | `verify` | nothing — read only | Sonnet 5 | medium | Must reason about whether a diff is correct |

**Delegation summary:** 4 of 14 agents on Haiku 4.5, 1 on Sonnet low, 9 on Sonnet medium.
Nothing runs on Opus.

The rule used: **Haiku when the task is "apply this exact list"**; Sonnet medium when the agent
must make a judgement that is expensive to get wrong (legal copy, colour contrast, or a file
that every page depends on).

---

## 4. Concurrency

Four agents want `assets/css/style.css`. They run as a chain, not in parallel:

```
fonts ──▶ css-dead ──▶ css-a11y ──▶ css-dark
```

This chain is the critical path. Everything else runs beside it:

```
Track A (CSS):        fonts → css-dead → css-a11y → css-dark
Track B (templates):  layout → templates
Track C (parallel):   cfg │ ci │ copy │ js │ root │ docs │ hygiene
                                    ↓
                              verify (last, alone)
```

`layout` runs before `templates` only so the `<main>` landmark moves in one direction —
into the layout, out of the three pages — and never exists twice.

---

## 5. Verification

The `verify` agent runs a static suite. Every check is one the audit already used, so a pass
means "no regression against the measured baseline".

| Check | Pass condition |
|---|---|
| JSON validity | `_data/copy.json` parses |
| ES/EN parity — data | Every key path under `es` exists under `en`, and the reverse |
| ES/EN parity — templates | `diff` of each page pair is empty after the `lang` and badge swap |
| Empty elements | No `>\s*</p>` or `></h2>` in any template |
| Copy coverage | Every leaf in `copy.json` is rendered; every `{{ copy.* }}` resolves to a real key |
| Third-party requests | Zero `googleapis`, `gstatic` or `fonts.` strings in `assets/` |
| Inline handlers | Zero `onclick=` in `es/` and `en/` |
| Dead CSS | Unused selector count is 0, down from 38 |
| Unreferenced assets | Unreferenced image count is 0, down from 5 |
| Link style | Zero internal `href` values that are not `relative_url` or an anchor |
| Focus coverage | Every interactive selector is reachable by the `:focus-visible` rule |
| Docs exposure | `_config.yml exclude` covers all three `.md` files |

Then CI does the part the sandbox cannot: a real `bundle exec jekyll build`, plus a link
resolution pass over `_site/`. If Phase 2 lands correctly, a red check on GitHub is the
signal that a later phase broke something.

**Manual step for you, at the end:** open the branch locally and look at the three themes in
light and dark, and tab through one page with the keyboard. Colour and focus are the two
things no static check can confirm.

---

## 6. Risk and rollback

| Risk | Likelihood | Control |
|---|---|---|
| Fonts do not arrive → site renders in fallback | Medium | Intentional and safe. The `@font-face` block is inert until the files land. |
| `css-dark` changes a colour you dislike | Medium | It is the last commit. `git revert` that one commit and everything else survives. |
| `css-dead` deletes a selector that is used | Low | The 38 selectors were measured, not guessed. The verifier re-counts. |
| `templates` breaks ES/EN parity | Low | Enforced by a `diff` check, which is how I-2 was found. |
| Removing `plugins: []` changes the live build | Low | Only if you choose option 2b. |

Rollback is per phase, because each phase is one commit. Nothing is pushed. Nothing is merged.

---

## 7. Effort

| Phase | Agents | Wall clock (parallel) |
|---|---|---|
| 1 | 3 | ~6 min |
| 2 | 2 | ~5 min |
| 3 | 3 | ~5 min |
| 4 | 2 | ~6 min |
| 5 | 4 | ~10 min |
| 6 | — | ~1 min |
| 7 | 1 | ~8 min |
| 8 | 1 | ~5 min |
| **Total** | **14** | **~45 min** |

Plus your part: run the font workflow once, run `tools/cleanup.sh` once, and review the
themes by eye.

---

## 8. Orchestration script (sketch)

The plan is executed by one `Workflow` call. Structure:

```js
export const meta = {
  name: 'm2-audit-fixes',
  description: 'Fix all 29 findings from AUDIT.md in seven reviewable commits',
  phases: [
    { title: 'Legal',        detail: 'fonts, privacy copy, doc exposure' },
    { title: 'Build',        detail: 'CI check, sitemap plugin, Gemfile' },
    { title: 'Dead code',    detail: 'CSS, JS and asset removal' },
    { title: 'Accessibility',detail: 'focus, skip link, landmark' },
    { title: 'Consistency',  detail: 'links, analytics, root page, docs' },
    { title: 'Themes',       detail: 'dark mode and theme differentiation' },
    { title: 'Verify',       detail: 'static suite over the whole tree' },
  ],
}

const CONTRACTS = `...C1-C4 verbatim...`

// Track A — serial, one file
const css = pipeline([STYLE_CSS],
  f => agent(FONTS_PROMPT,    { model: 'sonnet', effort: 'medium', phase: 'Legal' }),
  _ => agent(DEADCSS_PROMPT,  { model: 'haiku',                    phase: 'Dead code' }),
  _ => agent(A11YCSS_PROMPT,  { model: 'sonnet', effort: 'medium', phase: 'Accessibility' }),
  _ => agent(DARKCSS_PROMPT,  { model: 'sonnet', effort: 'medium', phase: 'Themes' }),
)

// Track C — independent files, true parallel
const rest = parallel([
  () => agent(CFG_PROMPT,     { model: 'sonnet', effort: 'low',    phase: 'Build' }),
  () => agent(CI_PROMPT,      { model: 'sonnet', effort: 'medium', phase: 'Build' }),
  () => agent(COPY_PROMPT,    { model: 'sonnet', effort: 'medium', phase: 'Legal' }),
  () => agent(JS_PROMPT,      { model: 'sonnet', effort: 'medium', phase: 'Consistency' }),
  () => agent(ROOT_PROMPT,    { model: 'haiku',                    phase: 'Consistency' }),
  () => agent(DOCS_PROMPT,    { model: 'haiku',                    phase: 'Consistency' }),
  () => agent(HYGIENE_PROMPT, { model: 'haiku',                    phase: 'Dead code' }),
])

// Track B — layout must precede templates
const tpl = pipeline([PAGES],
  _ => agent(LAYOUT_PROMPT,   { model: 'sonnet', effort: 'medium', phase: 'Accessibility' }),
  _ => agent(TEMPLATE_PROMPT, { model: 'sonnet', effort: 'medium', phase: 'Consistency' }),
)

await Promise.all([css, rest, tpl])
return await agent(VERIFY_PROMPT, { model: 'sonnet', effort: 'medium', phase: 'Verify' })
```

Files are edited in the sandbox copy of the tree. After each phase the orchestrator writes the
changed files back to your disk and makes that phase's commit.

---

## 9. What I need from you to start

1. Switch the session model to **Sonnet 5, medium effort**.
2. Confirm **2a or 2b** (build check only, or build and deploy from Actions).
3. Say go.

Nothing in this plan pushes, merges, or touches `main`.
