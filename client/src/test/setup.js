// Vitest setup shared by all client tests. Registers jest-dom matchers (e.g.
// toBeInTheDocument, toHaveFocus) and unmounts React trees after each test so
// the jsdom document stays clean between cases.
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
