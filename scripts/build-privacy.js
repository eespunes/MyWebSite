// Build v1.134 · 2026-11-06
/* Generates static, readable-without-JavaScript privacy pages. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const config = require('../privacy/config.json');
const email = config.contactEmail;
const endpoint = config.submissionEndpoint;
if (endpoint && (!endpoint.startsWith('https://') || /[\s<>"']/.test(endpoint))) {
  throw new Error('submissionEndpoint must be an HTTPS URL without whitespace or HTML characters');
}
const escapedEndpoint = endpoint.replaceAll('&', '&amp;');
const apps = [
  { slug: 'thrive', name: 'Thrive', data: 'Account identity and sign-in details; family memberships and profiles; budgets, transactions and financial records; calendar events, plans, lists and other household content you enter.', purpose: 'Provide household planning and budgeting, sign-in, device synchronisation and family sharing.', services: 'The current app uses Google Firebase Authentication, Cloud Firestore, Cloud Functions and App Check, with optional Google sign-in. Shared family content is accessible to the family members you share it with.', deletion: 'The current in-app deletion flow removes your account and local app data. A family with no other members is deleted; a family with other members remains available to those members. Shared records need separate review when handling a personal-data deletion request.' },
  { slug: 'smart-bolus', name: 'Smart Bolus', data: 'Account identity and sign-in details; patient accounts and caregiver memberships; glucose and carbohydrate inputs, insulin dose logs, bolus settings and reminders; notification registration tokens. Health-related entries are sensitive personal data.', purpose: 'Provide the app’s calculations, history, reminders, device synchronisation and patient/caregiver sharing.', services: 'The current app uses Google Firebase Authentication, Cloud Firestore, App Check and Cloud Messaging, with optional Google sign-in. Patient information is accessible to caregivers granted access to the patient account.', deletion: 'The current in-app deletion flow removes your user profile, notification tokens and account memberships, and deletes patient groups you own with their associated records. Leaving a patient group you do not own does not delete that patient’s account.' },
  { slug: 'beest', name: 'Beest', data: 'Account identity and sign-in profile; custom exercises, routines, workout history and notes; sets, repetitions, exercise loads, durations, distances and effort ratings; schedules, time-zone settings and app preferences. Fitness records may reveal information about your health.', purpose: 'Provide workout tracking, exercise routines, training history, schedules and preferences, and synchronise your records across devices.', services: 'Beest uses Google Firebase Authentication, Cloud Firestore, Cloud Storage and Cloud Functions to operate the service, with Google sign-in for account access. Google processes data as our infrastructure provider. Content you choose to share or export may be accessible to its recipients.', deletion: 'Account deletion removes your Firebase Authentication identity, user profile, associated personal documents (including workout records, routines, custom exercises, schedules and settings), account files and account sharing links. Copies previously exported or saved by recipients are outside the app’s control.' }
];
const updated = 'Last updated: 22 October 2026';
const year = new Date().getFullYear();
const pad = (n) => String(n).padStart(2, '0');
const slugify = (title) => title.replace(/&[a-z]+;/g, ' ').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const arrow = (text) => `${text} <span aria-hidden="true">→</span>`;

/* Each page: shared header and footer around a body. The inline head script
   applies a saved theme before first paint; the toggle itself is privacy.js. */
