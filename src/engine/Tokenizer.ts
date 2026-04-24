import { normalizeString } from '../utils/stringNormalizer';

// ============================================================
// CLINICAL SYNONYM MAPPER (V3.9.0)
// Diccionario canónico de términos clínicos: mapea siglas,
// abreviaturas y variantes coloquiales a un token SYN unificado.
//
// REGLA: El SYN_TOKEN se indexa JUNTO al término original, no
// en lugar de él, para preservar la recuperabilidad exacta.
// ============================================================
const CLINICAL_SYNONYMS: Record<string, string[]> = {
  // Hipertensión arterial
  '__syn_hta__': ['hta', 'hipertension', 'hipertenso', 'hipertensa', 'presion alta', 'tension alta', 'pa alta', 'hiper tension'],
  // Diabetes mellitus
  '__syn_dm__': ['dm', 'dm2', 'dm1', 'diabetes', 'diabetico', 'diabetica', 'diabetes mellitus', 'dbt'],
  // Insuficiencia cardíaca
  '__syn_ic__': ['ic', 'icc', 'insuficiencia cardiaca', 'fallo cardiaco', 'insuf cardiaca', 'insuficiencia cardiaca congestiva'],
  // EPOC / asma
  '__syn_epoc__': ['epoc', 'enfermedad pulmonar obstructiva cronica', 'bronquitis cronica', 'emphysema'],
  '__syn_asma__': ['asma', 'broncoespasmo', 'crisis asmatica', 'reagudizacion asma'],
  // Insuficiencia renal
  '__syn_ira__': ['ira', 'insuficiencia renal aguda', 'fallo renal agudo', 'fracaso renal', 'aki'],
  '__syn_irc__': ['irc', 'insuficiencia renal cronica', 'enfermedad renal cronica', 'erc', 'ckd'],
  // Infarto y coronarias
  '__syn_iam__': ['iam', 'infarto', 'infarto agudo miocardio', 'infarto de miocardio', 'scacest', 'scasest', 'sindrome coronario'],
  '__syn_angor__': ['angor', 'angina', 'angina de pecho', 'dolor toracico isquemico'],
  // Neurología
  '__syn_ictus__': ['ictus', 'avc', 'ait', 'accidente cerebrovascular', 'accidente isquemico transitorio', 'ataque cerebral', 'stroke'],
  '__syn_epilepsia__': ['epilepsia', 'crisis epileptica', 'convulsiones', 'crisis comicial', 'comicio'],
  // Oncología básica
  '__syn_neoplasia__': ['neoplasia', 'tumor', 'cancer', 'ca', 'carcinoma', 'adenocarcinoma', 'metastasis'],
  // Infecciones
  '__syn_sepsis__': ['sepsis', 'septicemia', 'bacteriemia', 'shock septico', 'sindrome septico'],
  '__syn_neumonia__': ['neumonia', 'neumonía', 'pac', 'neumonia adquirida comunidad', 'bronconeumonia'],
  '__syn_itu__': ['itu', 'uti', 'infeccion urinaria', 'infeccion tracto urinario', 'cistitis', 'pielonefritis'],
  // Anticoagulación / hematología
  '__syn_tep__': ['tep', 'tromboembolismo pulmonar', 'embolia pulmonar', 'pe'],
  '__syn_tvp__': ['tvp', 'trombosis venosa profunda', 'dvt', 'trombosis'],
  // Anemia
  '__syn_anemia__': ['anemia', 'hemoglobina baja', 'hb baja', 'hgb baja', 'ferropenia'],
  // Cirugía
  '__syn_apendicitis__': ['apendicitis', 'apendicectomia', 'apendice'],
  '__syn_colecistitis__': ['colecistitis', 'colecistectomia', 'colelitiasis', 'calculo biliar', 'vesicula'],
  // Psiquiatría
  '__syn_depresion__': ['depresion', 'sindrome depresivo', 'episodio depresivo mayor', 'tdm', 'trastorno depresivo'],
  '__syn_ansiedad__': ['ansiedad', 'trastorno ansiedad', 'crisis ansiedad', 'crisis panico', 'trastorno panico'],
};

