import { beforeEach, describe, expect, it } from "vitest";

import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "./tokenStorage";

describe("tokenStorage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("guarda el access token en sessionStorage", () => {
    setAccessToken("jwt-prueba");

    expect(getAccessToken()).toBe("jwt-prueba");
  });

  it("devuelve null cuando no existe token", () => {
    expect(getAccessToken()).toBeNull();
  });

  it("elimina el access token", () => {
    setAccessToken("jwt-prueba");

    clearAccessToken();

    expect(getAccessToken()).toBeNull();
  });
});
