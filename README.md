## Overview

<div align="center">
  <img
    src="https://github.com/user-attachments/assets/c2e5fd51-4fcb-4925-a7a2-67d73f2f8d70"
    width="400"
  />
</div>
This project is a personal page builder designed for creators who want their online presence to feel intentional and personal.
</br>
It allows users to build a public-facing page using blocks such as links, text, images, videos, and maps — with an editing experience that feels more like creation than configuration.

## Motivation

This project started from a simple motivation:
I wanted to build the kind of personal page I personally wanted to use.

While many link-in-bio services are well-designed,
they often limit deeper customization behind predefined options or paid plans.
As a developer, I wanted more than configuration —
I wanted a page I could directly shape, extend, and experiment with.

Instead of managing settings, I wanted the experience to feel
like working in a creative workspace.
This project is my attempt to design and build that experience from scratch.

## Core Experience

The core idea of this project is to separate creation from configuration.

Users edit content in focused drawers/dialogs
and the preview refreshes after successful saves/reorders.
This reduces context switching and helps users stay focused on shaping
the page itself rather than managing settings.

## Key Features

- Block-based editor supporting links, text, images, videos, and map blocks
- Drawer/Dialog-based editing with preview refresh after saves/reorders
- Drag-and-drop reordering with consistent interaction patterns
- Public-facing page with a clear separation between editing and viewing
- Identity-based routing with handle updates
- Account lifecycle management, including safe account deletion

## Block System Design

All content types are implemented as reusable blocks
with a shared editing and rendering pattern.

Each block follows the same lifecycle:
edit → preview → publish.
This approach makes it easy to introduce new block types
without breaking existing interaction patterns.

## Public Page vs Creator Workspace

The product is intentionally split into two distinct experiences:

- A creator workspace for editing and arranging content
- A public page for viewing the final result

The public page is always read-only,
ensuring that creators can focus on building
while visitors experience a clean, distraction-free page.

## AI-Assisted Development

AI tools were used as an implementation assistant,
after the feature scope, usage scenarios, and UX goals were defined upfront.

The overall design, state flow, and interaction patterns
were intentionally designed and owned by the developer.

## Scope

This project is intentionally scoped as a v1 product.

It focuses on core creation and editing experiences,
while features such as advanced analytics and theme systems
are deliberately left out to avoid premature complexity.

## Development

- Run tests with `bun run test`. (`bun test` uses Bun's runner and won't resolve `@/` path aliases.)

## Closing

This project represents my approach to frontend development:
starting from a personal motivation,
making deliberate UX decisions,
and carrying a product through to a complete, usable state.
