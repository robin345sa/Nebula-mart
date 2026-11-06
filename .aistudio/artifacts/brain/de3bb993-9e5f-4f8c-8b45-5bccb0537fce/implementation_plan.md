# Customer Account Modal: Dedicated Order History Tab

Extend the Nebula Mart Customer Account modal (`AccountSupportModal.tsx`) with a dedicated **Order History** tab that fetches and renders past purchases from local storage (`StorageService.getOrders()`), presenting expandable cards with product images, live status tracking, delivery information, and instant re-order affordances.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed during Phase 1 interactive clarification:

- **Confirmed Decision 1 (Access Policy)**: Non-authenticated users will be prompted to log in or create an account before viewing their order history, keeping purchase records secure and tied to verified customer profiles. A quick-switch button to the Sign In / Sign Up tab is provided if a logged-out user clicks the Order History tab.
- **Confirmed Decision 2 (Card Presentation & Interactivity)**: Past purchases will render as **expandable cards** displaying order number, date, total amount, and badge status in the collapsed state, expanding on click to reveal product photos, quantities, price breakdown (subtotal, shipping, discount), delivery address, courier consignment info (if dispatched), and a working **"Reorder Items"** action.

---

## 1. Overview & Core Concept

- **What It Does**: Adds an intuitive tabbed navigation bar inside the Customer Account modal (`Profile` / `Order History` / `Help & Support`). When switching to **Order History**, the system queries local storage (`StorageService.getOrders()`) for all orders matching the logged-in customer's phone number, rendering them in reverse chronological order with interactive accordion expansion.
- **Target Audience / Persona**: Nebula Mart shoppers reviewing their purchase history, verifying delivery status for active orders, checking payment methods (Cash on Delivery / bKash / Nagad), and reordering favorite products without starting from scratch.
- **Key Value**: Delivers a seamless, self-service post-purchase experience directly within the customer's account view, reducing customer support queries and increasing repeat orders.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Modal Header Tabs**:
   - The modal header features clean, accessible segmented buttons:
     - `Account Profile` (`আমার প্রোফাইল` / `Profile`)
     - `Order History` (`অর্ডার হিস্ট্রি` / `Orders`) with a dynamic counter badge (`(X)`)
     - `Help & Support` (`সাহায্য ও সাপোর্ট` / `Help`)
2. **Logged-In Order History Flow**:
   - Switching to the `Order History` tab automatically fetches `StorageService.getOrders()` filtered by `activeCustomer.phone`.
   - **Summary Strip**: Displays total orders placed, total lifetime spend (৳), and active orders in transit.
   - **Order List**: Rendered as high-contrast cards with subtle borders:
     - **Header Bar**: `#ORD-XXXXX`, formatted date, status pill (`Pending`, `Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`), and toggle chevron.
     - **Expanded Body**:
       - Product items list with 48×48px rounded thumbnails, product names (bilingual Bengali/English), unit prices, and quantities.
       - Cost summary breakdown: Subtotal, Shipping Charge, Coupon Discounts, and Final Total.
       - Delivery & Payment info: Destination address, delivery district, courier tracking ID/link (Steadfast/Pathao), and payment method badge.
       - Action row: **"Track Delivery"** (opens live tracking modal) and **"Reorder Items"** (adds products back to shopping cart with feedback toast).
   - **Zero-State**: If the customer hasn't placed any orders yet, shows a helpful empty state illustration with an action button to "Start Shopping" (`পণ্য দেখুন`).
3. **Logged-Out Gate Flow**:
   - If a user opens the modal while not logged in and clicks the `Order History` tab, the view displays an informational prompt explaining that order history is linked to customer phone numbers, with a 1-click button to jump directly into the Sign In / Sign Up tab.

### Visual Identity & Theme Discipline

- **Color Discipline (60-30-10)**:
  - 60% Neutral canvas (`bg-white` and `bg-slate-50`).
  - 30% Structural surfaces: Clean hairline card borders (`border-slate-200`), muted metadata text (`text-slate-500`), subtle gray backgrounds for nested product item rows (`bg-slate-50/80`).
  - 10% Accent budget: Deep Nebula Mart navy (`#112A7E`) for primary interactive controls, action buttons, and active tabs; vivid status badges (Emerald for Delivered, Blue for Shipped, Amber for Processing/Pending, Red for Cancelled).
- **Typography & Tabular Discipline**:
  - All monetary values formatted with tabular figures: `font-bold text-[#112A7E] tabular-nums` (e.g. `৳2,450`).
  - Order IDs in clean monospace: `font-mono text-xs font-semibold`.
  - Bilingual localization (`en` and `bn`) throughout all labels and status badges.
