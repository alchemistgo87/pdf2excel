import { createContext, useContext, useReducer, ReactNode } from 'react';
import { SchemaState, SchemaAction, SchemaField } from '@/types/schema';
import { defaultSchema } from '@/utils/schema';

const initialState: SchemaState = {
  schema: defaultSchema,
  extractedData: null,
  processedData: null,
  isProcessing: false,
  error: null,
};

function schemaReducer(state: SchemaState, action: SchemaAction): SchemaState {
  switch (action.type) {
    case 'SET_SCHEMA':
      return { ...state, schema: action.payload };
    case 'SET_EXTRACTED_DATA':
      return { ...state, extractedData: action.payload, error: null };
    case 'SET_PROCESSED_DATA':
      return { ...state, processedData: action.payload, isProcessing: false, error: null };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isProcessing: false };
    case 'ADD_FIELD': {
      const { parentId, field } = action.payload;
      if (!parentId) {
        return { ...state, schema: [...state.schema, field] };
      }
      const updateFields = (fields: SchemaField[]): SchemaField[] => {
        return fields.map((f) => {
          if (f.id === parentId) {
            return { ...f, fields: [...(f.fields || []), field] };
          }
          if (f.fields) {
            return { ...f, fields: updateFields(f.fields) };
          }
          return f;
        });
      };
      return { ...state, schema: updateFields(state.schema) };
    }
    case 'UPDATE_FIELD': {
      const { id, field } = action.payload;
      const updateFields = (fields: SchemaField[]): SchemaField[] => {
        return fields.map((f) => {
          if (f.id === id) {
            return field;
          }
          if (f.fields) {
            return { ...f, fields: updateFields(f.fields) };
          }
          return f;
        });
      };
      return { ...state, schema: updateFields(state.schema) };
    }
    case 'DELETE_FIELD': {
      const deleteFromFields = (fields: SchemaField[]): SchemaField[] => {
        return fields.filter((f) => {
          if (f.id === action.payload) return false;
          if (f.fields) {
            f.fields = deleteFromFields(f.fields);
          }
          return true;
        });
      };
      return { ...state, schema: deleteFromFields(state.schema) };
    }
    default:
      return state;
  }
}

const SchemaContext = createContext<{
  state: SchemaState;
  dispatch: React.Dispatch<SchemaAction>;
} | null>(null);

export function SchemaProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(schemaReducer, initialState);

  return (
    <SchemaContext.Provider value={{ state, dispatch }}>
      {children}
    </SchemaContext.Provider>
  );
}

export function useSchema() {
  const context = useContext(SchemaContext);
  if (!context) {
    throw new Error('useSchema must be used within a SchemaProvider');
  }
  return context;
}
