import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  canDownloadTrialPdf,
  consumeTrialPdfOrExplain,
  TRIAL_PDF_MAX,
  trialPdfLimitMessage,
} from "./trialPdfLimit.js";

describe("trialPdfLimit", () => {
  beforeEach(() => {
    const store = new Map();
    globalThis.localStorage = {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => { store.set(k, String(v)); },
      removeItem: (k) => { store.delete(k); },
    };
  });

  it("solo permite 1 PDF en trial", () => {
    assert.equal(TRIAL_PDF_MAX, 1);
    assert.equal(canDownloadTrialPdf("u1"), true);
    const first = consumeTrialPdfOrExplain("u1");
    assert.equal(first.ok, true);
    assert.equal(canDownloadTrialPdf("u1"), false);
    const second = consumeTrialPdfOrExplain("u1");
    assert.equal(second.ok, false);
    assert.equal(second.message, trialPdfLimitMessage());
  });
});
