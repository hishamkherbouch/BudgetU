import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { ok: false, error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
    }

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return NextResponse.json({ ok: false, error: "File must be a PDF" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Extract all transactions from this bank statement or credit card statement PDF.

Return ONLY a JSON array with no other text, markdown, or explanation.
Each object must have exactly these fields:
- "date": string in YYYY-MM-DD format
- "description": string (merchant or transaction name, trimmed)
- "amount": positive number (always positive regardless of debit/credit)
- "type": "expense" for purchases/debits/withdrawals, "income" for credits/deposits/payments received

Rules:
- Skip balance rows, account summary rows, totals, and opening/closing balances
- Only include real individual transactions
- If no transactions found, return an empty array: []

Example output:
[{"date":"2024-01-15","description":"STARBUCKS #1234","amount":5.75,"type":"expense"},{"date":"2024-01-20","description":"DIRECT DEPOSIT","amount":1200.00,"type":"income"}]`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64,
        },
      },
      { text: prompt },
    ]);

    const text = result.response.text().trim();

    type Transaction = { date: string; description: string; amount: number; type: string };
    let transactions: Transaction[] = [];

    try {
      const cleaned = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) throw new Error("Not an array");
      transactions = parsed;
    } catch {
      // Attempt to extract a bare JSON array from mixed text
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          transactions = JSON.parse(match[0]);
        } catch {
          return NextResponse.json(
            {
              ok: false,
              error:
                "We couldn't extract transactions from this PDF. Please try a CSV export from your bank instead.",
            },
            { status: 422 }
          );
        }
      } else {
        return NextResponse.json(
          {
            ok: false,
            error:
              "We couldn't read this PDF. Make sure it's a text-based statement (not a scanned image), or use a CSV export from your bank.",
          },
          { status: 422 }
        );
      }
    }

    return NextResponse.json({ ok: true, transactions });
  } catch (e) {
    console.error("PDF parse error:", e);
    return NextResponse.json(
      {
        ok: false,
        error:
          e instanceof Error
            ? e.message
            : "Failed to process PDF. Please try a CSV export from your bank.",
      },
      { status: 500 }
    );
  }
}
