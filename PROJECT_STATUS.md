# Will Healthcare Portal — Project Status & Handover Documentation

> **Notice for Future Models & Developers:**  
> This file contains the complete historical context, architectural decisions, completed requirements, and client design guidelines for the **Will Healthcare** web portal. Please read this file before making any changes.

---

## 📌 Executive Overview
- **Repository:** `sarthakkhatri89-coder/will-healthcare`
- **Client Organization:** Will Healthcare Pvt. Ltd. & Biowil Formulation (Founded & owned by **Mr. Surender Singh Basera**)
- **Deployment Platform:** Vercel (connected to GitHub `main` branch, auto-deploys on push)
- **Primary Tech Stack:** HTML5, Vanilla CSS3 (`style.css`), Vanilla Modern JavaScript (ES6+ in `script.js`), JSON product catalogs. Zero heavy frontend frameworks or build steps required.

---

## 🏛️ Corporate Group Structure & Entities (Crucial Context)
All entities operate under the unified ownership and leadership of **Mr. Surender Singh Basera**:

| Company Name | Core Role | Scope / Specialty |
|---|---|---|
| **Will Healthcare Pvt. Ltd.** | Marketing & Flagship Hub | PCD Franchise (Monopoly rights across India), Ethical pharma marketing |
| **Biowil Formulation** | Manufacturing Arm | WHO-GMP Certified manufacturing for Gels, Creams, Lotions, Powders, Soaps (Drug & Cosmetic) |
| **Biocuree Pharmaceuticals** | Specialty Marketing | Dedicated marketing company for advanced therapeutic segments |
| **Saavya Pharmaceuticals** | Manufacturing Partner | Dedicated facilities for Drug & Food Tablets, Hard Gelatin Capsules, Softgels |
| **Aries Drugs** | Manufacturing Partner | Dedicated facility for Syrups, Suspensions & Liquid Orals |

> **Key Rule Established by Client:**  
> Always clearly distinguish between **Marketing Companies** (Will Healthcare, Biocuree Pharmaceuticals) and **Manufacturing Facilities** (Biowil Formulation, Saavya Pharmaceuticals, Aries Drugs) owned and spearheaded by Mr. Surender Singh Basera.

---

## 📂 Architecture & File Breakdown

### 1. `index.html` (Third-Party Manufacturing Homepage)
- **Focus:** Third-party / contract pharmaceutical manufacturing services.
- **Header / Navigation:**
  - Sticky solid white navbar (`#FFFFFF` background, solid border, elevation shadow).
  - Brand Logo: **Only** Will Healthcare Pvt. Ltd. logo (`will_logo_transparent.png`), no Biowil logo in the navbar.
  - Links: `Home`, `Capabilities`, `Certifications`, `PCD Franchise` (links to `pcd-franchise.html`), `Founder & Group` (links to `founder.html`), `FAQ`, `Contact`, plus primary CTA `Request Mfg Quote`.
- **Hero Section:**
  - Badge: `🏭 GMP Certified` (Strict client requirement: only keep "GMP Certified").
  - CTAs: Single focused primary button `Request Manufacturing Quote` (PCD franchise button was explicitly removed from hero CTA group).
  - Hero Stats Bar: 4-column CSS grid (`repeat(4, 1fr)`) with vertical pseudo-dividers:
    1. `10M+ Monthly Units Capacity`
    2. `4 Specialized Segments`
    3. `200+ Happy Brand Partners`
    4. `100% WHO-GMP & QC Verified`
    - Statically seeded values in HTML so numbers never appear stuck at `0`.
    - Script triggers counter animation automatically after 400ms entrance.
- **Manufacturing Segments:**
  - Tablets (Solid Orals, compression, coating, Alu-Alu/PVC packing).
  - Capsules (Beta-Lactam dedicated isolated suite vs Non-Beta/pellet suites).
  - Dermaceuticals & Topicals (Biowil Formulation plant for creams, ointments, lotions, soaps).
  - Liquid Orals (Syrups & suspensions via Aries Drugs facility).
- **Interactive RFQ / Quote Calculator & B2B Lead Form.**
- **Group Ecosystem Overview:** Showcases Biowil Formulation, Saavya, Biocuree, and Aries Drugs with links to `founder.html`.
- **Certifications & Compliance:** WHO-GMP, ISO, GLP, Schedule M adherence.
- **Note on Reviews:** The customer reviews/testimonials section was completely removed as per client request.

