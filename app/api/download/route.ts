import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(req: NextRequest) {
  try {
    const { data, schema } = await req.json();
    console.log('Received data:', JSON.stringify(data, null, 2));
    console.log('Received schema:', JSON.stringify(schema, null, 2));
    
    if (!schema || (!schema.root && !schema.items)) {
      return NextResponse.json(
        { error: 'No schema provided' },
        { status: 400 }
      );
    }

    // Get the fields from schema
    const rootFields = schema.root ? Object.keys(schema.root) : [];
    const itemFields = schema.items ? Object.keys(schema.items) : [];

    console.log('Fields to extract:', { rootFields, itemFields });

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Process each document
    data.forEach((doc: any, index: number) => {
      // Ensure doc.items exists and is an array
      const items = Array.isArray(doc.items) ? doc.items : [];
      console.log(`Processing document ${index + 1}, items:`, items.length);

      // Create rows for the worksheet
      const rows = items.length > 0 ? items.map((item: any) => {
        const row: Record<string, any> = {};
        
        // Add root fields
        rootFields.forEach(field => {
          row[field] = doc[field] || '';
        });
        
        // Add item fields
        itemFields.forEach(field => {
          row[field] = item[field] || '';
        });
        
        return row;
      }) : [{
        // If no items, create a single row with just root fields
        ...rootFields.reduce((acc, field) => ({
          ...acc,
          [field]: doc[field] || ''
        }), {}),
        ...itemFields.reduce((acc, field) => ({
          ...acc,
          [field]: ''
        }), {})
      }];

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(rows, {
        header: [...rootFields, ...itemFields]
      });

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, `Document ${index + 1}`);
    });

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Return the Excel file
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="extracted_data.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error generating Excel file:', error);
    return NextResponse.json(
      { error: 'Failed to generate Excel file' },
      { status: 500 }
    );
  }
}
