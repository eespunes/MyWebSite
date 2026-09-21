<!-- Build v1.38 · 2026-09-21 -->
# Site Content — Erik Espuñes Jubero

**This file is the site.** `index.html` is an empty shell: it fetches this file
at load and renders every section from it. Nothing is hard-coded in the HTML, so
if something is not written here, the page does not render it.

Keep the structure below — the parser relies on it:

- `## Section` starts a section; the order here is the order on the page.
- `- Key: value` lines are fields. `* ` lines are bullets.
- Tables are read by their header row.
- Blank-line-separated prose becomes paragraphs.
- `*italic*` renders in accent green; `**bold**` renders emphasised; `[text](url)` becomes a link.

## Meta

- Title: Erik Espuñes Jubero
- Description: Erik Espuñes Jubero — Senior Software Engineer. Scalable, secure backend services in Java and Spring Boot on AWS.
- Author: eespunes
- Theme color: #121212
- Favicon: assets/images/favicon.png

## Nav

- Brand: Erik Espuñes Jubero
- Contact label: Contact

## Home

- Eyebrow: Senior Software Engineer
- Name: ERIK / ESPUÑES JUBERO
- Portrait: assets/images/avatar.jpg
- Lead: Scalable, secure backend services in Java and Spring Boot on AWS — owned end to end, from technical design through production.
- Primary button: View experience → #s-experience
- Secondary button: Play the games → #s-games
- Scroll hint: Scroll

Terminal lines:

* java --spring-boot --aws --event-driven
* migrate legacy/ --to cloud-native --in 6mo
* scale pipeline 20 -> 300000 events/day
* mcp connect copilot://customs-data

## About

- Nav label: About
- Title: About / Me
- Theme: light

Lead: I build backend systems that hold up — *scalable, secure and boring in the way production should be* — in Java and Spring Boot on AWS.

Body: I like owning a solution end to end, from technical design through to production, and shaping the architecture and engineering standards a team works to along the way. I'm naturally curious and work things out for myself — part of why I enjoy tackling the problems most people would rather hand off.

### Numbers

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

| Language | Level |
| --- | --- |
| Spanish | native |
| Catalan | native |
| English | fluent |
| Dutch | basic |

## Experience

- Nav label: Experience
- Title: Experience
- Side note: Senior Software Engineer / Tech Lead
- Expand label: Expand +
- Collapse label: Collapse −

### Software Consultant · Xebia

- Period: 2025 / — / now
- Meta: Hilversum, NL · Hybrid · Jun 2025 – Present
- Summary: Placed with client engineering organisations to lead backend architecture and modernisation work, and to raise the engineering standard of the teams I join.
- Engagements label: Client engagements

#### UPS

- Meta: Eindhoven, NL · Remote · Jul 2025 – May 2026

* Led transformation of global brokerage systems — migrated a giant legacy codebase to cloud-native architecture in **6 months with 7 engineers**, work initially scoped at multiple years.
* Architected customs data services handling cross-border declarations across three countries, meeting EU and US customs requirements in a regulated enterprise.
* Built an MCP integration connecting GitHub Copilot to customs-data sources; rolled it out department-wide, adopted by **~50 of 100+ engineers**.

### Software Engineer · Container xChange

- Period: 2022 / — / 2025
- Meta: Hamburg, DE · Mar 2022 – Apr 2025 · In-house product
- Collapsible: yes
- Roles: Software Engineer · Mar 2025 – Apr 2025 | Junior Software Engineer · Sep 2022 – Mar 2025 | Intern · Mar 2022 – Aug 2022
- Link: Recommendation letter → assets/cv/ErikEspunesJubero_RecommendationLetter.pdf

* Led development of a global logistics tracking platform with a team of **10 engineers** — distributed microservices, REST APIs and end-to-end features on AWS with Java, Spring Boot and Angular.
* Directly led a 3-engineer squad on a product generating **$1M monthly revenue**.
* Automated the container-tracking pipeline into an event-driven system, scaling from **~20 to hundreds of thousands** of containers scraped per day.

## Competencies

- Nav label: Competencies
- Title: Compe- / tencies
- Side note: High-volume, event-driven distributed systems on AWS — and increasingly, AI-assisted engineering that makes whole teams faster.

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

## Projects

- Nav label: Projects
- Title: Personal / Projects
- Side note: Things I build on my own time — usually to scratch an itch, always to learn something that carries back into the day job.
- Link label: View on GitHub

| # | Project | Status | Description | Stack | Link |
| --- | --- | --- | --- | --- | --- |
| 01 | SmartBolus | | A minimalist Flutter app that helps people with diabetes calculate mealtime insulin doses — time-banded carb-to-insulin ratios, glucose correction via a sensitivity factor, and rounding for both standard and half-unit pens. Medical settings never leave the device: local storage only, no cloud, no tracking. | Flutter · Dart · Material 3 · shared_preferences | https://github.com/eespunes/SmartBolus |
| 02 | Thrive | In development | A family management app — shared budget, calendar, lists, weekly meal plan and a kitchen wall dashboard, synced in real time between family members across Android and iOS. No Cloud Functions: persistence is client-direct, and joining a family is verified by Firestore security rules over a salted hash, tested against the Firestore emulator in CI. | Flutter · Dart · Firebase Auth · Firestore · App Check · GitHub Actions | https://github.com/eespunes/thrive |
| 03 | Xebec | In design | A multi-agent orchestration platform where autonomous coding agents pick up GitHub issues, work in isolated git-worktree sandboxes, and ship pull requests — gated by automated quality checks before any agent output is trusted. | Claude Agent SDK · Ollama · git worktrees · GitHub API | |

