import fs from 'fs';
import path from 'path';

// Configuración del dataset sintético
const NUM_PATIENTS = 5000;
const ROWS_PER_PATIENT_AVG = 4;
const OUTPUT_FILE = 'HC_Stress_Test.txt';

// Cabecera original (simplificada para el ejemplo pero manteniendo el orden crítico)
const HEADER = "Id_Toma|Orden_Toma|EC_Fecha_Toma|EC_Proceso|EC_Proceso2|Usuario|Id Acto Clínico Relacionado|Unidad de Enfermería|CIPA|NHC|Fecha de Nacimiento|Edad Toma|EC_Sexo|EC_Ciudad_Paciente|DEMOG-Código postal|Contador|%INR|AGA Vaginal|Abortos:|Actitud|Actividad|Alcohol durante el embarazo?|Altura Uterina|Anamnesis|Anexos:|Anormales|Antecedentes Familiares Generales|Antecedentes Personales Generales|Antecedentes Quirúrgicos Generales|Aumento de peso desde el comienzo del embarazo|Años desde que dejo de fumar|Años desde que dejé de fumar|Años fumando|Bilirrubina Ind.|Bilirrubina Total|Bishop:|Borramiento:|Cesáreas:|Cigarrillos al dia|Cigarrillos al día|Cociente albumina creatinina en muestra de orina aislada|Consistencia:|Cuello|Curva de Glucemia|Datos prenatales a valorar por pediatra|Detalles Dislipemia|Diabetes Gestacional|Diabetes Mellitus|Diagnóstico:|Dilatación:|Dislipemia|Douglas:|Días de gestación|Ectópicos:|Edad|Edemas|Especificar|Estado de la bolsa al ingreso|Exploración general:|FC|FCF$(Variables)|FCF$Bradicarda basal grave|FCF$Bradicardia basal leve|FCF$Bradicardia basal moderada|FCF$Deceleraciones tipo I|FCF$Deceleraciones tipo II|FCF$Deceleraciones tipo III (Variables)|FCF$Deceleración prolongada (calderon)|FCF$I (Variables)|FCF$Patrón no reactivo|FCF$Patrón reactivo|FCF$Ritmo Comprimido|FCF$Ritmo Saltatorio|FCF$Ritmo Silente|FCF$Taquicardia grave|FCF$Taquicardia leve|FCF$Taquicardia moderada|FPP|FPP (corregida por Eco)|FUR|FUR|Fe|Fecha - Hora bolsa rota|Ferritina|Fibrinógeno|Finalidad de la toma:|Fosfatasa alcalina|Frecuencia de contracciones|Fumadora durante el embarazo?|Fórmula Menstrual|Fórmula Obstétrica|GOT|GTP|Gamma GT|Gemelares:|Germen|Gestaciones:|Gestación Actual|Glucemia Basal|Grado NYHA|Grupo Sanguíneo:|Grupo y RH|Grupo y RH:|H|HB Glicosilada|HTA (Hipertensión Arterial)|Habitos tóxicos gestación|Hb|Hbs Ag|Hemorroides|Htó|Hábito Enólico|Hábito Tabáquico|Hábitos tóxicos|IMC:|Intensidad Dinámica|Juicio Diagnóstico Activo|Juicio Diagnóstico Secundario|Leucocitos|Menarquia|Menograma Tipo Actual$Amenorrea primaria|Menograma Tipo Actual$Amenorrea secundaria|Menograma Tipo Actual$Ataxia menstrual / Baches amenorreicos|Menograma Tipo Actual$Braquimenorrea|Menograma Tipo Actual$Dolicomenorrea Postmenstrual|Menograma Tipo Actual$Dolicomenorrea Premenstrual|Menograma Tipo Actual$Eumenorrea|Menograma Tipo Actual$Hiperdolicomenorrea|Menograma Tipo Actual$Hipermenorrea|Menograma Tipo Actual$Hipomenorrea|Menograma Tipo Actual$Metrorragia|Menograma Tipo Actual$Opsomenorrea|Menograma Tipo Actual$Polimenorrea|Microalbuminuria|Motivo de Alta|Motivo de Alta (CEX):|Motivo de consulta:|Motivo de ingreso:|Motivos Transfusiones|Movimientos Fetales|Mutilación de genitales|Nº de colonias, 10 elevado a|Observaciones|Observaciones|Observaciones:|Observaciones:|Otras|Otras Analíticas|Otras Pruebas realizadas|PAD|PAS|PTTA|Paquetes año|Partos:|Perfil Biofísico|Perfil glucémico$Hiperglucemias leves|Perfil glucémico$Hiperglucemias moderada|Perfil glucémico$Hiperglucemias severa|Perfil glucémico$Hipoglucemias|Perfil glucémico$Normal|Perfil glucémico$Patológico|Peso 1ª Visita|Peso:|Plano presentación:|Plaquetas|Posición|Posición:|Prematuros:|Presentación|Procedimientos:|Procesos Ginecológicos Anteriores:|Prueba Oxitocina|Pruebas solicitadas|RPR|Reacciones Adversas a fármacos|Recomendaciones:|Recomendaciones:|Resumen Analítica|Resumen de evolución Paciente|Riesgo por Screening 2º Trimestre:|Riesgo por Screening Combinado:|Rubeola|S. Circulatorio Periférico|SCREENINIG ANEUPLODIAS|Saturación de transferrina|Sedimento|Semanas de gestación|Sensibilidad Antibióticos|Situación|Situación Basal (Otros)|Situación basal|T|T. Protrombinas|TPHA|Talla:|Test de Coombs Indirecto|Test de O,Sullivan|Tipo de Dinámica|Tipo de HTA|Tipo de Ingreso:|Tipo de Rotura de bolsa|Toxoplasmosis|Transferrina|Transfusiones|Tratamiento crónico|Tratamiento:|Tratamiento:|Título Test de Coombs|Urocultivo|Utero:|VCM|VHC|VIH|Valoración del Riesgo|Vitalidad (F.C. F.)|Á. Úrico|Ámbito";

