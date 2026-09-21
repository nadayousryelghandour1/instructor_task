import { useState } from "react";

export function useFormFields(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const bind = (field, hint) => ({
    value: values[field],
    error: Boolean(errors[field]),
    helperText: errors[field] || hint,
    onChange: (event) => {
      const value = event.target.value;
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) => (current[field] ? { ...current, [field]: "" } : current));
    },
  });

  return { values, setValues, errors, setErrors, bind };
}