### 2. `founder.html` (Founder & Corporate Group Page)
- Dedicated page for **Mr. Surender Singh Basera (SSB)**.
- Features founder photo (`surender singh basera.jpeg`), profile story, vision, industry experience, and leadership philosophy.
- Dedicated showcase of all **5 Companies** with clear categorization of Manufacturing vs. Marketing divisions.
- Group manufacturing infrastructure highlights (Baddi plant specs, HEPA AHU zones, cleanroom classification, analytical labs).

### 3. `pcd-franchise.html` (PCD Pharma Franchise Portal)
- Dedicated exclusively to PCD Franchise opportunities and Will Healthcare's ethical product marketing portfolio.
- **Product Catalog Browser:**
  - Powered by `products-data.js` and real-time category filtering (Dermatology, Tablets, Capsules, Syrups, Pediatric, Nutraceuticals).
  - Live instant search.
  - "Inquire for PCD" action on every card which auto-prefills modal with the product name and code.
- **PCD Application Form:** Specific fields for State, Territory/District, Existing Experience, and Investment Capacity.
- Promotional kit breakdown: Visual aids, reminder cards, samples, MR bags, LBLs, catch covers.

### 4. `products-data.js` & `products.json`
- Calibrated array of products with names, compositions, dosage forms, packaging, categories, and verified image paths in `products/`.

### 5. `style.css`
- Modern, clean, professional healthcare theme.
- CSS variables defined in `:root` (primary blues `#2563eb`, `#1d4ed8`, deep navy `#0f172a`, purple `#7c3aed`, light backgrounds `#f8fafc`).
- Clean responsive breakpoints: 1100px, 992px, 960px, 768px, 640px, 480px.
- Navigation bar styling: Non-transparent, crisp typography, aligned items, mobile slide-in drawer.

### 6. `script.js`
- Mobile drawer navigation toggling.
- Hero counter animation:
  - `heroCounters`: Triggered automatically after page load (400ms delay) to avoid viewport intersection issues.
  - `bannerCounters`: Triggered via `IntersectionObserver` with low threshold (`0.1`).
- Product catalog dynamic rendering, search query listener, and category pill active states.
- B2B Modal inquiry auto-filler.
- Manufacturing RFQ cost estimation calculator.

---

## 📋 Client Change History Log

1. **Brand & Identity:**
   - Kept Will Healthcare transparent logo in top navigation. Removed secondary logos from top menu bar to keep header minimalist and clean.
   - Preserved both Will Healthcare and Biowil Formulation logos in the footer section.
2. **Founder & Group Separation:**
   - Moved founder details and company group portfolio to standalone `founder.html`.
   - Explicitly listed all 5 businesses: Will Healthcare, Biowil Formulation, Saavya Pharmaceuticals, Biocuree Pharmaceuticals, Aries Drugs.
3. **PCD Franchise Separation:**
   - Created standalone `pcd-franchise.html` for PCD distributors, decoupling it from the third-party manufacturing home page.
4. **Homepage Clean-up:**
   - Removed old matrix and removed customer reviews section completely.
   - Removed "Explore PCD Franchise" CTA from hero to keep primary focus on contract manufacturing quotes.
   - Badge in hero updated strictly to `🏭 GMP Certified`.
5. **Hero Stats Alignment & Counters:**
   - Converted `.hero-stats` into a 4-column CSS grid with pseudo-border dividers.
   - Expanded `.hero-content` max-width to 900px.
   - Fixed counter animation so numbers count up immediately without requiring scroll.

---

## 🛠️ How to Run & Test Locally
```powershell
# In the project root:
python -m http.server 8080
# Open browser at:
# http://localhost:8080/index.html
# http://localhost:8080/founder.html
# http://localhost:8080/pcd-franchise.html
```

---

## 🚀 Deployment Instructions
- The project is deployed on **Vercel**.
- Any commit pushed to `origin/main` (`https://github.com/sarthakkhatri89-coder/will-healthcare.git`) automatically triggers a deployment build on Vercel.
- Always run `git status` and test layouts across desktop and mobile screen widths before committing.
