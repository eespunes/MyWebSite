<!-- Build v1.97 · 2026-09-22 -->
# Site Content: Erik Espuñes Jubero

**This file is the site.** `index.html` is an empty shell: it fetches this file
at load and renders every section from it. Nothing is hard-coded in the HTML, so
if something is not written here, the page does not render it.

Keep the structure below; the parser relies on it:

- `## Section` starts a section; the order here is the order on the page.
- `- Key: value` lines are fields. `* ` lines are bullets.
- Tables are read by their header row.
- Blank-line-separated prose becomes paragraphs.
- `*italic*` renders in accent green; `**bold**` renders emphasised; `[text](url)` becomes a link.

## Meta

- Title: Erik Espuñes Jubero
- Description: Erik Espuñes Jubero, Senior Software Engineer. High-volume, event-driven backend platforms in Java, Spring Boot and .NET on AWS, owned from architecture through production.
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
- Lead: Scalable, secure backend platforms in Java, Spring Boot and .NET on AWS, owned end to end from architecture through production operation.
- Primary button: View experience → #s-experience
- Secondary button: Play the games → #s-games
- Scroll hint: Scroll

Rotating specialisations:

* Java & Spring Boot
* .NET
* AI Solutions Architecture
* Cloud-Native Architecture
* Mobile Development
* Game Development

## About

- Nav label: About
- Title: About / Me
- Theme: light

Lead: I build the backend systems businesses depend on: *scalable, secure and proven under production load*, in whatever stack is brought to me.

Body: I take end-to-end ownership of technical design, delivery and production operation, and shape the architecture and engineering standards a team works to. Java and Spring Boot are my deepest expertise; I bring the same standard to .NET. The problems most people would rather hand off are where I do my best work.

### Numbers

| Figure | Label |
| --- | --- |
| 6 mo | To deliver a legacy-to-cloud-native migration originally scoped in years |
| $1M | Monthly revenue of the product owned by the squad I led |
| 10 | Engineers on the tracking platform whose development I led |
| ~50 | Engineers who adopted the AI tooling I shipped department-wide |

### Education

| Years | Title | Institution |
| --- | --- | --- |
| 2026–27 (expected) | MSc Artificial Intelligence | Udacity Institute of AI & Technology |
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

- Period: 2025 / - / now
- Meta: Hilversum, NL · Hybrid · Jun 2025 – Present
- Tags: Leadership · AI · Cloud
- Summary: Brought into client engineering organisations to lead backend architecture and modernisation programmes, setting technical direction and raising the engineering standard of every team I join.
- Collapsible: expanded
- Engagements label: Client engagements

#### UPS

- Meta: Eindhoven, NL · Remote · Jul 2025 – May 2026
- Tags: .NET · AI · Leadership

* Led the transformation of global brokerage systems, migrating a large-scale legacy codebase to cloud-native architecture in **6 months with 7 engineers**, a programme originally scoped at multiple years.
* Architected the customs data services processing cross-border declarations across three countries, meeting EU and US regulatory requirements in a compliance-driven enterprise environment.
* Built an MCP integration connecting GitHub Copilot to customs data sources and led its department-wide rollout, adopted by **~50 of 100+ engineers**.

### Software Engineer · Container xChange

- Period: 2022 / - / 2025
- Meta: Hamburg, DE · Mar 2022 – Apr 2025 · In-house product
- Tags: Java · Spring Boot · Angular · TypeScript
- Collapsible: yes
- Link: Recommendation letter → assets/cv/ErikEspunesJubero_RecommendationLetter.pdf

* Led development of a global logistics tracking platform with a team of **10 engineers**: distributed microservices and REST APIs delivered end to end on AWS with Java, Spring Boot and Angular.
* Directly led a three-engineer squad accountable for a product generating **$1M in monthly revenue**.
* Re-architected the container-tracking pipeline into a high-volume, event-driven system, scaling daily throughput from **~20 to hundreds of thousands** of containers.

## Competencies

- Nav label: Competencies
- Title: Competencies
- Side note: High-volume, event-driven distributed systems on AWS, and the AI-assisted engineering practices that make whole teams faster.

### Cards

| # | Title | Description | Tags |
| --- | --- | --- | --- |
| 01 | Fullstack Engineering | Distributed, event-driven services engineered for production reality: domain-modelled, contract-first and tested before they ship, delivered end to end from API to interface. | Java · Spring Boot · .NET · Angular · TypeScript · OpenAPI · REST · Microservices |
| 02 | Cloud & Platform | Ownership of the full path to production: infrastructure as code, CI/CD pipelines and automated quality gates. | AWS · IaC · CI/CD · Automated testing · Observability |
| 03 | AI Solutions Architecture | Designing the AI solutions projects run on: multi-agent architectures, MCP integrations and the tooling that raises a whole department's output. | MCP · Claude Agent SDK · Multi-agent systems · Agentic workflows · Copilot |

### Tag rows

| Label | Tags |
| --- | --- |
| Languages | C# · Java · Kotlin · Scala · C++ · Dart · SQL · TypeScript · Angular |
| Mobile | Flutter · Dart |
| Gaming | Unity · Unreal |
| Methodology | Agile / Scrum · DDD · TDD · Platform engineering · Tech lead |
| Leadership | Mentoring engineers · Architecture standards · Engineering standards |

## Projects

- Nav label: Projects
- Title: Personal / Projects
- Side note: Self-directed products, built and shipped end to end, each chosen to master something that carries straight back into professional work.
- Link label: View on GitHub

