import { v } from "convex/values";
import { action } from "./_generated/server";

// Helper function to convert ArrayBuffer to Base64
function toBase64(arrayBuffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(arrayBuffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const analyzeBill = action({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Google API Key is not set in Convex environment variables.",
      );
    }

    // 1. Get the file URL from Convex Storage
    const imageUrl = await ctx.storage.getUrl(args.storageId);
    if (!imageUrl) {
      throw new Error("File not found in storage");
    }

    // 2. Fetch the file data
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const mimeType = blob.type || "image/jpeg";

    // 3. Define the REST API endpoint and model
    const model = "models/gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`;

    // 4. Craft the prompt and request body
    const prompt = `
      Analiza esta factura de energía y extrae los siguientes datos en un formato JSON puro:
      {
        "monthlyConsumptionKwh": número (consumo mensual en kWh),
        "energyRate": número (valor por kWh),
        "totalAmount": número (valor total a pagar),
        "currency": string (ej. "COP", "USD"),
        "billingPeriod": string (ej. "Enero 2024"),
        "provider": string (nombre de la empresa de energía)
      }
      Si un dato no es visible, usa null. Responde ÚNICAMENTE con el objeto JSON.
    `;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: toBase64(arrayBuffer),
              },
            },
          ],
        },
      ],
    };

    // 5. Make a direct fetch call to the REST API
    const apiResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      throw new Error(
        `Google AI API Error: ${apiResponse.status} ${apiResponse.statusText} - ${errorBody}`,
      );
    }

    const result = await apiResponse.json();
    const text = result.candidates[0].content.parts[0].text;

    // 6. Parse and return
    try {
      const jsonString = text.match(/\{[\s\S]*\}/)?.[0] || text;
      const data = JSON.parse(jsonString);
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error parsing AI response:", text);
      return {
        success: false,
        error: "No se pudo procesar el formato de la factura",
        rawResponse: text,
      };
    }
  },
});
