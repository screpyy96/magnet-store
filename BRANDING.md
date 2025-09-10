Brand Guidelines – My Sweet Magnets

Overview
- Friendly, modern brand focused on custom photo magnets made in the UK.
- Confident gradient look blending Pink → Purple.

Core Assets
- Primary logo (horizontal wordmark): `public/logo.svg`
- Mark (icon-only): `public/logo-mark.svg`
- Favicon/AppIcon: `src/app/icon.svg` (Next.js will serve this automatically)

Colors
- Primary Gradient:
  - Pink: #EC4899 (Tailwind: pink-500)
  - Purple: #8B5CF6 (Tailwind: violet-500)
- Surface/Background: #FFFFFF
- Text: #111827 (Tailwind: gray-900)
- Muted Text: #6B7280 (Tailwind: gray-500/600)

Typography
- Inter / System UI stack
- Headings: 700–800 weight
- Body: 400–500 weight

Usage Guidelines
- Use `logo.svg` on desktop headers and marketing.
- Use `logo-mark.svg` for mobile headers, favicons, notifications, or tight spaces.
- Keep clearspace around the logo equal to the height of the “M” in the wordmark.
- Minimum sizes: 120px width for wordmark, 24px for icon.

Implementation Notes
- Navbar uses `logo.svg` on desktop and `logo-mark.svg` on mobile.
- Login/Register pages display `logo.svg` centered.
- SEO Organization schema uses absolute URL to `logo.svg`.
- Service Worker notifications use `logo-mark.svg`.
- PWA manifest theme color: `#EC4899`.

Files Updated
- `public/logo.svg`, `public/logo-mark.svg`, `src/app/icon.svg`
- `src/components/Navbar.jsx` (logo integration)
- `src/app/login/page.jsx`, `src/app/register/page.jsx` (logo)
- `src/components/SEO/OrganizationSchema.jsx` (logo URL)
- `public/service-worker.js` (notification icon)
- `confirm_signup_template.html` (branding + gradient)

Future Extensions
- Generate social OG images with the gradient + mark.
- Monochrome variants for dark imagery.
- Branded email footers and invoice PDFs.

