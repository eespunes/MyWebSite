# Site Content — Erik Espuñes Jubero

Source of truth for everything the page renders. Edit here, then mirror the
change into the matching `<!-- START: ... -->` block in `index.html`.
If something is not written here, the page does not render it.

## Meta

| Field | Value |
| --- | --- |
| Page title | Erik Espuñes Jubero |
| Description | Erik Espuñes Jubero — Senior Software Engineer. Scalable, secure backend services in Java and Spring Boot on AWS. |
| Author | eespunes |
| Theme color | #121212 |
| Favicon | assets/images/favicon.png |

## Navigation

One gesture moves exactly one section: wheel, arrow/page keys and swipes are locked to a single page turn and cannot rest between sections. Sections whose content overflows scroll internally first. Free scrolling below 900px.

## Design tokens

| Token | Value |
| --- | --- |
| Ink (dark bg) | `#121212` |
| Paper (light bg) | `#EDEDED` |
| Accent | `#00BF63` |
| Display font | Poppins |
| Mono font | JetBrains Mono |

## Home

- **Eyebrow:** Senior Software Engineer
- **Name:** ERIK / ESPUÑES Jubero *(last line in accent green)*
- **Portrait:** assets/images/avatar.jpg (900×900 square, centre-cropped; rendered grayscale by CSS, max 280px)
- **Lead:** Scalable, secure backend services in Java and Spring Boot on AWS — owned end to end, from technical design through production.
- **Buttons:** View experience → #s-experience · Play the games → #s-games
- **Background:** binary marquee under the topbar; no matrix-rain canvas
- **Terminal:** boxed panel (#0d0d0d on a #1f2f26 border) with the typed lines below
- **Typed terminal lines** (`assets/js/site.js`):
  - `java --spring-boot --aws --event-driven`
  - `migrate legacy/ --to cloud-native --in 6mo`
  - `scale pipeline 20 -> 300000 events/day`
  - `mcp connect copilot://customs-data`

## About

Layout: light section, fixed height with inner scroll pane.

**Lead:** I build backend systems that hold up — *scalable, secure and boring in the way production should be* — in Java and Spring Boot on AWS. *(the italic clause renders in accent green)*

**Body:** I like owning a solution end to end, from technical design through to production, and shaping the architecture and engineering standards a team works to along the way. I'm naturally curious and work things out for myself — part of why I enjoy tackling the problems most people would rather hand off.

### Headline numbers

| Figure | Label |
| --- | --- |
| 6 mo | Legacy → cloud-native migration originally scoped in years |
| $1M | Monthly revenue on the product whose squad I led |
| 10 | Engineers on the tracking platform I led development of |
| ~50 | Engineers using the AI tooling I shipped department-wide |

### Education

| Years | Title | Institution |
| --- | --- | --- |
| 2026–27 | MSc Artificial Intelligence | Udacity Institute of AI & Technology · expected |
| 2016–21 | Double BSc Computer Engineering & Video Game Design | Pompeu Fabra University, Barcelona |

### Languages

Spanish native · Catalan native · English fluent · Dutch basic

## Experience

Side note: Senior Software Engineer / Tech Lead
Layout: fixed-height section, content scrolls inside an inner pane. The Container xChange entry is collapsed by default ("Expand +").

### 2025 — now · Software Consultant · Xebia
Hilversum, NL · Hybrid · Jun 2025 – Present

Placed with client engineering organisations to lead backend architecture and modernisation work, and to raise the engineering standard of the teams I join.

**Client engagements**

#### UPS — Eindhoven, NL · Remote · Jul 2025 – May 2026
- Led transformation of global brokerage systems — migrated a giant legacy codebase to cloud-native architecture in **6 months with 7 engineers**, work initially scoped at multiple years.
- Architected customs data services handling cross-border declarations across three countries, meeting EU and US customs requirements in a regulated enterprise.
- Built an MCP integration connecting GitHub Copilot to customs-data sources; rolled it out department-wide, adopted by **~50 of 100+ engineers**.

### 2022 — 2025 · Software Engineer · Container xChange *(collapsible)*
Hamburg, DE · Mar 2022 – Apr 2025 · In-house product · [Recommendation letter](assets/cv/ErikEspunesJubero_RecommendationLetter.pdf)

Roles: Software Engineer · Mar 2025 – Apr 2025 | Junior Software Engineer · Sep 2022 – Mar 2025 | Intern · Mar 2022 – Aug 2022

- Led development of a global logistics tracking platform with a team of **10 engineers** — distributed microservices, REST APIs and end-to-end features on AWS with Java, Spring Boot and Angular.
- Directly led a 3-engineer squad on a product generating **$1M monthly revenue**.
- Automated the container-tracking pipeline into an event-driven system, scaling from **~20 to hundreds of thousands** of containers scraped per day.

## Competencies

Side note: High-volume, event-driven distributed systems on AWS — and increasingly, AI-assisted engineering that makes whole teams faster.

### Cards

| # | Title | Description | Tags |
| --- | --- | --- | --- |
| 01 | Backend & APIs | Distributed, event-driven services designed to survive production — modelled with DDD, tested before they ship. | Java · Spring Boot · .NET · OpenAPI · REST · Microservices |
| 02 | Cloud & Platform | Owning the path from laptop to production: infrastructure as code, pipelines and automated quality gates. | AWS · IaC · CI/CD · Automated testing · Observability |
| 03 | AI-Assisted Engineering | Building the tooling that makes an entire department faster, not just the engineer using it. | Claude · Codex · Copilot · MCP · Agentic workflows |

### Tag rows

| Label | Tags |
| --- | --- |
| Languages | C# · Java · Kotlin · Scala · C++ · SQL · TypeScript · Angular |
| Methodology | Agile / Scrum · DDD · TDD · Platform engineering · Tech lead |
| Leadership | Mentoring engineers · Architecture standards · Engineering standards |

## Personal Projects

Side note: Things I build on my own time — usually to scratch an itch, always to learn something that carries back into the day job.

| # | Project | Status | Description | Stack |
| --- | --- | --- | --- | --- |
| 01 | SmartBolus | [GitHub](https://github.com/eespunes/SmartBolus) | A minimalist Flutter app that helps people with diabetes calculate mealtime insulin doses — time-banded carb-to-insulin ratios, glucose correction via a sensitivity factor, and rounding for both standard and half-unit pens. Medical settings never leave the device: local storage only, no cloud, no tracking. | Flutter · Dart · Material 3 · shared_preferences |
| 02 | Thrive | In development · [GitHub](https://github.com/eespunes/thrive) | A family management app — shared budget, calendar, lists, weekly meal plan and a kitchen wall dashboard, synced in real time between family members across Android and iOS. No Cloud Functions: persistence is client-direct, and joining a family is verified by Firestore security rules over a salted hash, tested against the Firestore emulator in CI. | Flutter · Dart · Firebase Auth · Firestore · App Check · GitHub Actions |
| 03 | Xebec | In design | A multi-agent orchestration platform where autonomous coding agents pick up GitHub issues, work in isolated git-worktree sandboxes, and ship pull requests — gated by automated quality checks before any agent output is trusted. | Claude Agent SDK · Ollama · git worktrees · GitHub API |

## My Games

Intro: Where it started — the game design half of the double degree, plus a few jams.
Link out: https://eespunes.itch.io · Footer hint: "← Scroll sideways · 13 titles"
Layout: horizontal rail of uniform 232px cards — square cover image with corner chips (index, year, "Featured"), caption panel below the fold line.

| # | Game | Subtitle | Tech | Year | Image | Link |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | Kart Online *(featured)* | Final Bachelor Project | Unity · Multiplayer | 2021 | kart-online.png | https://eespunes.itch.io/kart-online |
| 02 | Gun Goal Tournament | Indie Dev Day Jam 2020 | Unity · Jam | 2020 | gun-goal-tournament.png | https://eespunes.itch.io/gun-goal-tournament |
| 03 | Stick Ink | Ludum Dare 46 | Unity · Jam | 2020 | stick-ink.png | https://eespunes.itch.io/stick-ink |
| 04 | Space Out | Ludum Dare 42 | Unity · Jam | 2018 | space-out.png | https://eespunes.itch.io/space-out |
| 05 | One Piece Tower Defense | University Project | Unity | 2020 | one-piece-tower-defense.png | https://eespunes.itch.io/one-piece-tower-defense |
| 06 | Simpson's Pacman | University Project | Unity | 2019 | simpson-pacman.png | https://eespunes.itch.io/simpsons-pacman |
| 07 | Angry Birds | University Project | Unity | 2019 | angry-birds.png | https://eespunes.itch.io/angry-birds |
| 08 | Arkanoid | University Project | Unity | 2018 | arkanoid.png | https://eespunes.itch.io/arkanoid |
| 09 | Pong | University Project | Unity | 2017 | pong.png | https://eespunes.itch.io/pong |
| 10 | Portal Prototype | University Project | Unity | 2020 | portal.png | https://eespunes.itch.io/portal |
| 11 | Mario 64 | University Project | Unity | 2020 | mario-64.png | https://eespunes.itch.io/mario-64 |
| 12 | First Person Shooter Prototype | University Project | Unity · Windows | — | fps.png | https://eespunes.itch.io/first-person-shooter |
| 13 | Animal Instinct | My first game | Unity · Android | — | animal-instinct.png | https://eespunes.itch.io/animal-instinct |

Cards 12 and 13 show no year — itch.io does not publish their release dates. Add a year to the `game-year` span in `index.html` to show one.

## Contact

- **Heading:** Let's build something solid.
- **Body:** Senior Software Engineer. Open to conversations about backend architecture, platform engineering and agentic developer tooling.
- **CV:** assets/cv/ErikEspunesJubero_CV.pdf

| Key | Value | Link |
| --- | --- | --- |
| Address | Toarteldostrjitte 40, 9269 NG, Feanwâlden, The Netherlands |
| Email | erik.espunyes7@outlook.com | mailto:erik.espunyes7@outlook.com |
| Phone | +31 6 2559 2282 | tel:+31625592282 |
| LinkedIn | eespunes | https://www.linkedin.com/in/eespunes/ |
| GitHub | eespunes | https://github.com/eespunes |

- **Footer:** © 2026 Erik Espuñes Jubero · Feanwâlden, NL
