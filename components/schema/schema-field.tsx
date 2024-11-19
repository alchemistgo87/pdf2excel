import { useState } from 'react';
import { ChevronDown, ChevronRight, Minus, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SchemaField } from '@/types/schema';
import { useSchema } from '@/context/schema-context';

interface SchemaFieldProps {
  field: SchemaField;
  level?: number;
}

export function SchemaFieldComponent({ field, level = 0 }: SchemaFieldProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { dispatch } = useSchema();

  const handleUpdate = (updates: Partial<SchemaField>) => {
    dispatch({
      type: 'UPDATE_FIELD',
      payload: { id: field.id, field: { ...field, ...updates } },
    });
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_FIELD', payload: field.id });
  };

  const handleAddSubfield = () => {
    const newField: SchemaField = {
      id: `${field.id}.${(field.fields?.length || 0) + 1}`,
      name: '',
      type: 'field',
      description: '',
    };
    dispatch({
      type: 'ADD_FIELD',
      payload: { parentId: field.id, field: newField },
    });
  };

  return (
    <Card className="p-2 sm:p-4">
      <div className="space-y-2 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-4">
          {field.type === 'group' && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-0.5 sm:p-1 hover:bg-secondary rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </button>
          )}
          <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-4">
            <Input
              placeholder="Field name"
              value={field.name}
              onChange={(e) => handleUpdate({ name: e.target.value })}
              className="h-8 sm:h-10 text-xs sm:text-sm"
            />
            <Input
              placeholder="Description"
              value={field.description}
              onChange={(e) => handleUpdate({ description: e.target.value })}
              className="h-8 sm:h-10 text-xs sm:text-sm"
            />
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 sm:h-8 sm:w-8"
                onClick={handleDelete}
              >
                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              {field.type === 'group' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 sm:h-8 sm:w-8"
                  onClick={handleAddSubfield}
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {field.type === 'group' && isExpanded && field.fields && (
          <div className="pl-4 sm:pl-8 space-y-2">
            {field.fields.map((subField) => (
              <SchemaFieldComponent
                key={subField.id}
                field={subField}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
