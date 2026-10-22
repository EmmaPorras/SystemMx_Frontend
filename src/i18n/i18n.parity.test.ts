import { describe, it, expect } from "vitest";
import es from "./locales/es.json";
import en from "./locales/en.json";
import pt from "./locales/pt.json";

function getLeafKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  let keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys = keys.concat(getLeafKeys(value as Record<string, unknown>, fullPath));
    } else {
      keys.push(fullPath);
    }
  }
  return keys.sort();
}

function findEmptyValues(obj: Record<string, unknown>, prefix = ""): string[] {
  let emptyKeys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      emptyKeys = emptyKeys.concat(findEmptyValues(value as Record<string, unknown>, fullPath));
    } else if (typeof value === "string" && value.trim() === "") {
      emptyKeys.push(fullPath);
    }
  }
  return emptyKeys;
}

describe("i18n key parity and structure tests", () => {
  it("should have identical key sets across es, en, and pt", () => {
    const esKeys = getLeafKeys(es);
    const enKeys = getLeafKeys(en);
    const ptKeys = getLeafKeys(pt);

    const missingInEn = esKeys.filter((k) => !enKeys.includes(k));
    const extraInEn = enKeys.filter((k) => !esKeys.includes(k));

    const missingInPt = esKeys.filter((k) => !ptKeys.includes(k));
    const extraInPt = ptKeys.filter((k) => !esKeys.includes(k));

    expect(missingInEn, `Keys present in es but missing in en: ${missingInEn.join(", ")}`).toEqual([]);
    expect(extraInEn, `Keys present in en but missing in es: ${extraInEn.join(", ")}`).toEqual([]);
    expect(missingInPt, `Keys present in es but missing in pt: ${missingInPt.join(", ")}`).toEqual([]);
    expect(extraInPt, `Keys present in pt but missing in es: ${extraInPt.join(", ")}`).toEqual([]);
  });

  it("should not have any empty strings in translation values", () => {
    const esEmpty = findEmptyValues(es);
    const enEmpty = findEmptyValues(en);
    const ptEmpty = findEmptyValues(pt);

    expect(esEmpty, `Empty values found in es: ${esEmpty.join(", ")}`).toEqual([]);
    expect(enEmpty, `Empty values found in en: ${enEmpty.join(", ")}`).toEqual([]);
    expect(ptEmpty, `Empty values found in pt: ${ptEmpty.join(", ")}`).toEqual([]);
  });
});
