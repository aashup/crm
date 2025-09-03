import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class DashboardReportService {

  generateDummyReport() {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 40;
    const tableWidth = pageWidth - marginX * 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text('BUSINESS REPORT', pageWidth / 2, 50, { align: 'center' });


    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(80);
    doc.text('2024-01-01 to 2024-01-31', pageWidth / 2, 72, { align: 'center' });

    let cursorY = 100;

    const drawHeading = (text: string, y: number) => {
      doc.setFillColor(37, 99, 235);
      doc.rect(marginX, y, tableWidth, 20, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255);
      doc.setFontSize(12);
      doc.text(text, marginX + 8, y + 14);
    };

    drawHeading('Sales', cursorY);
    autoTable(doc, {
      startY: cursorY + 25,
      margin: { left: marginX, right: marginX },
      head: [['ID', 'Date', 'Amount']],
      body: [
        ['1', '2024-01-05', 'Rs.1,000.00'],
        ['2', '2024-01-12', 'Rs.2,500.00'],
        ['3', '2024-01-18', 'Rs.3,000.00'],
        ['4', '2024-01-25', 'Rs.1,500.00'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 6, textColor: [0, 0, 0], lineColor: [200, 200, 200], lineWidth: 0.3 }
    } as UserOptions);

    let lastY = (doc as any).lastAutoTable.finalY + 20;

    drawHeading('Purchases', lastY);
    autoTable(doc, {
      startY: lastY + 25,
      margin: { left: marginX, right: marginX },
      head: [['ID', 'Date', 'Amount']],
      body: [
        ['1', '2024-01-03', 'Rs.800.00'],
        ['2', '2024-01-10', 'Rs.1,200.00'],
        ['3', '2024-01-20', 'Rs.1,500.00'],
        ['4', '2024-01-28', 'Rs.700.00'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 6, textColor: [0, 0, 0], lineColor: [200, 200, 200], lineWidth: 0.3 }
    } as UserOptions);

    let lastY2 = (doc as any).lastAutoTable.finalY + 20;

    drawHeading('Expense', lastY2);
    autoTable(doc, {
      startY: lastY2 + 25,
      margin: { left: marginX, right: marginX },
      head: [['ID', 'Date', 'Type', 'Amount']],
      body: [
        ['1', '2024-01-02', 'Office Rent', 'Rs.3,000.00'],
        ['2', '2024-01-08', 'Electricity', 'Rs.1,200.00'],
        ['3', '2024-01-15', 'Stationery', 'Rs.300.00'],
        ['4', '2024-01-22', 'Internet', 'Rs.500.00'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 6, textColor: [0, 0, 0], lineColor: [200, 200, 200], lineWidth: 0.3 }
    } as UserOptions);

    let lastY3 = (doc as any).lastAutoTable.finalY + 20;

    drawHeading('Summary', lastY3);
    autoTable(doc, {
      startY: lastY3 + 25,
      margin: { left: marginX, right: marginX },
      head: [['', '']],
      body: [
        ['Total Sales:', 'Rs.8,000.00'],
        ['Total Purchases:', 'Rs.4,200.00'],
        ['Total Expenses:', 'Rs.900.00'],
        ['Net Profit:', 'Rs.2,900.00'],
      ],
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 6, textColor: [0, 0, 0], lineColor: [200, 200, 200], lineWidth: 0.3 },
      headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: 'bold' },
      columnStyles: { 0: { halign: 'left' }, 1: { halign: 'right' } }
    } as UserOptions);

    doc.save('business_report.pdf');
  }
}
