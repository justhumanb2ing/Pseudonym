import "@testing-library/jest-dom/vitest";
import type { ReactNode } from "react";
import { TextEncoder, TextDecoder } from "node:util";
import { vi } from "vitest";

const renderChildren = ({ children }: { children?: ReactNode }) =>
  children ?? null;

vi.mock("@clerk/react-router", () => ({
  AuthenticateWithRedirectCallback: () => null,
  ClerkProvider: renderChildren,
  SignInButton: renderChildren,
  SignOutButton: renderChildren,
  SignedIn: renderChildren,
  SignedOut: () => null,
  useClerk: () => ({ signOut: vi.fn() }),
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      firstName: "Test",
      lastName: "User",
      imageUrl: "",
      username: "test",
      primaryEmailAddress: { emailAddress: "test@example.com" },
    },
  }),
}));

// Polyfill TextEncoder/TextDecoder for jsdom
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder as typeof global.TextDecoder;
}

if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}
