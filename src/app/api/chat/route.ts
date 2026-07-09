import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/products";

// Build a compact product catalog string for the LLM system prompt
const buildProductCatalog = () => {
  return products
    .filter((p) => p.isActive !== false)
    .map((p) => {
      return [
        `Product: ${p.name}`,
        `  Slug: ${p.slug}`,
        `  Category: ${p.category}`,
        `  Price: ₹${p.sellingPrice} (MRP ₹${p.mrp})`,
        `  Weight: ${p.weight}`,
        `  Description: ${p.shortDescription}`,
        `  Key Ingredients: ${p.ingredients}`,
        `  Best for: ${p.usageSuggestions.slice(0, 3).join("; ")}`,
        `  Benefits: ${p.benefits.slice(0, 3).join("; ")}`,
        p.badge ? `  Badge: ${p.badge}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
};

const SYSTEM_PROMPT = `You are "Vraja", a warm and knowledgeable spice assistant for Vrajaspice — a premium Indian spice brand specialising in No Onion No Garlic (NONG) masala blends crafted for satvik, Jain, ISKCON, and Vaishnav cooking.

Your role:
- Help users find the RIGHT Vrajaspice product for their cooking needs
- Ask friendly follow-up questions when needed (e.g., "What are you cooking?", "Do you prefer mild or bold flavours?")
- Recommend 1-3 products maximum per response — don't overwhelm users
- Be concise, friendly, and enthusiastic about spices
- Always mention the price and a key benefit when recommending
- If users ask about non-spice topics, gently steer back to cooking and products
- Use emojis sparingly but warmly (1-2 per message max)
- When recommending a product, always format it like:
  **[Product Name]** (₹X) — [1-line reason why it suits their need]

IMPORTANT RULES:
- Only recommend products from the catalog below — never invent products
- All products are NONG (No Onion No Garlic) — this is a key selling point
- If someone asks for something outside the catalog (e.g., a spice you don't carry), be honest and suggest the closest match
- Keep responses under 150 words unless the user asks for details

VRAJASPICE PRODUCT CATALOG:
${buildProductCatalog()}

Start by warmly greeting the user and asking what they're cooking today.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          max_tokens: 400,
          temperature: 0.7,
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", errorText);
      return NextResponse.json(
        { error: "AI service unavailable. Please try again." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "Sorry, I couldn't understand that. Could you rephrase?";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
