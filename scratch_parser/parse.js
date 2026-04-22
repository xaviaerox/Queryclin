const fs = require('fs');
const pdfParse = require('pdf-parse');
const XLSX = require('xlsx');

async function parse() {
  try {
    const pdfBuffer = fs.readFileSync('../HCE-Diseño Estructura.pdf');
    const pdfData = await pdfParse(pdfBuffer);
    console.log('--- PDF CONTENTS ---');
    console.log(pdfData.text);
  } catch (e) {
    console.log('Error reading PDF:', e);
  }

  try {
    console.log('\n--- XLSX CONTENTS ---');
    const workbook = XLSX.readFile('../Estructura HCE-Comun.xlsx');
    workbook.SheetNames.forEach(sheetName => {
      console.log(`\nSheet: ${sheetName}`);
      console.log(XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]));
    });
  } catch (e) {
    console.log('Error reading XLSX:', e);
  }
}

parse().catch(console.error);