function shell(title, area, body) { return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} · Erik Espuñes Jubero</title><meta name="description" content="App privacy information and account and data deletion requests."><link rel="icon" href="/assets/images/favicon.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap"><link rel="stylesheet" href="/assets/css/privacy.css"><script>try{var t=localStorage.getItem("cs-theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}</script><script src="/assets/js/privacy.js" defer></script></head>
<body><div class="scanlines" aria-hidden="true"></div><a class="skip" href="#main">Skip to content</a>
<header class="topbar"><div class="topbar-inner"><a class="brand" href="/">Erik Espuñes Jubero</a><div class="topbar-right"><nav class="topnav" aria-label="Support"><a href="/privacy/"${area === 'privacy' ? ' aria-current="page"' : ''}>App privacy</a><a href="/deletion/"${area === 'deletion' ? ' aria-current="page"' : ''}>Account deletion</a></nav><button class="theme-toggle mono" type="button" hidden></button></div></div></header>
<main id="main" class="wrap">${body}</main>
<footer class="foot"><div class="foot-inner"><p>Privacy contact: <a href="mailto:${email}">${email}</a></p><p>© ${year} Erik Espuñes Jubero</p></div></footer></body></html>\n`; }

function hero({ crumbs, eyebrow, title, lead, actions = '' }) {
  return `${crumbs ? `<nav class="crumbs mono" aria-label="Breadcrumb"><a href="${crumbs.href}"><span aria-hidden="true">←</span> ${crumbs.label}</a> <span aria-hidden="true">/</span> <span aria-current="page">${crumbs.current}</span></nav>` : ''}
<div class="hero"><p class="eyebrow"><span class="eyebrow-rule" aria-hidden="true"></span>${eyebrow}</p><h1>${title}</h1><p class="lead">${lead}</p>${actions}</div><hr class="rule">`;
}

/* Numbered blocks: policy sections and the deletion page's side notes. */
const numbered = (items, cls) => items.map((item, i) =>
  `<section class="${cls}" id="${item.id || slugify(item.title)}"><span class="num mono" aria-hidden="true">${pad(i + 1)}</span><div><h3>${item.title}</h3>${item.html}</div></section>`).join('\n');

function genericPolicy(app) {
  return [
    { title: 'Who is responsible', html: `<p>${app.name} is developed by Erik Espuñes Jubero. For privacy questions or requests, contact <a href="mailto:${email}">${email}</a>.</p>` },
    { title: 'Data the app handles', html: `<p>${app.data}</p>` },
    { title: 'How data is used', html: `<p>${app.purpose}</p>` },
    { title: 'Services and sharing', html: `<p>${app.services}</p>` },
    { title: 'Storage and retention', html: '<p>We keep account data and synchronised content while your account is active. Deletion requests are actioned within 30 days of identity verification. Limited security and backup logs may remain for up to 90 days for fraud prevention, security and legal compliance, then are deleted. These limits also apply to health and fitness data; we do not impose an additional medical-record retention period simply because the app handles health information.</p>' },
    { title: 'Security and storage', html: '<p>Cloud account information is stored using Google Firebase. Authentication and access controls restrict access to account data; passwords are handled by Firebase Authentication rather than stored by us in readable form. App preferences and cached records may also be stored on your device. Protect your device and account credentials. No electronic storage or transmission can be guaranteed completely secure.</p>' },
    { title: 'Sale and advertising', html: '<p>We do not sell personal data or share it for advertising. We use information to provide the app, maintain security and handle support and privacy requests.</p>' },
    ...(app.slug === 'smart-bolus' ? [
      { title: 'Sensitive health information', html: '<p>Smart Bolus handles glucose readings, carbohydrate and meal entries, insulin doses and dose history, insulin-to-carbohydrate ratios, sensitivity and target settings, reminders and patient/caregiver relationships. These details are used for the calculations, records, synchronisation and sharing features you use. They are not used for advertising or marketing profiles.</p><p>Caregivers with access to a patient account can view information available to their role. Only grant access to people you trust. You can remove caregiver access through the app’s sharing controls. Removing access cannot erase copies a recipient has already saved or exported.</p><p>You can disable notifications in device settings; reminders will then be affected. Notification previews may be visible on your device’s lock screen, depending on your settings. Exported reports are controlled by you and the recipients you choose.</p>' },
      { title: 'Health-data choices and consent', html: '<p>You may request access, correction, export or deletion of health records. Where processing relies on your consent, you can withdraw that consent by contacting us or requesting deletion; withdrawal does not affect processing already lawfully carried out. Features that need the deleted information may no longer work. This privacy policy does not itself obtain consent or replace any consent required within the app.</p>' },
      { title: 'Patient information entered by caregivers', html: '<p>Only enter or share another person’s health information when you have appropriate authority to do so. A parent, guardian or authorised representative can contact us to exercise the patient’s privacy rights; we verify their authority before disclosing or deleting records.</p>' },
    ] : []),
    { title: 'Your choices', html: '<p>Contact the developer to request access, correction or deletion of your personal information, or to ask about sharing and consent. Where applicable, you may also request a portable copy, restriction of processing, or object to processing, and lodge a complaint with your data-protection authority. Do not include passwords, medical records or financial details in your request.</p>' },
    { title: 'Deletion and shared data', html: `<p>${app.deletion}</p><p>Removing the app from your device does not by itself delete a cloud account. Copies you exported or shared outside the app may need to be removed separately.</p>` },
    { title: 'Requests through this page', html: '<p>The deletion form sends your app name, account email, requested deletion scope and optional details through <a href="https://formsubmit.co/privacy.pdf">FormSubmit</a> to our Gmail inbox. We use these details to verify and handle your request. Do not submit health records, financial records or passwords.</p>' },
    { title: 'Policy updates', html: '<p>Changes to this policy will be published on this page with an updated date.</p>' },
  ];
}

/* Thrive's policy is kept verbatim in scripts/privacy/thrive-policy.html:
   an intro, then "<h2>N. Title</h2>" sections. */
function thrivePolicy() {
  const reference = fs.readFileSync(path.join(__dirname, 'privacy/thrive-policy.html'), 'utf8');
  const [intro, ...parts] = reference.split('<h2>');
  return {
    intro: intro.replace(/<p class="updated">[\s\S]*?<\/p>/, '').trim(),
    sections: parts.map((part) => {
      const [title, ...rest] = part.split('</h2>');
      return { title: title.replace(/^\d+\.\s*/, '').trim(), html: rest.join('</h2>').trim() };
    }),
  };
}

function policyPage(app) {
  const thrive = app.slug === 'thrive' ? thrivePolicy() : null;
  const sections = thrive ? thrive.sections : genericPolicy(app);
  const toc = `<aside class="toc"><p class="toc-label mono">On this page</p><ol>${sections.map((s, i) => `<li><a href="#${slugify(s.title)}"><span class="mono" aria-hidden="true">${pad(i + 1)}</span>${s.title}</a></li>`).join('')}</ol></aside>`;
  return hero({
    crumbs: { href: '/privacy/', label: 'App privacy', current: app.name },
    eyebrow: 'Your data &amp; your choices',
    title: thrive ? 'Thrive privacy policy' : app.name,
    lead: thrive ? 'How Thrive collects, uses, stores and shares your data.' : 'Privacy policy.',
    actions: `<nav class="actions" aria-label="On this page"><a class="btn btn-primary" href="/deletion/${app.slug}/">Request deletion</a><a class="btn btn-ghost" href="#privacy-policy">Read privacy policy <span aria-hidden="true">↓</span></a></nav>`,
  }) + `
<div class="policy">${toc}<article id="privacy-policy" class="prose">${thrive ? '' : '<h2 class="section-title">Privacy policy</h2>'}<p class="updated mono">${updated}</p>${thrive ? `<div class="intro">${thrive.intro}</div>` : ''}
${numbered(sections, 'policy-sec')}</article></div>`;
}

function deletionPage(app) {
  const subject = `${app.name} account and data deletion request`;
  const form = `<section class="form-card" id="delete-account"><p class="eyebrow-sm mono">Request form</p><h2>Request deletion from ${app.name}</h2><p>You can request deletion without installing or signing in to the app. Use the email associated with your account so the developer can locate it and verify ownership before making changes.</p>
<form method="post" ${endpoint ? `action="${escapedEndpoint}"` : 'data-unconfigured="true"'}>
<input type="hidden" name="app" value="${app.name}">
<input type="hidden" name="_subject" value="${subject}">
<fieldset ${endpoint ? '' : 'disabled'}><legend class="mono">Deletion request details</legend>
<label for="account-email">Account email</label><input id="account-email" name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com">
<label for="scope">What would you like deleted?</label><div class="select"><select id="scope" name="scope"><option value="Delete my account and associated personal data">My account and associated personal data</option><option value="Delete selected personal data only">Selected personal data only</option></select></div>
<label for="details">Details <span>(optional)</span></label><textarea id="details" name="details" rows="4" maxlength="1000" aria-describedby="details-help"></textarea><p class="hint" id="details-help">For selected data, describe the category to delete. Do not include passwords, health measurements or financial records.</p>
<p class="notice">Your request is sent through <a href="https://formsubmit.co/privacy.pdf">FormSubmit</a> to our Gmail inbox. You may be asked to complete a spam-prevention check. Submit a request for the developer to review. Submitting this form does not automatically delete your account or data.</p><button class="btn btn-primary btn-block" type="submit">Submit deletion request</button></fieldset>
${endpoint ? '' : '<p role="status">Online submission is not yet connected. Please use the contact email below to request deletion.</p>'}
</form><p class="form-alt">You can also email <a href="mailto:${email}?subject=${encodeURIComponent(subject)}">${email}</a> directly with “${app.name} deletion request” and your account email.</p></section>`;

  const next = { title: 'What happens next', html: '<p>The developer will need to verify account ownership and clarify the scope of your request. Requests are actioned within 30 days of identity verification. We confirm completion by email.</p>' };
  const notes = app.slug === 'thrive' ? [
    next,
    { title: 'What is deleted', html: '<p>Your user profile, Firebase Authentication record, and any family workspace where you are the sole member, including its content and join credentials.</p>' },
    { title: 'What is retained', html: '<p>Shared family workspaces remain for other members; your membership is removed. Limited security and backup logs may remain for up to 90 days for security and legal reasons, then are deleted. Clear app storage or uninstall the app to remove data on your device.</p>' },
    { title: 'Delete in Thrive', html: '<p>You can also open Account (profile / settings), choose Delete account and confirm. You may need to sign in again to verify your identity.</p>' },
  ] : [
    next,
    { title: 'Deletion scope', html: `<p>${app.deletion}</p>` },
    { title: 'What is retained', html: '<p>Limited security and backup logs may remain for up to 90 days for fraud prevention, security and legal compliance, then are deleted. Records belonging to other users are not deleted by your request. Clear app storage or uninstall the app to remove data stored on your device. Copies you exported or that recipients saved separately must be removed separately.</p>' },
  ];

  return hero({
    crumbs: { href: '/deletion/', label: 'Account deletion', current: app.name },
    eyebrow: 'Account &amp; data',
    title: `${app.name} account &amp; data deletion`,
    lead: 'Operated by Erik Espuñes Jubero.',
  }) + `
<div class="deletion">${form}<div class="notes">${numbered(notes, 'note')}<p class="notes-link"><a class="link-mono" href="/privacy/${app.slug}/">${arrow(`Read the ${app.name} privacy policy`)}</a></p></div></div>`;
}

function indexPage({ title, lead, href, blurb, cta, aside }) {
  return hero({ eyebrow: 'App support', title, lead }) + `
<ol class="app-list">${apps.map((a, i) => `<li><a class="app-row" href="${href(a)}"><span class="num mono" aria-hidden="true">${pad(i + 1)}</span><span class="app-name"><strong>${a.name}</strong><span>${blurb}</span></span><span class="app-cta mono">${arrow(cta)}</span></a></li>`).join('')}</ol>
<p class="aside">${aside}</p>`;
}

for (const app of apps) {
  for (const area of ['privacy', 'deletion']) fs.mkdirSync(path.join(root, area, app.slug), { recursive: true });
  fs.writeFileSync(path.join(root, 'privacy', app.slug, 'index.html'), shell(`${app.name} privacy policy`, 'privacy', policyPage(app)));
  fs.writeFileSync(path.join(root, 'deletion', app.slug, 'index.html'), shell(`${app.name} account deletion`, 'deletion', deletionPage(app)));
}

fs.writeFileSync(path.join(root, 'privacy/index.html'), shell('App privacy', 'privacy', indexPage({
  title: 'Privacy &amp; your data',
  lead: 'Choose your app to read its privacy policy or request account and data deletion.',
  href: (a) => `/privacy/${a.slug}/`,
  blurb: 'Privacy policy &amp; deletion requests',
  cta: 'View app information',
  aside: `Looking to delete an account? <a class="link-mono" href="/deletion/">${arrow('Go to account deletion')}</a>`,
})));

fs.writeFileSync(path.join(root, 'deletion/index.html'), shell('Account and data deletion', 'deletion', indexPage({
  title: 'Account &amp; data deletion',
  lead: 'Choose the app you want to request deletion from.',
  href: (a) => `/deletion/${a.slug}/`,
  blurb: 'Account or data deletion request',
  cta: 'Request deletion',
  aside: `Want to read a policy first? <a class="link-mono" href="/privacy/">${arrow('Go to app privacy')}</a>`,
})));
