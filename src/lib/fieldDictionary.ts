export type FieldCategory = 
  | 'Demografía' 
  | 'Antecedentes' 
  | 'Anamnesis y Exploración' 
  | 'Diagnóstico y Tratamiento' 
  | 'Resultados' 
  | 'Hospitalización' 
  | 'OTROS';

const categoryKeywords: Record<FieldCategory, string[]> = {
  'Demografía': [
    'n.h.c', 'cipa', 'fecha de nacimiento', 'nacimiento', 'edad', 'sexo', 'ciudad', 'código postal', 'postal', 'demog', 'domicilio', 'estado civil', 'nombre', 'paciente'
  ],
  'Antecedentes': [
    'antecedente', 'alergia', 'habito', 'hábito', 'familiar', 'personal', 'quirurgico', 'quirúrgico', 'vacuna'
  ],
  'Anamnesis y Exploración': [
    'anamnesis', 'exploracion', 'exploración', 'motivo', 'enfermedad actual', 'enfermedad', 'sintoma', 'síntoma', 'talla', 'peso', 'ta', 'fc', 'temperatura', 'constante', 'imc', 'perímetro', 'edemas', 'anam', 'anamn', 'expl'
  ],
  'Diagnóstico y Tratamiento': [
    'diagnostico', 'diagnóstico', 'tratamiento', 'medicacion', 'medicación', 'prescripcion', 'prescripción', 'plan', 'proceso', 'receta', 'recomendación', 'juicio', 'diagn', 'diag'
  ],
  'Resultados': [
    'analitica', 'analítica', 'laboratorio', 'prueba', 'imagen', 'rx', 'tac', 'rmn', 'ecografia', 'ecografía', 'biopsia', 'cultivo', 'resultado'
  ],
  'Hospitalización': [
    'ingreso', 'alta', 'traslado', 'unm', 'uci', 'urgencia', 'servicio'
  ],
  'OTROS': []
};

export function classifyField(fieldName: string): FieldCategory {
  const lowerName = fieldName.toLowerCase();
  
  // Detección por palabras clave
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (category === 'OTROS') continue;
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        return category as FieldCategory;
      }
    }
  }
  
  return 'OTROS';
}
