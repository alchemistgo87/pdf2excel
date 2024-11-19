"use client";

import { useState } from "react";
import { FileUpload } from "@/components/file-upload";
import { SchemaDefinition } from "@/components/schema-definition";
import { DataTable } from "@/components/data-table";
import { SchemaProvider } from "@/context/schema-context";

export default function Home() {
  const [extractedText, setExtractedText] = useState<string>();
  const [processedData, setProcessedData] = useState<Record<string, any>>();
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <SchemaProvider>
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">PDF to Excel Converter</h1>
            <p className="text-lg text-gray-600 mx-auto">
              Convert your PDF invoices to Excel format easily. Upload your PDF, customize the extraction schema,
              and download your structured Excel file.
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Upload PDF</h2>
              <p className="text-gray-600 text-sm mb-4">Select or drag and drop your PDF invoice file here.</p>
              <FileUpload onExtract={setExtractedText} />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Define Extraction Schema</h2>
              <p className="text-gray-600 text-sm mb-4">Customize how your data should be extracted and organized in the Excel file.</p>
              <SchemaDefinition
                extractedText={extractedText}
                onProcessStart={() => {
                  setIsProcessing(true);
                  setProcessedData(undefined);
                }}
                onProcessEnd={(data) => {
                  setProcessedData(data);
                  setIsProcessing(false);
                }}
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">3. View Extracted Data</h2>
              <p className="text-gray-600 text-sm mb-4">Review the extracted data and download it as an Excel file.</p>
              {(processedData || isProcessing) && (
                <DataTable 
                  data={processedData}
                  isLoading={isProcessing}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </SchemaProvider>
  );
}
