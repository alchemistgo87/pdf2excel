import { NextRequest, NextResponse } from 'next/server';
import { LlamaParseReader } from "llamaindex";
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Create a temporary file path
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = join(tmpdir(), `upload-${Date.now()}.pdf`);
    
    // Write the uploaded file to temp directory
    await writeFile(tempPath, buffer);

    // Initialize LlamaParse reader
    const reader = new LlamaParseReader({ resultType: "markdown" });
    
    // Extract text from PDF
    const documents = await reader.loadData(tempPath);
    
    // Ensure we get the full text from all documents
    const fullText = documents.map(doc => doc.text).join('\n\n');
    
    // Clean up the temporary file
    await writeFile(tempPath, '');

    return NextResponse.json({ text: fullText });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: 'Error processing PDF file' },
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