const PROCESOS = [
  "1-GESTACION 2024",
  "Solicitud AP - CONS. MARCHENA",
  "CONTROL GESTACIONAL NORMAL",
  "URGENCIAS OBSTETRICAS",
  "PARTO EUTOCICO",
  "CESÁREA PROGRAMADA",
  "CONTROL DIABETES GESTACIONAL"
];

const CIUDADES = ["MURCIA", "LORCA", "TOTANA", "PUERTO LUMBRERAS", "AGUILAS"];
const POSTALES = ["30800", "30880", "30850", "30820", "30890"];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Codificador manual CP850 para los caracteres críticos
function toCP850(str) {
  return str
    .replace(/ó/g, '\xA2')
    .replace(/Ó/g, '\xE0')
    .replace(/á/g, '\xA0')
    .replace(/é/g, '\x82')
    .replace(/í/g, '\xA1')
    .replace(/ú/g, '\xA3')
    .replace(/ñ/g, '\xA4')
    .replace(/Ñ/g, '\xA5')
    .replace(/¿/g, '\xA8');
}

const writeStream = fs.createWriteStream(path.join(process.cwd(), OUTPUT_FILE), { encoding: 'binary' });
writeStream.write(toCP850(HEADER) + '\n');

let totalRows = 0;
for (let i = 0; i < NUM_PATIENTS; i++) {
  const nhc = 100000 + i;
  const numSessions = Math.floor(Math.random() * 6) + 1;
  const ciudad = getRandom(CIUDADES);
  const cp = getRandom(POSTALES);
  const birthDate = `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}/${1980 + Math.floor(Math.random() * 20)}`;
  
  for (let s = 0; s < numSessions; s++) {
    const idToma = 20000000 + totalRows;
    const orden = numSessions - s; // De más reciente a más antiguo
    const fecha = `22/04/2025 ${10 + s}:00`;
    const procesoId = `2637${Math.floor(Math.random()*9999)}`;
    const procesoNombre = getRandom(PROCESOS);
    
    // Generar observaciones variadas para tests
    let observaciones = "Paciente estable.";
    if (i % 10 === 0) observaciones += " Antecedente de diabetes.";
    if (i % 15 === 0) observaciones += " Cesárea previa.";
    if (i % 20 === 0) observaciones += " Anemia ferropénica.";
    if (i === 1234) observaciones += " Hallazgo crítico de preeclampsia."; // Para búsqueda específica

    const row = new Array(HEADER.split('|').length).fill('');
    row[0] = idToma;
    row[1] = orden;
    row[2] = fecha;
    row[3] = procesoId;
    row[4] = procesoNombre;
    row[5] = "USUARIO_STRESS";
    row[9] = nhc;
    row[10] = birthDate;
    row[11] = 30 + Math.floor(Math.random()*10);
    row[12] = "M";
    row[13] = ciudad;
    row[14] = cp;
    row[137] = observaciones; // Columna Observaciones aprox.

    writeStream.write(toCP850(row.join('|')) + '\n');
    totalRows++;
  }
}

writeStream.end();
console.log(`Dataset de stress generado: ${OUTPUT_FILE} con ${totalRows} filas.`);
