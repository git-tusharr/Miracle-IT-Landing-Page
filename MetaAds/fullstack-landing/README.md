# Full Stack landing page (Meta Ads)

Miracle IT Career Academy. Plain HTML, CSS and JavaScript. No build step, no libraries.

Open `index.html` to preview, or host the whole folder on any static host.

## Before you run ads (2 things to fill in)

Both are at the top of `js/main.js`:

1. **`leadEndpoint`** is where form leads are sent. Until it is set, the form works on screen but the lead is NOT sent anywhere (it is only kept in the visitor's browser for testing).
2. **`metaPixelId`** is your Meta Pixel ID. Once set, the page fires `PageView`, `Lead` (on form submit) and `Contact` (on call and WhatsApp taps).

### Easiest lead setup: Google Sheet

1. Create a Google Sheet. Go to Extensions > Apps Script and paste:

```js
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('Leads') || ss.insertSheet('Leads');
  if (sh.getLastRow() === 0) {
    sh.appendRow(['Time','Name','Phone','You are','Course','utm_source','utm_medium',
                  'utm_campaign','utm_content','utm_term','fbclid','Landing URL']);
  }
  sh.appendRow([d.submitted_at, d.name, "'" + d.phone, d.status, d.course,
                d.utm_source, d.utm_medium, d.utm_campaign, d.utm_content,
                d.utm_term, d.fbclid, d.landing_url]);
  return ContentService.createTextOutput('ok');
}
```

2. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
3. Copy the web app URL into `leadEndpoint`.
4. Submit one test lead from the live page and confirm a row appears.

Any CRM webhook that accepts a JSON POST also works. The payload includes name, phone, status, UTMs, `fbclid`, and the `_fbp`/`_fbc` values for later Conversions API matching.

## Meta ad URL

Use URL parameters on the ad so every lead shows which campaign and creative it came from:

```
https://YOUR-DOMAIN/full-stack/?utm_source=facebook&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}
```

Set the campaign to optimise for the **Lead** event.

## Before going live

- `og:image` in `index.html` is a relative path. Change it to the full URL after hosting so WhatsApp and Facebook link previews work.
- The page has `noindex` so it does not compete with your main site in Google. Delete that one `<meta name="robots">` line if you want it indexed.
- Meta usually expects a privacy policy link on pages that collect personal details. Add one to the footer once you have the URL.
- Check the claims below match what you actually offer.

## Claims on the page (all taken from the master site)

- 4–6 months, in person at M.P. Nagar, morning/afternoon/weekend batches
- No coding background needed
- Class structure of 30 min concepts, 90 min live coding, 30 min review
- 5+ projects, finishing with a full-stack app with login, database and live link
- Free 30-minute counselling visit with a senior advisor
- Student placements shown are labelled as "across all Miracle IT courses"
- Reviews are word for word from the master site

## Files

```
index.html
css/style.css
js/main.js
assets/
  fonts/   Sora and Inter, self-hosted (no Google Fonts request)
  img/     logo, student photos (cropped), review photos
  tech/    React, Node.js, Express, PostgreSQL, MongoDB, HTML5, CSS3, JavaScript, Git, GitHub
  og.jpg   link preview image
```

Brand colours and fonts match the master site: `#07090E` background, `#FF7A00` orange, `#2563EB` logo blue, Sora for headings and Inter for text.
