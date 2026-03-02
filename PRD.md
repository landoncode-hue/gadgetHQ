# Product Requirements Document (PRD): GadgetHQ Landing Page

**Project Name:** GadgetHQ  
**Status:** Initial Draft  
**Tech Stack:** Simple Web (HTML5, CSS3, Vanilla JS)

---

## 1. Project Overview
GadgetHQ is a high-conversion, mobile-first landing page designed to qualify leads for an "Original 20,000mAh Fast-Charging Power Bank" and redirect them to WhatsApp for final order confirmation.

### Core Objectives
- Minimize friction through a single-page, scrollable layout.
- Qualify users via a structured 4-step embedded form.
- Drive high-intent leads directly to WhatsApp.

---

## 2. Technical Stack (Basic)
To ensure maximum loading speed and compatibility, the project will use the most basic web tech stack:
- **Structure:** HTML5 (Semantic tags).
- **Styling:** CSS3 (Vanilla). No frameworks like Tailwind or Bootstrap unless requested. Flexbox/Grid for layout.
- **Logic:** Vanilla ES6+ JavaScript. No React/Vue/Next.js. 
- **Icons:** SVG or local icon files.
- **Hosting:** Static hosting (GitHub Pages, Netlify, or simple FTP).

---

## 3. Page Structure & Features

### Section 1: Hero Section (Trust + Product)
- **Headline:** Original 20,000mAh Fast-Charging Power Bank — Delivered Anywhere in Nigeria.
- **Subheadline:** Stay powered anywhere. Tested before dispatch. Fast charging. Long battery life.
- **Trust Bullets:**
    - Tested before dispatch
    - 7-Day replacement (factory fault only)
    - Nationwide delivery
    - Pay via transfer or card
- **CTA:** "Check Availability" (Smooth scroll to Section 2).

### Section 2: Embedded 4-Step Qualification Form
The form is the main engine of the page. It must appear as a multi-slide interface.

| Step | Title | Fields/Options |
| :--- | :--- | :--- |
| **1: Product Selection** | What would you like to order today? | 20,000mAh Fast Charging Power Bank |
| **2: Delivery Location** | Where should we deliver your order? | State (Dropdown), City/Area (Text input) |
| **3: Choose Your Deal** | Choose your preferred option | Option A (₦14k), Option B (₦26k), Option C (₦29k) |
| **4: Contact & Payment** | Almost Done — How Would You Like to Pay? | Name, WhatsApp Number, Payment Method selection |

**Form Logic:**
- **Progress Indicator:** Display "Step X of 4".
- **State Management:** Keep track of selections in the browser memory (JS object).
- **Client-Side Validation:** Ensure all fields are filled before proceeding to the next step.

### Section 3: WhatsApp Redirect
Upon clicking "Send My Order to WhatsApp", the user is redirected to a prefilled WhatsApp link:
```text
Hi GadgetHQ,
I want to order:
Product: [Selected Product]
Option: [Selected Deal Option]
Location: [City, State]
Payment Method: [Selected Method]

Name: [Customer Name]
Phone: [Customer Number]
```

### Section 4: Trust Strip (Optional)
- **Value Props:** Verified Quality, Fast Response, Transparent Pricing, No Hidden Charges.

### Section 5: FAQ (Objection Handling)
- Q: Is this original? (Yes, tested units).
- Q: Delivery time? (24-72h major cities).
- Q: Warranty? (7-day replacement).
- Q: Pay on delivery? (Selected cities only).

---

## 4. Inventory Management & Admin Space
To allow the client to manage products dynamically, we will use **Airtable**.
- **Admin UI:** Custom private dashboard ([admin.html](file:///Users/lordkay/Development/gadgetHQ/admin.html)).
- **Direct Image Upload:** Integrated upload functionality via ImgBB API to simplify media management.
- **Frontend:** Data fetched via simple `fetch()` calls.

---

## 5. Conversion Optimization (MarTech)
- **Tracking:** Facebook Pixel & Conversion API integration.
- **Events:** Track "Form Step Progress", "Check Availability Click", and "WhatsApp Redirect Click".
- **UX:** Sticky "Order Now" button on mobile devices.

---

## 5. Non-Functional Requirements
- **Performance:** 100/100 PageSpeed score for mobile (minimal JS/CSS).
- **Responsiveness:** Mobile-first approach; optimized for low-bandwidth networks in Nigeria.
- **Accessibility:** Ensure high contrast and readable typography.