- **Accessibility & Mobile Touch Targets**:
  - Touch targets $\ge 44\text{px}$ for all tabs, expand/collapse toggles, and reorder buttons.
  - Safe area scroll containment with `max-h-[85vh]` and smooth kinetic scrolling.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Tabbed Architecture Inside the Modal**:
  - *Chosen Approach*: Replace the current vertical stacking of forms and support accordions with a clean 3-tab segmented navigation bar at the top of the modal body.
  - *Why*: Reduces cognitive overload and vertical scrolling on mobile devices, giving each concern (Profile details, Order records, and Support channels) dedicated space.
- **Decision 2: Phone-Based Normalization for Order Matching**:
  - *Chosen Approach*: Match orders by stripping non-digit characters from both customer account phone and order `customerPhone` (e.g. `01712345678` matches `+8801712345678`).
  - *Why*: In Bangladesh e-commerce, customers frequently enter phone numbers with or without international country codes (`+880` or `01...`). Sanitization guarantees all user orders are retrieved reliably.
- **Decision 3: Reorder Capability**:
  - *Chosen Approach*: Provide a 1-click "Reorder Items" (`পুনরায় অর্ডার করুন`) button that matches items against current catalog inventory, re-adds available stock to the shopping cart via `StorageService.addToCart()`, and opens the cart drawer.
  - *Why*: Delivers an immediate commercial benefit and friction-free replenishment for repeat customers.

---

## 4. Technical Architecture & Data Strategy

### System Component & State Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       AccountSupportModal (React)                           │
│                                                                             │
│  State: activeTab ('profile' | 'orders' | 'support')                        │
│         activeCustomer (from StorageService.getActiveCustomer())             │
│         expandedOrderId (string | null for accordion toggle)                │
│         customerOrders (Order[] filtered by clean phone)                    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│     Profile & Auth Tab        │             │      Order History Tab        │
│                               │             │                               │
│ - Customer Info & Edit        │             │ - Total Orders / Spend KPI    │
│ - Sign In / Sign Up Forms     │             │ - Expandable Order Accordions │
│ - Logout Action               │             │ - Item Photos & Price Sums    │
└───────────────────────────────┘             │ - Live Delivery Tracker Link  │
                                              │ - Reorder to Cart Button      │
                                              └───────────────┬───────────────┘
                                                              │
                                      ┌───────────────────────┴───────────────┐
                                      ▼                                       ▼
                      ┌───────────────────────────────┐       ┌───────────────┴───────────────┐
                      │ StorageService.getOrders()    │       │ StorageService.addToCart()    │
                      │ (mart_store_orders)           │       │ (mart_store_cart)             │
                      └───────────────────────────────┘       └───────────────────────────────┘
```

### Data Flow & Event Integration

1. **Order Fetching**:
   - On modal mount or customer login change:
     ```typescript
     const allOrders = StorageService.getOrders();
     const cleanCustPhone = (activeCustomer?.phone || '').replace(/\D/g, '').slice(-10);
     const matched = allOrders.filter(o => 
       (o.customerPhone || '').replace(/\D/g, '').slice(-10) === cleanCustPhone
     );
     setCustomerOrders(matched);
     ```
2. **Order Expansion**:
   - `expandedOrderId`: Single-order accordion state toggled via click on order card header.
3. **Reorder Integration**:
   - When the user clicks "Reorder Items", each item in `order.items` is verified against live catalog stock via `StorageService.getProducts()`. Available items are added to `StorageService.addToCart()`, triggering `mart_cart_updated` and opening the cart drawer.
4. **Order Status Tracking**:
   - The existing `onOpenOrders(order.customerPhone)` handler is seamlessly wired to each card's "Track Shipment" button so users can inspect real-time courier checkpoints without closing and re-navigating.

---

## 5. Verification Plan

1. **Compilation Check**: Run `compile_applet` and `lint_applet` to verify zero TypeScript errors or missing imports.
2. **Tab Navigation Verification**:
   - Test switching between `Profile`, `Order History`, and `Help & Support`.
   - Ensure active tab indicator highlights clearly in both desktop and mobile viewports.
3. **Order History Verification**:
   - Verify that all past orders belonging to the logged-in customer render with correct order numbers, formatted dates, and currency totals (৳).
   - Test expand/collapse interaction for individual order cards.
   - Verify product thumbnails, unit quantities, subtotal, shipping charge, and courier tracking details render properly.
4. **Reorder Functionality**:
   - Click "Reorder Items" on a past order card and verify that cart items update in local storage and the cart drawer opens.
5. **Logged-Out State**:
   - Log out and switch to the `Order History` tab; verify the login requirement prompt appears with a working redirect to the Sign In tab.
