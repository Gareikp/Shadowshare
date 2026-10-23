# Shadowshare Implementation Plan

## Goal
Deliver a simple, polished anonymous-messaging MVP with a landing page, a message submission page, and a private dashboard experience that matches the product vision in the repository.

## Current state
The repo is a static HTML/CSS landing page with a dark theme and placeholder pages for dashboard and message submission. The front-end assets are visually strong but incomplete, and there is no real interaction or workflow beyond a copy button in the landing page.

## MVP milestones

### 1. Front-end polish
- Finalize the landing page CTA flow and navigation.
- Ensure all pages share the same design system, spacing, and color palette.
- Add responsive layouts for mobile and tablet screens.

### 2. Message experience
- Build the anonymous message submission form with validation.
- Add preview behavior and a clean success state.
- Clearly communicate the privacy/anonymity model to visitors.

### 3. Dashboard experience
- Turn the dashboard placeholder into an actual inbox view.
- Show message counts, recent entries, and safety status cards.
- Create a straightforward layout for future backend integration.

### 4. Future backend integration
- Connect the “send message” form to an API or persistence layer.
- Store message records with moderation metadata.
- Add user-auth flows for profile creation and link generation.

## Recommended next steps
1. Convert the static HTML into reusable templates or a small client-side app if needed.
2. Add a lightweight data model for users and messages.
3. Introduce moderation and anti-abuse checks before production release.
4. Expand the design into a real product website after the MVP is stable.

## Success criteria
- The home page clearly explains the value proposition.
- Users can send and preview anonymous messages.
- The dashboard presents a believable inbox experience.
- The codebase is organized enough for backend wiring without a major rewrite.
