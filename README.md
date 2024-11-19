# PDF to Excel Converter

A modern web application that extracts data from PDF files and converts it into structured Excel spreadsheets using AI-powered text extraction and processing.

## Features

- PDF File Upload: Drag and drop or click to upload PDF files
- AI-Powered Extraction: Uses LlamaParse for accurate text extraction
- Dynamic Schema: Configurable data extraction schema for different document types
- Interactive Table View: Real-time preview of extracted data
- Excel Export: Download extracted data as formatted Excel files
- Field Targeting: Extract specific fields based on custom schema
- Batch Processing: Process multiple documents with the same schema

## Tech Stack

### Frontend
- Next.js 13+ (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui Components
- Lucide Icons

### Backend
- Next.js API Routes
- OpenAI GPT-4
- LlamaParse PDF Reader
- XLSX (Excel generation)
- Zod (Schema validation)


## Prerequisites

Before running the application, make sure you have:

1. Node.js 18 or higher installed
2. pnpm package manager installed
3. OpenAI API key
4. LlamaParse API key

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key
LLAMAPARSE_API_KEY=your_llamaparse_api_key
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pdf2excel
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Upload PDF**: Click the upload area or drag and drop a PDF file
2. **Configure Schema**: Define the fields you want to extract
3. **Preview Data**: View extracted data in the interactive table
4. **Download Excel**: Click the download button to get the Excel file

## Schema Configuration

The application supports two types of fields:

1. **Simple Fields**: Single value fields
```typescript
{
  type: 'field',
  name: 'invoiceNumber',
  description: 'Invoice number from the document'
}
```

2. **Group Fields**: Fields containing multiple related values
```typescript
{
  type: 'group',
  name: 'address',
  fields: {
    street: { description: 'Street address' },
    city: { description: 'City name' },
    zip: { description: 'ZIP code' }
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
