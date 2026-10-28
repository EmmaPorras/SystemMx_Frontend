import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PasswordStrengthIndicator, { calculatePasswordStrength } from "./PasswordStrengthIndicator";

describe("PasswordStrengthIndicator (Fase 3 - Seguridad de Contraseñas)", () => {
  it("calcula score bajo para contraseñas menores a 15 caracteres", () => {
    const res = calculatePasswordStrength("Clave14chars!!");
    expect(res.score).toBe(1);
    expect(res.feedbackKey).toBe("auth.strengthTooShort");
  });

  it("calcula score adecuado para contraseñas de 15 caracteres válidas", () => {
    const res = calculatePasswordStrength("MiClaveSegura15");
    expect(res.score).toBeGreaterThanOrEqual(2);
  });

  it("calcula score alto para frases largas con espacios y símbolos", () => {
    const res = calculatePasswordStrength("mi frase secreta segura con mas de 25 caracteres!!");
    expect(res.score).toBeGreaterThanOrEqual(3);
  });

  it("detecta repeticiones triviales y asigna score bajo", () => {
    const res = calculatePasswordStrength("aaaaaaaaaaaaaaaaa");
    expect(res.score).toBe(1);
    expect(res.feedbackKey).toBe("auth.strengthTrivial");
  });

  it("renderiza barra accesible con role progressbar y aria-valuenow", () => {
    render(<PasswordStrengthIndicator password="MiClaveSeguraSystemMx15!" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toBeInTheDocument();
    expect(Number(bar.getAttribute("aria-valuenow"))).toBeGreaterThan(0);
  });
});