// Mapa invertido: de variante → SYN_TOKEN. Pre-computado una sola vez.
const VARIANT_TO_SYN = new Map<string, string>();
for (const [synToken, variants] of Object.entries(CLINICAL_SYNONYMS)) {
  for (const v of variants) {
    const normalized = v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    VARIANT_TO_SYN.set(normalized, synToken);
  }
}

export class Tokenizer {
  private readonly INDEX_STOPWORDS: Set<string>;
  public readonly QUERY_STOPWORDS: Set<string>;

  constructor() {
    // Solo lingüísticas — usadas también para filtrar queries
    const linguistic = [
      'de','el','la','y','en','del','los','las','un','una','con','por','para','su','al','lo',
      'como','mas','pero','sus','este','esta','se','ha','si','o','entre','cuando','muy','sin',
      'sobre','tambien','me','hasta','hay','donde','quien','desde','todo','nos','durante',
      'todos','uno','les','ni','contra','otros','ese','eso','ante','ellos','e','esto','mi',
      'antes','algunos','que','unos','yo','otro','otras','otra','el','tanto','esa','estos',
      'mucho','quienes','nada','muchos','cual','poco','ella','estar','estas','algunas','algo',
      'nosotros','mis','tu','te','ti','tus'
    ].map(normalizeString);
    
    // Clínicas estructurales — solo para indexación, NO para queries
    const clinicalFillers = [
      'paciente','refiere','presenta','muestra','signos','cuadro','clinico','inicio','hace',
      'horas','dias','meses','anos','ingreso','alta','relevantes'
    ].map(normalizeString);
    
    this.QUERY_STOPWORDS = new Set(linguistic);
    this.INDEX_STOPWORDS = new Set([...linguistic, ...clinicalFillers]);
  }

  public isIndexStopword(term: string): boolean {
    return this.INDEX_STOPWORDS.has(term);
  }

  /**
   * Tokeniza un string en tokens atómicos.
   * Para cada token, se resuelve también su SYN_TOKEN canónico si existe.
   * Retorna ambos: el token original Y el SYN, para máxima recuperabilidad.
   */
  public tokenize(text: string): string[] {
    if (!text) return [];
    const base = normalizeString(text)
      .split(/[^a-z0-9]+/)
      .filter(t => t.length >= 1);

    const expanded: string[] = [];
    for (const t of base) {
      expanded.push(t);
      const syn = VARIANT_TO_SYN.get(t);
      if (syn) expanded.push(syn);
    }
    return expanded;
  }

  /**
   * Expansión de consulta multi-token: detecta frases de hasta 3 palabras
   * en el texto original para capturar sinónimos de términos compuestos
   * como "diabetes mellitus" o "presion alta" que no aparecen como token único.
   */
  public expandQuery(rawText: string): string[] {
    const normalized = normalizeString(rawText);
    const tokens = this.tokenize(normalized);

    // Intentar bigramas y trigramas sobre el texto normalizado
    const words = normalized.split(/\s+/).filter(w => w.length > 1);
    const phraseTokens: string[] = [];
    for (let i = 0; i < words.length; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      if (words[i + 1]) {
        const synBi = VARIANT_TO_SYN.get(bigram);
        if (synBi) phraseTokens.push(synBi);
      }
      if (words[i + 2]) {
        const synTri = VARIANT_TO_SYN.get(trigram);
        if (synTri) phraseTokens.push(synTri);
      }
    }

    return [...new Set([...tokens, ...phraseTokens])];
  }

  public tokenizeRecord(record: Record<string, any>): string[] {
    const tokens: string[] = [];
    for (const key in record) {
      const val = record[key];
      if (val === null || val === undefined) continue;
      
      if (typeof val === 'string') {
        // Para registros, también hacemos expansión de frases para el índice
        tokens.push(...this.expandQuery(val));
      } else if (typeof val === 'number' || typeof val === 'boolean') {
        tokens.push(String(val));
      } else if (Array.isArray(val)) {
        tokens.push(...this.expandQuery(val.join(' ')));
      }
    }
    return tokens;
  }
}

export const globalTokenizer = new Tokenizer();
