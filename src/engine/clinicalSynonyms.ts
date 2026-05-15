// ============================================================
// CLINICAL SYNONYMS & STEMMING WHITELIST
// ============================================================

/**
 * Whitelist de Stemming Clínico.
 * Un mapeo estricto y seguro de variaciones de género y número a su raíz canónica.
 * Solo se deben incluir variantes que sean semánticamente idénticas en contexto clínico.
 */
export const STEM_WHITELIST: Record<string, string> = Object.assign(Object.create(null), {
  // Género y Número
  'fumadora': 'fumador',
  'fumadores': 'fumador',
  'fumadoras': 'fumador',
  'diabetico': 'diabetes',
  'diabetica': 'diabetes',
  'diabeticos': 'diabetes',
  'diabeticas': 'diabetes',
  'pacientes': 'paciente',
  'hipertenso': 'hipertension',
  'hipertensa': 'hipertension',
  'hipertensos': 'hipertension',
  'hipertensas': 'hipertension',
  'asmatica': 'asma',
  'asmatico': 'asma',
  'asmaticos': 'asma',
  'asmaticas': 'asma',
  'isquemico': 'isquemia',
  'isquemica': 'isquemia',
  // Plurales comunes
  'infartos': 'infarto',
  'tumores': 'tumor',
  'neoplasias': 'neoplasia',
  'infecciones': 'infeccion',
  'crisis': 'crisis', // invariante
  'fracturas': 'fractura',
  'lesiones': 'lesion'
});

/**
 * Diccionario Canónico de Sinónimos Clínicos.
 * Mapea un token canónico a todas sus variantes coloquiales, siglas y abreviaturas.
 */
export const CLINICAL_SYNONYMS: Record<string, string[]> = Object.assign(Object.create(null), {
  'hta': ['hipertension', 'hipertension arterial', 'presion alta', 'tension alta', 'pa alta'],
  'dm': ['dm2', 'dm1', 'diabetes', 'diabetes mellitus', 'dbt'],
  'ic': ['icc', 'insuficiencia cardiaca', 'fallo cardiaco', 'insuf cardiaca', 'insuficiencia cardiaca congestiva'],
  'epoc': ['enfermedad pulmonar obstructiva cronica', 'bronquitis cronica', 'enfisema'],
  'asma': ['broncoespasmo', 'crisis asmatica', 'reagudizacion asma'],
  'ira': ['insuficiencia renal aguda', 'fallo renal agudo', 'fracaso renal', 'aki'],
  'irc': ['insuficiencia renal cronica', 'enfermedad renal cronica', 'erc', 'ckd'],
  'iam': ['infarto', 'infarto agudo miocardio', 'infarto de miocardio', 'scacest', 'scasest', 'sindrome coronario'],
  'angor': ['angina', 'angina de pecho', 'dolor toracico isquemico'],
  'ictus': ['avc', 'ait', 'accidente cerebrovascular', 'accidente isquemico transitorio', 'ataque cerebral', 'stroke'],
  'epilepsia': ['crisis epileptica', 'convulsiones', 'crisis comicial', 'comicio'],
  'neoplasia': ['tumor', 'cancer', 'ca', 'carcinoma', 'adenocarcinoma', 'metastasis'],
  'sepsis': ['septicemia', 'bacteriemia', 'shock septico', 'sindrome septico'],
  'neumonia': ['pac', 'neumonia adquirida comunidad', 'bronconeumonia'],
  'itu': ['uti', 'infeccion urinaria', 'infeccion tracto urinario', 'cistitis', 'pielonefritis'],
  'tep': ['tromboembolismo pulmonar', 'embolia pulmonar', 'pe'],
  'tvp': ['trombosis venosa profunda', 'dvt', 'trombosis'],
  'anemia': ['hemoglobina baja', 'hb baja', 'hgb baja', 'ferropenia'],
  'apendicitis': ['apendicectomia', 'apendice'],
  'colecistitis': ['colecistectomia', 'colelitiasis', 'calculo biliar', 'vesicula'],
  'depresion': ['sindrome depresivo', 'episodio depresivo mayor', 'tdm', 'trastorno depresivo'],
  'ansiedad': ['trastorno ansiedad', 'crisis ansiedad', 'crisis panico', 'trastorno panico'],
  'covid': ['covid19', 'covid-19', 'sars-cov-2', 'coronavirus']
});
