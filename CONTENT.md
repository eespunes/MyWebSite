<!-- Build v1.146 · 2026-11-06 -->
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
- Description: Erik Espuñes Jubero, Senior Software Engineer. Scalable, secure platforms in Java, Spring Boot and .NET on AWS: fullstack delivery on a deep backend core, owned from architecture through production.
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
- Lead: Scalable, secure platforms in Java, Spring Boot and .NET on AWS: fullstack delivery on a deep backend core, owned end to end from architecture through production operation.
- Primary button: View experience → #s-experience
- Secondary button: Play the games → #s-games
- Scroll hint: Scroll

Rotating specialisations:

* Java & Spring Boot
* .NET
* Fullstack Engineering
* AI Solutions Architecture
* Cloud-Native Architecture
* Mobile Development
* Game Development

## About

- Nav label: About
- Title: About / Me
- Theme: light

Lead: I build the systems businesses depend on: *scalable, secure and proven under production load*, in whatever stack is brought to me.

Body: I take end-to-end ownership of technical design, delivery and production operation, and shape the architecture and engineering standards a team works to. I deliver fullstack, with my deepest expertise in the backend: Java and Spring Boot above all, and the same standard brought to .NET. The problems most people would rather hand off are where I do my best work.

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

- Period: 2025 / - / 2026
- Meta: Hilversum, NL · Hybrid · Jun 2025 – Dec 2026
- Tags: Leadership · AI · Cloud
- Summary: Brought into client engineering organisations to lead backend architecture and modernisation programmes, setting technical direction and raising the engineering standard of every team I join.
- Collapsible: expanded
- Link: Recommendation letter → assets/cv/ErikEspunesJubero_RecommendationLetter_Xebia.pdf
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
- Demo label: Demo & architecture
- Soon label: Case study soon

| # | Project | Status | Description | Stack | Link | Demo |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | SmartBolus | | A minimalist Flutter app that helps people with diabetes calculate mealtime insulin doses: time-banded carb-to-insulin ratios, glucose correction via a sensitivity factor, and rounding for standard and half-unit pens. Works fully offline; signing in adds cloud sync, sharing with carers, and insulin reminders. | Flutter · Dart · Firebase · Android · Medical | | projects/smartbolus/ |
| 02 | Thrive | | A family management app: shared budget, calendar, lists, weekly meal plan and a kitchen wall dashboard, synced in real time between family members on Android. Access is enforced by Firestore security rules tested against the emulator in CI, with a small set of Cloud Functions for admin-only actions like kid logins. | Flutter · Dart · Firebase · Android | | projects/thrive/ |
| 03 | Logpose | | A multi-agent orchestration platform where autonomous coding agents pick up GitHub issues, work in isolated git-worktree sandboxes, and ship pull requests, gated by automated quality checks before any agent output is trusted. | Claude Agent SDK · Ollama · git worktrees · GitHub API | | projects/logpose/ |

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

### Game page

- Back label: ← All games
- About label: About the game
- Downloads label: Downloads
- Other builds label: Other builds
- Controls label: Controls
- More label: More games
- Made for label: Made for
- Engine label: Engine
- Year label: Year
- Platforms label: Platforms
- Source label: Source code
- Itch label: itch.io page
- Play label: Play in browser
- Play itch label: Play on itch.io
- Play itch note: Plays on itch.io for now
- Download label: Download
- Download itch label: Download on itch.io
- Download itch note: Hosted on itch.io for now
- Restart label: Restart
- Fullscreen label: Fullscreen
- New tab label: New tab

### Game builds

A build is served from this site when its Source exists: for Web, a folder holding the web build's index.html; for downloads, a file URL such as a GitHub Release asset. Without one it is offered from the game's itch.io page.

