/**
 * Taxonomía de campos HCE con categorías jerárquicas según el metaprompt clínico V3.3.
 * Categorías en orden de visualización fijo y continuo.
 */
export type FieldCategory =
  | 'Demografía'
  | 'Alergias y Motivo'
  | 'Antecedentes'
  | 'Anamnesis y Exploración'
  | 'Exploraciones Complementarias'
  | 'Diagnóstico y Tratamiento'
  | 'Resultados y Pruebas'
  | 'Hospitalización'
  | 'OTROS';

/** Orden de renderizado fijo en la vista continua */
export const SECTION_ORDER: FieldCategory[] = [
  'Alergias y Motivo',
  'Antecedentes',
  'Anamnesis y Exploración',
  'Exploraciones Complementarias',
  'Diagnóstico y Tratamiento',
  'Resultados y Pruebas',
  'Hospitalización',
  'OTROS',
];

/** Etiquetas legibles por sección */
export const SECTION_LABELS: Record<FieldCategory, string> = {
  'Demografía':                  'Datos Demográficos',
  'Alergias y Motivo':           'Alergias · Motivo de Consulta',
  'Antecedentes':                'Antecedentes',
  'Anamnesis y Exploración':     'Anamnesis y Exploración',
  'Exploraciones Complementarias': 'Exploraciones Complementarias Solicitadas',
  'Diagnóstico y Tratamiento':   'Diagnóstico y Tratamiento',
  'Resultados y Pruebas':        'Resultados y Pruebas',
  'Hospitalización':             'Paciente Hospitalizado',
  'OTROS':                       'Otros Datos',
};

const categoryKeywords: Record<FieldCategory, string[]> = {
  'Demografía': [
    'nhc', 'cipa', 'fecha_nacimiento', 'nacimiento', 'edad', 'sexo', 'ciudad', 'postal',
    'domicilio', 'estado_civil', 'nombre', 'apellido', 'demog', 'proceso', 'cipa',
  ],
  'Alergias y Motivo': [
    'alergia', 'alerg', 'intoleranc', 'motivo_consulta', 'motivo_ingreso', 'motivo',
  ],
  'Antecedentes': [
    'antecedente', 'ant_fam', 'antfam', 'ant_med', 'antmed', 'familiar', 'personal',
    'quirurgico', 'quirúrgico', 'habito', 'hábito', 'vacuna', 'ant_', 'cesarea', 'cesárea',
    'gestaciones', 'abortos', 'ectopicos', 'paridad', 'obstetrica', 'obstétrica',
  ],
  'Anamnesis y Exploración': [
    'anamnesis', 'anam', 'enfermedad_actual', 'enfermedad', 'exploracion', 'exploración',
    'expl', 'sintoma', 'síntoma', 'talla', 'peso', 'ta', 'fc', 'temperatura', 'constante',
    'imc', 'perimetro', 'perímetro', 'edema', 'gestacion', 'gestación', 'fpp', 'fur',
    'movimientos_fetales', 'fcf', 'exploracion_general', 'auscultacion', 'auscultación',
  ],
  'Exploraciones Complementarias': [
    'complementaria', 'ecs', 'solicitud', 'solicita', 'observacion', 'observación', 'obs',
    'peticion', 'petición', 'pruebas_solicitadas', 'analitica_solicitada',
  ],
  'Diagnóstico y Tratamiento': [
    'diagnostico', 'diagnóstico', 'diag', 'juicio', 'tratamiento', 'tto', 'medicacion',
    'medicación', 'prescripcion', 'prescripción', 'plan', 'receta', 'recomendacion',
    'recomendación', 'evolucion', 'evolución', 'proxima_revision', 'revision', 'tratamiento_crónico',
  ],
  'Resultados y Pruebas': [
    'analitica', 'analítica', 'laboratorio', 'prueba', 'imagen', 'rx', 'tac', 'rmn',
    'ecografia', 'ecografía', 'biopsia', 'cultivo', 'resultado', 'anatomia', 'anatomía',
    'radiodiagnostico', 'radiodiagnóstico', 'otras_pruebas', 'cribado', 'screening',
    'rubeola', 'toxoplasmosis', 'hb', 'htc', 'glucemia', 'urocultivo', 'chagas',
  ],
  'Hospitalización': [
    'tipo_ingreso', 'ingreso', 'alta', 'traslado', 'uci', 'urgencia', 'servicio',
    'resumen_evolucion', 'juicio_clinico', 'juicio_clínico', 'juicio_diagnostico',
    'juicio_diagnóstico', 'tratamiento_recomendado', 'revisiones_posteriores', 'motivo_alta',
  ],
  'OTROS': [],
};

function classifyField(fieldName: string): FieldCategory {
  // Normalizar: quitar acentos (NFD) y caracteres no alfanuméricos para robustez clínica
  const lower = fieldName.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '_');

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (category === 'OTROS') continue;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return category as FieldCategory;
      }
    }
  }

  return 'OTROS';
}

/**
 * Clasifica un conjunto de registros en un mapa de categorías para su renderizado.
 */
export function classifyFields(registros: any[]): Record<FieldCategory, { key: string, value: string }[]> {
  const result: Record<string, { key: string, value: string }[]> = {};
  
  // Inicializar categorías
  SECTION_ORDER.forEach(cat => result[cat] = []);
  result['Demografía'] = [];

  if (!Array.isArray(registros)) return result as any;

  registros.forEach(reg => {
    if (!reg || !reg.data) return;
    Object.entries(reg.data).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      const category = classifyField(key);
      if (result[category]) {
        result[category].push({ key, value: String(value) });
      }
    });
  });

  return result as Record<FieldCategory, { key: string, value: string }[]>;
}
