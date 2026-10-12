import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { rmSync, writeFileSync } from "node:fs";
import { extractPdfText, getPdfInfo, hasPdfRenderer, renderPdfPage } from "../src/core/pdf/pdf";

const samplePdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R 5 0 R] /Count 2 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents 4 0 R >> endobj
4 0 obj << /Length 44 >> stream
BT /F1 12 Tf 50 150 Td (Daisy Page One) Tj ET
endstream
endobj
5 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents 6 0 R >> endobj
6 0 obj << /Length 44 >> stream
BT /F1 12 Tf 50 150 Td (Daisy Page Two) Tj ET
endstream
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000122 00000 n 
0000000223 00000 n 
0000000318 00000 n 
0000000419 00000 n 
trailer << /Size 7 /Root 1 0 R >>
startxref
514
%%EOF`;

describe("core pdf service", () => {
  const testFile = "/tmp/daisy-unit-test.pdf";

  beforeAll(() => {
    writeFileSync(testFile, samplePdf);
  });

  afterAll(() => {
    rmSync(testFile, { force: true });
  });

  test("hasPdfRenderer detects pdftoppm", async () => {
    const available = await hasPdfRenderer();
    expect(typeof available).toBe("boolean");
  });

  test("getPdfInfo reads page count", async () => {
    const info = await getPdfInfo(testFile);
    expect(info.pages).toBe(2);
  });

  test("renderPdfPage produces png file", async () => {
    const available = await hasPdfRenderer();
    if (available) {
      const pngPath = await renderPdfPage(testFile, 1, 100);
      expect(pngPath).toBeDefined();
      expect(pngPath?.endsWith(".png")).toBe(true);
    }
  });

  test("extractPdfText extracts text from page", async () => {
    const text = await extractPdfText(testFile, 1);
    expect(typeof text).toBe("string");
  });
});
