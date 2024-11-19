"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useSchema } from "@/context/schema-context";

interface DataTableProps {
  data: Record<string, any> | null;
  isLoading?: boolean;
}

export function DataTable({ data, isLoading }: DataTableProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { state } = useSchema();

  const convertSchema = (schema: any[]) => {
    const result: { root: Record<string, any>; items?: Record<string, any> } = {
      root: {}
    };

    schema.forEach(field => {
      if (field.type === 'field') {
        result.root[field.name] = {
          type: 'string',
          description: field.description
        };
      } else if (field.type === 'group' && field.name === 'items' && field.fields) {
        result.items = {};
        field.fields.forEach(itemField => {
          result.items![itemField.name] = {
            type: 'string',
            description: itemField.description
          };
        });
      }
    });

    return result;
  };

  const handleDownload = async () => {
    if (!data || isDownloading) return;

    setIsDownloading(true);
    try {
      const convertedSchema = convertSchema(state.schema);
      console.log('Downloading with schema:', convertedSchema);
      console.log('Downloading with data:', data);

      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [data],
          schema: convertedSchema,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate Excel file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extracted_data.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Excel file downloaded successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download Excel file.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Processing data...</span>
        </div>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  // Get fields from the schema
  const rootFields = state.schema
    .filter(field => field.type === 'field')
    .map(field => field.name);

  const itemFields = state.schema
    .find(field => field.type === 'group' && field.name === 'items')
    ?.fields?.map(field => field.name) || [];

  // Create rows for the table
  const items = Array.isArray(data.items) ? data.items : [];
  const rows = items.length > 0 ? items.map(item => ({
    ...Object.fromEntries(rootFields.map(field => [field, data[field] || ''])),
    ...Object.fromEntries(itemFields.map(field => [field, item[field] || '']))
  })) : [{
    ...Object.fromEntries(rootFields.map(field => [field, data[field] || ''])),
    ...Object.fromEntries(itemFields.map(field => [field, '']))
  }];

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Extracted Data</h3>
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          size="sm"
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download Excel
            </>
          )}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {rootFields.map((field) => (
                <TableHead key={field} className="font-medium">
                  {field}
                </TableHead>
              ))}
              {itemFields.map((field) => (
                <TableHead key={field} className="font-medium">
                  {field}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                {rootFields.map((field) => (
                  <TableCell key={field}>{row[field]}</TableCell>
                ))}
                {itemFields.map((field) => (
                  <TableCell key={field}>{row[field]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
