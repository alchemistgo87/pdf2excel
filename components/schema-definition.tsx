"use client";

import { Plus, Loader2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { SchemaFieldComponent } from '@/components/schema/schema-field';
import { useSchema } from '@/context/schema-context';
import { SchemaField } from '@/types/schema';

interface SchemaDefinitionProps {
  extractedText?: string;
  onProcessStart: () => void;
  onProcessEnd: (data: Record<string, any>) => void;
}

export function SchemaDefinition({
  extractedText,
  onProcessStart,
  onProcessEnd,
}: SchemaDefinitionProps) {
  const { state, dispatch } = useSchema();

  const handleAddField = (type: 'field' | 'group') => {
    const newField: SchemaField = {
      id: `${state.schema.length + 1}`,
      name: '',
      type,
      description: '',
      fields: type === 'group' ? [] : undefined,
    };
    dispatch({ type: 'ADD_FIELD', payload: { field: newField } });
  };

  const convertSchema = (schema: SchemaField[]) => {
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

  const handleProcess = async () => {
    if (!extractedText) {
      toast({
        variant: "destructive",
        title: "Missing PDF",
        description: "Please upload and extract text from a PDF first.",
      });
      return;
    }

    if (state.schema.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Schema",
        description: "Please define at least one field in the schema.",
      });
      return;
    }

    try {
      onProcessStart();
      const convertedSchema = convertSchema(state.schema);
      console.log('Converted schema:', convertedSchema);
      
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: extractedText,
          schema: convertedSchema,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process data');
      }

      const data = await response.json();
      onProcessEnd(data);
      toast({
        title: "Success",
        description: "Data processed successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process data. Please try again.",
      });
      onProcessEnd({});
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-lg font-semibold">Schema Definition</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={() => handleAddField('field')} 
            size="sm"
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
          <Button 
            onClick={() => handleAddField('group')} 
            size="sm"
            variant="default"
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Group
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {state.schema.map((field) => (
          <SchemaFieldComponent key={field.id} field={field} />
        ))}
      </div>

      {extractedText && (
        <div className="flex justify-end mt-4">
          <Button
            onClick={handleProcess}
            disabled={state.isProcessing}
            className="w-full sm:w-auto"
          >
            {state.isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Process with Schema
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
