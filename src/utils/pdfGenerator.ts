// src/utils/pdfGenerator.ts
import PDFDocument from "pdfkit";
import fs from "fs";

export async function generateLearningPDF(recommendations: any[]) {
  const doc = new PDFDocument();
  const writeStream = fs.createWriteStream("learning-resources.pdf");
  doc.pipe(writeStream);

  doc.fontSize(20).text("Learning Resources", { underline: true });
  doc.moveDown();

  for (const rec of recommendations) {
    doc.fontSize(16).text(`Topic: ${rec.topic}`);
    
    if (rec.certification) {
      doc.fontSize(12).fillColor('blue').text(`Certification: ${rec.certification}`, { link: extractLink(rec.certification), underline: true });
    }

    if (rec.youtube && Array.isArray(rec.youtube)) {
      for (const yt of rec.youtube) {
        doc.fontSize(12).fillColor('blue').text(`YouTube: ${yt}`, { link: extractLink(yt), underline: true });
      }
    }

    if (rec.github && Array.isArray(rec.github)) {
      for (const gh of rec.github) {
        doc.fontSize(12).fillColor('blue').text(`GitHub: ${gh.name}`, { link: gh.url, underline: true });
      }
    }

    doc.moveDown();
    doc.fillColor('black'); // Reset color
  }

  doc.end();

  return new Promise<void>((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
}

function extractLink(text: string) {
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  return urlMatch ? urlMatch[0] : "";
}