export type FormType =
  | "recepcion_materia_prima"
  | "control_organoleptico"
  | "control_temperatura"
  | "control_peso";

export type FormStatus = "draft" | "submitted" | "approved" | "rejected";

export type FieldType = "text" | "number" | "boolean" | "select";

export const FORM_TYPE_LABELS: Record<FormType, string> = {
  recepcion_materia_prima: "Recepción Materia Prima",
  control_organoleptico: "Control Organoléptico",
  control_temperatura: "Control de Temperatura",
  control_peso: "Control de Peso",
};

export interface FormField {
  id: number;
  field_name: string;
  field_type: FieldType;
  value: string;
  unit: string;
  ordering: number;
}

export interface QualityForm {
  id: number;
  form_type: FormType;
  status: FormStatus;
  filled_by_username: string | null;
  submitted_at: string | null;
  notes: string;
  fields: FormField[];
  created_at: string;
  updated_at: string;
}

export interface CreateFormFieldInput {
  field_name: string;
  field_type?: FieldType;
  value?: string;
  unit?: string;
  ordering?: number;
}

export interface CreateFormInput {
  form_type: FormType;
  notes?: string;
  fields?: CreateFormFieldInput[];
}
