export type SchemaFieldType = 'field' | 'group';

export interface SchemaField {
  id: string;
  name: string;
  type: SchemaFieldType;
  description: string;
  fields?: SchemaField[];
}

export interface ProcessedData {
  [key: string]: any;
}

export interface ExtractedData {
  text: string;
  fileName: string;
}

export interface SchemaState {
  schema: SchemaField[];
  extractedData: ExtractedData | null;
  processedData: ProcessedData | null;
  isProcessing: boolean;
  error: string | null;
}

export type SchemaAction =
  | { type: 'SET_SCHEMA'; payload: SchemaField[] }
  | { type: 'SET_EXTRACTED_DATA'; payload: ExtractedData }
  | { type: 'SET_PROCESSED_DATA'; payload: ProcessedData }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_FIELD'; payload: { parentId?: string; field: SchemaField } }
  | { type: 'UPDATE_FIELD'; payload: { id: string; field: SchemaField } }
  | { type: 'DELETE_FIELD'; payload: string };
