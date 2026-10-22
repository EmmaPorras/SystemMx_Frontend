import React from "react";
(globalThis as unknown as { React: typeof React }).React = React;
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "../i18n";

afterEach(() => {
  cleanup();
});