| Game | Platform | Label | File | Size | Source |
| --- | --- | --- | --- | --- | --- |
| kart-online | Windows | | Build Cliente.zip | 801 MB | https://github.com/eespunes/MyWebSite/releases/download/games/Kart-Online-Client.zip |
| gun-goal-tournament | Windows | Optimised build | Windows - Mejor optimización | 221 MB | https://github.com/eespunes/MyWebSite/releases/download/games/Gun-Goal-Tournament-Windows-Optimised.zip |
| gun-goal-tournament | Windows | Full build | Windows | 560 MB | https://github.com/eespunes/MyWebSite/releases/download/games/Gun-Goal-Tournament-Windows.zip |
| stick-ink | Web | | | | games/stick-ink/build/ |
| stick-ink | Windows | | Stick Ink! - Windows.zip | 43 MB | https://github.com/eespunes/MyWebSite/releases/download/games/Stick-Ink-Windows.zip |
| stick-ink | macOS | | Stick Ink! - macOS.zip | 48 MB | https://github.com/eespunes/MyWebSite/releases/download/games/Stick-Ink-macOS.zip |
| stick-ink | Linux | | Stick Ink! - Linux.zip | 49 MB | https://github.com/eespunes/MyWebSite/releases/download/games/Stick-Ink-Linux.zip |
| space-out | Web | | | | games/space-out/build/ |
| space-out | Windows | | Space Out.rar | 17 MB | https://github.com/eespunes/MyWebSite/releases/download/games/Space-Out.rar |
| portal | Web | | | | games/portal/build/ |
| portal | Windows | | Portal.zip | 47 MB | https://github.com/eespunes/MyWebSite/releases/download/games/Portal.zip |
| mario-64 | Windows | | Mario.64.rar | 22 MB | https://github.com/eespunes/MyWebSite/releases/download/games/Mario-64.rar |
| first-person-shooter | Windows | | FPS.rar | 110 MB | https://github.com/eespunes/MyWebSite/releases/download/games/FPS.rar |
| one-piece-tower-defense | Web | | | | games/one-piece-tower-defense/build/ |
| one-piece-tower-defense | Windows | | One Piece Tower Defense.rar | 19 MB | https://github.com/eespunes/MyWebSite/releases/download/games/One-Piece-Tower-Defense.rar |
| simpsons-pacman | Web | | | | games/simpsons-pacman/build/ |
| simpsons-pacman | Windows | | Simpsons Pacman.rar | 12 MB | https://github.com/eespunes/MyWebSite/releases/download/games/Simpsons-Pacman.rar |
| angry-birds | Web | | | | games/angry-birds/build/ |
| angry-birds | Windows | | Angry Birds.zip | 18 MB | https://github.com/eespunes/MyWebSite/releases/download/games/Angry-Birds.zip |
| arkanoid | Web | | | | games/arkanoid/build/ |
| arkanoid | Windows | | Arkanoid.rar | 12 MB | https://github.com/eespunes/MyWebSite/releases/download/games/Arkanoid.rar |
| pong | Web | | | | games/pong/build/ |
| pong | Windows | | Pong.rar | 12 MB | https://github.com/eespunes/MyWebSite/releases/download/games/Pong.rar |
| animal-instinct | Android | | Animal Instinct.apk | 119 MB | https://github.com/eespunes/MyWebSite/releases/download/games/Animal-Instinct.apk |

### Game details

Controls are `Keys: action` pairs separated by ` · `; alternative keys are separated by ` / `. Frame is the web build's width x height, used for the player's aspect ratio (16:9 when empty).

| Game | Repo | Controls | Frame |
| --- | --- | --- | --- |
| kart-online | https://github.com/eespunes/Kart-Online | W: Accelerate · S: Brake · A: Turn left · D: Turn right · Left click: Use object · Right click: Drift | |
| gun-goal-tournament | https://github.com/eespunes/Gun-Goal-Tournament | WASD: Move · Mouse: Camera · Left click: Shoot · Right click: Aim · Space: Jump · R: Reload | |
| stick-ink | https://github.com/eespunes/Stick-Ink | A / D: Move · Space: Jump · Left click: Attack · W / S: Climb ladders | 960x540 |
| space-out | https://github.com/eespunes/Space-Out | Mouse / Space: Play | 960x540 |
| portal | https://github.com/eespunes/Portal | WASD: Move · Left click: Blue portal · Right click: Orange portal · Scroll: Portal size | 960x540 |
| mario-64 | https://github.com/eespunes/Mario-64 | WASD: Move · Space: Jump · Left click: Punch | |
| first-person-shooter | https://github.com/eespunes/FPS | WASD: Move · Left click: Shoot · Right click: Aim · Space: Jump | |
| one-piece-tower-defense | https://github.com/eespunes/One-Piece-Tower-Defense | Mouse: Play | 960x540 |
| simpsons-pacman | https://github.com/eespunes/Simpsons-Pacman | ← / ↑ / → / ↓: Move | 960x540 |
| angry-birds | https://github.com/eespunes/Angry-Birds | Click and drag: Aim and launch | 960x600 |
| arkanoid | https://github.com/eespunes/Arkanoid | ← / →: Move · Space: Launch ball | 960x540 |
| pong | https://github.com/eespunes/Pong | W / S: Left paddle · ↑ / ↓: Right paddle | 960x540 |
| animal-instinct | https://github.com/eespunes/Animal-Instinct | Swipe up: Jump · Swipe down: Slide · Swipe left / right: Change lane | |