## Games

- Nav label: Games
- Title: My Games
- Side note: Where it started — the game design half of the double degree, plus a few jams.
- Link: All on itch.io → https://eespunes.itch.io
- Hint: ← Scroll sideways · {count} titles
- Featured label: Featured

| # | Game | Subtitle | Tech | Year | Image | Link | Featured |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | Kart Online | Final Bachelor Project | Unity · Multiplayer | 2021 | kart-online.png | https://eespunes.itch.io/kart-online | yes |
| 02 | Gun Goal Tournament | Indie Dev Day Jam 2020 | Unity · Jam | 2020 | gun-goal-tournament.png | https://eespunes.itch.io/gun-goal-tournament | |
| 03 | Stick Ink | Ludum Dare 46 | Unity · Jam | 2020 | stick-ink.png | https://eespunes.itch.io/stick-ink | |
| 04 | Space Out | Ludum Dare 42 | Unity · Jam | 2018 | space-out.png | https://eespunes.itch.io/space-out | |
| 05 | One Piece Tower Defense | University Project | Unity | 2017 | one-piece-tower-defense.png | https://eespunes.itch.io/one-piece-tower-defense | |
| 06 | Simpson's Pacman | University Project | Unity | 2017 | simpson-pacman.png | https://eespunes.itch.io/simpsons-pacman | |
| 07 | Angry Birds | University Project | Unity | 2017 | angry-birds.png | https://eespunes.itch.io/angry-birds | |
| 08 | Arkanoid | University Project | Unity | 2017 | arkanoid.png | https://eespunes.itch.io/arkanoid | |
| 09 | Pong | University Project | Unity | 2017 | pong.png | https://eespunes.itch.io/pong | |
| 10 | Portal Prototype | University Project | Unity | 2018 | portal.png | https://eespunes.itch.io/portal | |
| 11 | Mario 64 | University Project | Unity | 2018 | mario-64.png | https://eespunes.itch.io/mario-64 | |
| 12 | First Person Shooter Prototype | University Project | Unity · Windows | 2018 | fps.png | https://eespunes.itch.io/first-person-shooter | |
| 13 | Animal Instinct | My first game | Unity · Android | 2016 | animal-instinct.png | https://eespunes.itch.io/animal-instinct | |

## CV

The printable CV at `cv.html`. Name, contact, education, languages, the about
text, the highlight figures and the experience entries are reused from the
sections above — only what the web page has no place for lives here.

- Role: Senior Software Engineer
- About label: About Me
- Highlights label: Highlights
- Competencies label: Competencies
- Contact label: Contact
- Kicker: Experience & Projects
- Projects label: Personal / Projects
- Back label: ← Back to site
- Save label: Save as PDF
- Also label: Also
- Also: Game developer — Unity and C#. Games shipped on itch.io, from jam prototypes to a networked multiplayer racer.
- Quote: “Good, better, best. Never let it rest. Until your good is better and your better is best.”
- Summary: Backend engineer with deep expertise in Java and Spring Boot, building high-volume, event-driven distributed systems on AWS. Comfortable across modern platform engineering — cloud-native architecture, Infrastructure-as-Code, CI/CD and automated testing — and increasingly focused on AI-assisted engineering: MCP integrations and agentic coding workflows that make whole teams faster.
- Footer right: © 2026 Erik Espuñes Jubero
- Version label: Build

### Certifications

| Title | Note |
| --- | --- |
| Claude Certified Architect | expected Q3 2026 |

### Skill groups

| Group | Tags |
| --- | --- |
| AI | Claude · Codex · Copilot · MCP |
| Languages | Java · C# · Kotlin · Scala · C++ · SQL · TypeScript · Angular |
| Web & APIs | Spring Boot · OpenAPI · .NET · AWS |
| Method | Agile / Scrum · DDD · TDD · Platform engineering · Tech lead |

## Contact

- Nav label: Contact
- Theme: light
- Heading: Let's build / something solid.
- Body: Senior Software Engineer. Open to conversations about backend architecture, platform engineering and agentic developer tooling.
- Button: Download CV → cv.html
- Footer left: © 2026 Erik Espuñes Jubero
- Footer right: Feanwâlden, NL
- Version label: Build

| Key | Value | Link |
| --- | --- | --- |
| Address | Toarteldostrjitte 40, 9269 NG, Feanwâlden, The Netherlands | |
| Email | erik.espunyes7@outlook.com | mailto:erik.espunyes7@outlook.com |
| Phone | +31 6 2559 2282 | tel:+31625592282 |
| LinkedIn | eespunes | https://www.linkedin.com/in/eespunes/ |
| GitHub | eespunes | https://github.com/eespunes |
