import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { text, schema } = await req.json();
    console.log('Received schema:', JSON.stringify(schema, null, 2));

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    if (!schema || (!schema.root && !schema.items)) {
      return NextResponse.json(
        { error: 'No schema provided' },
        { status: 400 }
      );
    }

    // Create schema from user-provided fields only
    const itemSchema: Record<string, z.ZodTypeAny> = {};
    const rootSchema: Record<string, z.ZodTypeAny> = {};

    // Add root fields from schema
    if (schema.root) {
      Object.entries(schema.root).forEach(([key, value]) => {
        rootSchema[key] = z.string().describe(value.description);
      });
    }

    // Add item fields from schema
    if (schema.items) {
      Object.entries(schema.items).forEach(([key, value]) => {
        itemSchema[key] = z.string().describe(value.description);
      });
    }

    // Create final schemas
    const finalItemSchema = z.object(itemSchema);
    const finalExtractionSchema = z.object({
      ...rootSchema,
      items: z.array(finalItemSchema).describe("list of items")
    });

    console.log('Final schema shape:', {
      rootFields: Object.keys(rootSchema),
      itemFields: Object.keys(itemSchema),
    });

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: `You are an expert at extracting structured data from invoices and bank statements. Extract all available information following the provided schema exactly.

Schema fields to extract:
Root fields: ${Object.keys(rootSchema).join(', ')}
Item fields: ${Object.keys(itemSchema).join(', ')}

Important: Only extract the fields specified above. Do not add any additional fields.`
        },
        {
          role: "user",
          content: text
        },
      ],
      response_format: zodResponseFormat(finalExtractionSchema, "invoice_extraction"),
    });

    console.log('OpenAI response received:', completion.choices[0].message);

    const extractedData = completion.choices[0].message.parsed;
    return NextResponse.json(extractedData);
  } catch (error) {
    console.error('Error processing with OpenAI:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error processing text with OpenAI' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