### Install steps

#### Windows

* Download the build.
* Unzip it anywhere on your computer; a **.rar** opens with 7-Zip or WinRAR.
* Run the game's **.exe**. If Windows warns about an unrecognised app, choose `More info → Run anyway`.

#### macOS

* Download the build.
* Unzip it anywhere on your Mac.
* Right-click the app and choose `Open` the first time, as it isn't notarised.

#### Linux

* Download the build.
* Unzip it anywhere on your computer.
* Mark the game's binary as executable (`chmod +x`) and run it.

#### Android

* Download the **.apk** on your phone.
* Allow your browser to install apps if Android asks.
* Open the file to install. Not on Google Play.

### Game descriptions

The first paragraph of each game is the lead; *text* is shown in the accent colour.

#### kart-online

My final bachelor project: an *online multiplayer kart racer* built in Unreal Engine.

Players race each other over the network, pick up items on the track and use them against their rivals, and drift through the corners to keep their speed.

#### gun-goal-tournament

Welcome to the Gun Goal Tournament, *the one place on Earth where firearms are still allowed*.

Years after a worldwide ban on guns, someone asked what would happen if we made a sport for the people who still want to use them. So football was reinvented, with one difference: you move the ball by shooting it. Two players, five minutes, and whoever has scored more wins. Every surface is part of the pitch, and ammo dispensers on the floor refill over time.

Made by MadGames Studio for the Indie Dev Day 2020 game jam, whose theme was mixing two genres that shouldn't go together. Play solo with keyboard and mouse, or add a controller for split screen. Sofian Ben Ayata (design), Erik Espuñes (programming) and Walid Serroukh (art).

#### stick-ink

A stickman whose whole existence is fading, and *keeping him alive is in your hands*.

Fight the enemies trying to wipe him off the world and solve the puzzles that open each level. Luckily the ink gods are smiling on him, as divine ink pots hidden in the levels buy him more time. Made for Ludum Dare 46, whose theme was "Keep it alive".

#### space-out

A Ludum Dare 42 entry, *played with the mouse and the space bar*.

The jam's theme was "Running out of space".

#### portal

A Unity prototype of *Portal's portal gun*, built for a university course.

Left click places the blue portal, right click the orange one, and the scroll wheel changes their size.

#### mario-64

A *Super Mario 64-style 3D platformer* prototype, built in Unity for a university course.

Run, jump and punch your way around the level.

#### first-person-shooter

A *first-person shooter* prototype built in Unity for a university course, with aiming, shooting and jumping.

#### one-piece-tower-defense

A *One Piece tower defense* game built in Unity for a university course, played entirely with the mouse.

#### simpsons-pacman

*Pac-Man with a Simpsons theme*, built in Unity for a university course and played with the arrow keys.

#### angry-birds

A Unity recreation of *Angry Birds' slingshot physics*, built for a university course. Click and drag to aim, then let go to launch.

#### arkanoid

A Unity remake of the *Arkanoid brick breaker*, built for a university course. Move the paddle with the arrow keys and launch the ball with space.

#### pong

*Pong* rebuilt in Unity for a university course, for two players on one keyboard. W and S move the left paddle, the arrow keys move the right one.

#### animal-instinct

My first game, for Android: *swipe up to jump*, down to slide, and left or right to change lanes.

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
| Location | Feanwâlden, The Netherlands | | |
| Email | erik.espunyes7@outlook.com | mailto:erik.espunyes7@outlook.com | |
| Phone | +31 6 2559 2282 | tel:+31625592282 | |
| Website | erikespunesjubero.com | https://erikespunesjubero.com/ | yes |
| LinkedIn | eespunes | https://www.linkedin.com/in/eespunes/ | |
| GitHub | eespunes | https://github.com/eespunes | |
