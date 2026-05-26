# Dubai Outdoor Adventures

A premium Next.js tourism booking website for Dubai outdoor activities.

## Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **date-fns** — date formatting
- **lucide-react** — icons
- **clsx** — conditional classnames

## Project Structure

```
dubai-adventures/
├── app/
│   ├── components/
│   │   ├── Navbar.tsx          # Sticky nav with scroll effect
│   │   ├── Hero.tsx            # Full-screen hero with animated background
│   │   ├── ActivityGrid.tsx    # Grid with category filter tabs
│   │   ├── ActivityCard.tsx    # Card + expandable details panel
│   │   ├── BookingSteps.tsx    # 5-step booking flow with custom calendar
│   │   ├── BookingSidebar.tsx  # Sticky sidebar booking summary
│   │   ├── BookingSuccess.tsx  # Post-booking confirmation screen
│   │   └── Footer.tsx          # Full footer
│   ├── data.ts                 # All 8 activity packages
│   ├── types.ts                # TypeScript interfaces
│   ├── globals.css             # Custom CSS, fonts, animations
│   ├── layout.tsx              # Root layout with metadata
│   └── page.tsx                # Main page & state orchestration
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

### Activity Cards
- 8 Dubai adventure packages with Unsplash images
- Category filter (All / Desert / ATV / Luxury / Sky & Water / Yacht)
- Card hover animations (lift + image zoom + gold border glow)
- Expandable details panel with full description, highlights, and included items
- "Select Package" button inside expanded view

### 5-Step Booking Flow
1. **Package Summary** — Review selected package
2. **Date & Time** — Custom-built calendar picker + time slot selection
3. **Guests** — Adult/children counter with live price calculation
4. **Your Details** — Name, email, phone with validation
5. **Booking Summary** — Full review before confirming

### Booking Sidebar
- Live summary visible throughout booking flow
- Edit and remove booking options
- Trust badges (secure, free cancellation, no fees)

### Success Screen
- Booking confirmation with unique ID (e.g., `DXB-ABC123`)
- Full booking details card
- Actions: Book Another / Save PDF / Share

### Design
- Dark luxury aesthetic with gold (#C9922A) accents
- Playfair Display (serif) + DM Sans (body) typography
- Animated hero background (slow zoom pan)
- Scroll-reveal animations on activity cards
- Fully responsive (mobile, tablet, desktop)
- Custom scrollbar, glassmorphism sidebar
