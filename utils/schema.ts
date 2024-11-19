import { SchemaField } from '@/types/schema';

export interface ApiSchema {
  root: Record<string, { type: string; description: string }>;
  items: Record<string, { type: string; description: string }>;
}

export const defaultSchema: SchemaField[] = [
  {
    id: "1",
    name: "company",
    type: "field",
    description: "name of company"
  },
  {
    id: "2",
    name: "address",
    type: "field",
    description: "address of company"
  },
  {
    id: "3",
    name: "total_sum",
    type: "field",
    description: "total amount we purchased"
  },
  {
    id: "4",
    name: "items",
    type: "group",
    description: "list of items purchased",
    fields: [
      {
        id: "4.1",
        name: "item",
        type: "field",
        description: "name of item"
      },
      {
        id: "4.2",
        name: "unit_price",
        type: "field",
        description: "unit price of item"
      },
      {
        id: "4.3",
        name: "quantity",
        type: "field",
        description: "quantity we purchased"
      },
      {
        id: "4.4",
        name: "sum",
        type: "field",
        description: "total amount we purchased"
      }
    ]
  }
];

// Convert API schema format to component schema format
export const apiToComponentSchema = (apiSchema: ApiSchema | null): SchemaField[] => {
  if (!apiSchema) return defaultSchema;

  const schema: SchemaField[] = [];
  let id = 1;

  // Add root fields
  Object.entries(apiSchema.root).forEach(([name, field]) => {
    if (name !== 'items') {
      schema.push({
        id: String(id++),
        name,
        type: 'field',
        description: field.description
      });
    }
  });

  // Add items group with its fields
  const itemsFields = Object.entries(apiSchema.items).map(([name, field]) => ({
    id: `${id}.${schema.length + 1}`,
    name,
    type: 'field' as const,
    description: field.description
  }));

  if (itemsFields.length > 0) {
    schema.push({
      id: String(id++),
      name: 'items',
      type: 'group',
      description: 'list of items purchased',
      fields: itemsFields
    });
  }

  return schema;
};

// Convert component schema format to API schema format
export const componentToApiSchema = (schema: SchemaField[]): ApiSchema => {
  const apiSchema: ApiSchema = {
    root: {},
    items: {}
  };

  schema.forEach(field => {
    if (field.name === 'items' && field.fields) {
      field.fields.forEach(itemField => {
        apiSchema.items[itemField.name] = {
          type: 'string',
          description: itemField.description
        };
      });
    } else {
      apiSchema.root[field.name] = {
        type: 'string',
        description: field.description
      };
    }
  });

  return apiSchema;
};
