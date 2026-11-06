// Declarative rules -> {field:message}. Frontend validation is UX only; backend re-validates.
export const rules = {
  required: (l) => (v) => (v?.toString().trim() ? "" : `${l} is required`),
  email: (v) => (/^\S+@\S+\.\S+$/.test(v || "") ? "" : "Enter a valid email"),
};
export const validate = (schema, values) =>
  Object.fromEntries(
    Object.entries(schema)
      .map(([k, fs]) => [k, fs.map((f) => f(values[k])).find(Boolean)])
      .filter(([, m]) => m),
  );
