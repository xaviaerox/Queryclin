const fs = require('fs');

const NHC_COUNT = 50000;
const TOMAS_PER_NHC = 2;
const FIELDS = [
  'NHC_ID', 'ID_TOMA', 'ORDEN_TOMA', 'FECHA_TOMA', 'EC_NOMBRE_PACIENTE', 
  'EC_SEXO', 'EDAD', 'CIUDAD_PACIENTE', 'POSTAL', 'EC_SERVICIO',
  'ANAMNESIS', 'EXPLORACION', 'DIAGNOSTICO', 'TRATAMIENTO', 'ENFERMEDAD ACTUAL'
];

const headers = FIELDS.join('|');
const rows = [headers];

const cities = ['MADRID', 'BARCELONA', 'VALENCIA', 'SEVILLA', 'BILBAO', 'MÁLAGA'];
const services = ['URGENCIAS', 'MEDICINA INTERNA', 'CARDIOLOGÍA', 'NEUMOLOGÍA', 'DIGESTIVO'];
const diagnoses = [
  'Fascitis necrotizante con afectación de tejidos blandos',
  'Insuficiencia cardíaca congestiva grado II',
  'Neumonía bacteriana adquirida en la comunidad',
  'Diabetes Mellitus tipo 2 descompensada',
  'Infección del tracto urinario superior'
];

console.log(`Generando ${NHC_COUNT} pacientes con ${TOMAS_PER_NHC} tomas cada uno...`);

for (let i = 1; i <= NHC_COUNT; i++) {
  const nhc = `NHC-${String(i).padStart(6, '0')}`;
  const name = `PACIENTE PRUEBA ${i}`;
  const sex = Math.random() > 0.5 ? 'H' : 'M';
  const age = Math.floor(Math.random() * 80) + 18;
  const city = cities[Math.floor(Math.random() * cities.length)];
  const cp = Math.floor(Math.random() * 40000) + 10000;

  for (let t = 1; t <= TOMAS_PER_NHC; t++) {
    const tomaId = `TOMA-${i}-${t}`;
    const date = `2024-04-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`;
    const service = services[Math.floor(Math.random() * services.length)];
    const diag = diagnoses[Math.floor(Math.random() * diagnoses.length)];

    const row = [
      nhc, tomaId, t, date, name, sex, age, city, cp, service,
      "Paciente refiere dolor intenso y malestar general.",
      "Exploración física muestra signos de inflamación.",
      diag,
      "Tratamiento estándar con antibióticos y analgésicos.",
      "Cuadro clínico de inicio súbito hace 48 horas."
    ].join('|');
    
    rows.push(row);
  }

  if (i % 10000 === 0) console.log(`Procesados ${i} pacientes...`);
}

fs.writeFileSync('STRESS_TEST_DATA.csv', rows.join('\n'));
console.log('Dataset de estrés generado con éxito: STRESS_TEST_DATA.csv');