| # | Project | Status | Description | Stack | Link |
| --- | --- | --- | --- | --- | --- |
| 01 | SmartBolus | | A minimalist Flutter app that helps people with diabetes calculate mealtime insulin doses: time-banded carb-to-insulin ratios, glucose correction via a sensitivity factor, and rounding for both standard and half-unit pens. Medical settings never leave the device: local storage only, no cloud, no tracking. | Flutter · Dart · Firebase · Android · Medical | https://github.com/eespunes/SmartBolus |
| 02 | Thrive | | A family management app: shared budget, calendar, lists, weekly meal plan and a kitchen wall dashboard, synced in real time between family members across Android and iOS. No Cloud Functions: persistence is client-direct, and joining a family is verified by Firestore security rules over a salted hash, tested against the Firestore emulator in CI. | Flutter · Dart · Firebase · Android | https://github.com/eespunes/thrive |
| 03 | Xebec | | A multi-agent orchestration platform where autonomous coding agents pick up GitHub issues, work in isolated git-worktree sandboxes, and ship pull requests, gated by automated quality checks before any agent output is trusted. | Claude Agent SDK · Ollama · git worktrees · GitHub API | |

## Games

- Nav label: Games
- Title: My Games
- Side note: Where the engineering began, the game-development half of a double degree, sharpened in game jams.
- Link: All on itch.io → https://eespunes.itch.io
- Hint: ← Scroll sideways · {count} titles
- Featured label: Featured

| # | Game | Subtitle | Tech | Year | Image | Link | Featured |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | Kart Online | Final Bachelor Project | Unreal · Multiplayer | 2021 | kart-online.png | https://eespunes.itch.io/kart-online | yes |
| 02 | Gun Goal Tournament | Indie Dev Day Jam 2020 | Unity · Jam | 2020 | gun-goal-tournament.png | https://eespunes.itch.io/gun-goal-tournament |  |
| 03 | Stick Ink | Ludum Dare 46 | Unity · Jam | 2020 | stick-ink.png | https://eespunes.itch.io/stick-ink |  |
| 04 | Space Out | Ludum Dare 42 | Unity · Jam | 2018 | space-out.png | https://eespunes.itch.io/space-out |  |
| 05 | Portal Prototype | University Project | Unity | 2018 | portal.png | https://eespunes.itch.io/portal |  |
| 06 | Mario 64 | University Project | Unity | 2018 | mario-64.png | https://eespunes.itch.io/mario-64 |  |
| 07 | First Person Shooter Prototype | University Project | Unity · Windows | 2018 | fps.png | https://eespunes.itch.io/first-person-shooter |  |
| 08 | One Piece Tower Defense | University Project | Unity | 2017 | one-piece-tower-defense.png | https://eespunes.itch.io/one-piece-tower-defense |  |
| 09 | Simpson's Pacman | University Project | Unity | 2017 | simpson-pacman.png | https://eespunes.itch.io/simpsons-pacman |  |
| 10 | Angry Birds | University Project | Unity | 2017 | angry-birds.png | https://eespunes.itch.io/angry-birds |  |
| 11 | Arkanoid | University Project | Unity | 2017 | arkanoid.png | https://eespunes.itch.io/arkanoid |  |
| 12 | Pong | University Project | Unity | 2017 | pong.png | https://eespunes.itch.io/pong |  |
| 13 | Animal Instinct | My first game | Unity · Android | 2016 | animal-instinct.png | https://eespunes.itch.io/animal-instinct |  |

## CV

The printable CV at `cv.html`. Name, contact, education, languages, the about
text, the highlight figures and the experience entries are reused from the
sections above, only what the web page has no place for lives here.

- Role: Senior Software Engineer
- Competencies label: Competencies
- Education label: Education
- Experience label: Experience
- Projects label: Personal projects
- Engagement label: Client engagement
- Online label: Online
- Languages label: Languages
- Back label: ← Back to site
- Save label: Save as PDF
- Version label: Build

### Skill groups

| Group | Tags |
| --- | --- |
| Programming | Java · C# · Kotlin · Scala · C++ · Dart · SQL · TypeScript · Angular |
| Mobile | Flutter · Dart |
| Gaming | Unity · Unreal |
| Methodology | Agile / Scrum · DDD · TDD · Platform engineering · Tech lead |
| Leadership | Mentoring engineers · Architecture standards · Engineering standards |

## Contact

- Nav label: Contact
- Theme: light
- Heading: Let's build / something solid.
- Body: Senior Software Engineer. Open to conversations on backend architecture, platform engineering and AI-assisted developer tooling.
- Button: Download CV → cv.html
- Location: Feanwâlden, The Netherlands
- Footer left: © 2026 Erik Espuñes Jubero
- Footer right: Feanwâlden, NL
- Version label: Build

| Key | Value | Link | CV only |
| --- | --- | --- | --- |
| Address | Toarteldostrjitte 40, 9269 NG, Feanwâlden, The Netherlands | | |
| Email | erik.espunyes7@outlook.com | mailto:erik.espunyes7@outlook.com | |
| Phone | +31 6 2559 2282 | tel:+31625592282 | |
| Website | erikespunesjubero.com | https://erikespunesjubero.com/ | yes |
| LinkedIn | eespunes | https://www.linkedin.com/in/eespunes/ | |
| GitHub | eespunes | https://github.com/eespunes | |
