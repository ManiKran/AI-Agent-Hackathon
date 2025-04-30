// src/utils/studyPlanPdfGenerator.ts
import PDFDocument from "pdfkit";
import fs from "fs";

export async function generateStudyPlanPDF(studyPlan: { prompt: string, weeks: any[] }) {
  const doc = new PDFDocument();
  const writeStream = fs.createWriteStream("weekly-study-plan.pdf");
  doc.pipe(writeStream);

  doc.fontSize(20).text("Weekly Study Plan", { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(`User Prompt: ${studyPlan.prompt}`);
  doc.moveDown();

  for (const week of studyPlan.weeks) {
    doc.fontSize(16).text(`Week ${week.week}`, { underline: true });
    doc.moveDown(0.5);

    for (const task of week.tasks) {
      doc.fontSize(12).text(`${task.type}: ${task.title}`, { link: task.link, underline: true, fillColor: 'blue' });
      doc.fontSize(10).fillColor('black').text(`Estimated Time: ${task.estimatedMinutes} minutes`);
      doc.moveDown(0.5);
    }

    doc.moveDown();
  }

  doc.end();

  return new Promise<void>((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
}