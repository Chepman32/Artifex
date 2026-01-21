type FormatValues = Record<string, string | number>;

export const formatString = (template: string, values: FormatValues): string =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key];
    return value === undefined ? `{${key}}` : String(value);
  });
