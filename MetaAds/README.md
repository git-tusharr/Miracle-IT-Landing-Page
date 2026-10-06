# Meta Ads Landing Pages — Miracle IT Career Academy

Dedicated, conversion-optimized landing pages for Meta (Facebook & Instagram) ad campaigns. Each page features independent lead forms, Meta Pixel event tracking (`PageView`, `Lead`, `Contact`), and automatic campaign attribution (`utm_*`, `fbclid`, `_fbp`, `_fbc`).

---

## 1. Landing Page URLs

### Production URLs (When deployed on `miracleitindia.com`):
| Course | Canonical Destination URL | Short Aliases |
| :--- | :--- | :--- |
| **AI & Machine Learning** | `https://miracleitindia.com/MetaAds/aiml-landing/` | `/meta/aiml`, `/MetaAds/aiml` |
| **Data Analytics** | `https://miracleitindia.com/MetaAds/data-analytics-landing/` | `/meta/data-analytics`, `/MetaAds/data-analytics` |
| **Data Science** | `https://miracleitindia.com/MetaAds/data-science-landing/` | `/meta/data-science`, `/MetaAds/data-science` |
| **Full Stack Web Dev** | `https://miracleitindia.com/MetaAds/fullstack-landing/` | `/meta/fullstack`, `/MetaAds/fullstack` |

### Local Testing URLs:
| Course | Local URL |
| :--- | :--- |
| **Campaign Hub & Generator** | `http://localhost:3000/MetaAds/` |
| **AI & Machine Learning** | `http://localhost:3000/MetaAds/aiml-landing/` |
| **Data Analytics** | `http://localhost:3000/MetaAds/data-analytics-landing/` |
| **Data Science** | `http://localhost:3000/MetaAds/data-science-landing/` |
| **Full Stack Web Dev** | `http://localhost:3000/MetaAds/fullstack-landing/` |

---

## 2. Meta Ads Manager Setup Guide

When creating an ad in Meta Ads Manager:
1. **Campaign Objective**: Choose **Leads** or **Conversions**.
2. **Website URL (Destination URL)**: Attach the course URL with UTM tracking parameters:
   ```
   https://miracleitindia.com/MetaAds/fullstack-landing/?utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{adset.name}}&utm_term={{ad.name}}
   ```
   *Tip: You can use the live URL builder inside `http://localhost:3000/MetaAds/` to generate copy-paste ready URLs!*

---

## 3. Pixel & Lead Configuration

Before running live paid ads, configure the two settings at the top of `js/main.js` inside each landing page folder:

```javascript
const CONFIG = {
  leadEndpoint: 'https://script.google.com/macros/s/YOUR_APP_SCRIPT_ID/exec', // Google Sheet Web App URL or CRM Webhook
  metaPixelId: 'YOUR_META_PIXEL_ID', // Your 15-16 digit Meta Pixel ID
  ...
};
```

- When `metaPixelId` is set, the page automatically fires:
  - `PageView` upon loading.
  - `Lead` upon form submission.
  - `Contact` when clicking phone or WhatsApp buttons.
- When `leadEndpoint` is set, leads are posted directly to your Google Sheet or CRM with student name, phone, student status, course name, all UTM tags, timestamp, and Meta click IDs.
