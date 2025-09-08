import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';

@Injectable({
  providedIn: 'root',
})
export class DashboardReportService {
  generateReport(report: any, startDate?: Date, endDate?: Date) {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 40;
    const tableWidth = pageWidth - marginX * 2;

    let sDate = startDate;
    let eDate = endDate;

    if (!sDate || !eDate) {
      const allDates: Date[] = [];
      (report.sales || []).forEach((s: any) => allDates.push(new Date(s.created_at)));
      (report.purchases || []).forEach((p: any) => allDates.push(new Date(p.created_at)));
      (report.expenses || []).forEach((e: any) => allDates.push(new Date(e.created_at)));
      if (allDates.length) {
        allDates.sort((a, b) => a.getTime() - b.getTime());
        sDate = allDates[0];
        eDate = allDates[allDates.length - 1];
      } else {
        sDate = new Date();
        eDate = new Date();
      }
    }

    const dateRangeText = `${sDate.toLocaleDateString()} to ${eDate.toLocaleDateString()}`;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text('BUSINESS REPORT', pageWidth / 2, 50, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(80);
    doc.text(dateRangeText, pageWidth / 2, 72, { align: 'center' });

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

    const salesRows = (report.sales || []).map((s: any) => {
      const details = (s.sale_details || [])
        .map(
          (d: any, idx: number) =>
            `${idx + 1}. ${d.product?.name ?? d.product_id} | ${d.unit?.name ?? d.unit_id} | Qty:${d.quantity} | Rate:${d.rate} | Tax:${d.tax_amount} | Total:${d.net}`
        )
        .join('\n');
      return [
        s.id,
        new Date(s.created_at).toLocaleDateString(),
        s.party?.name ?? '',
        details,
        `Rs.${(+s.net_total).toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      startY: cursorY + 25,
      margin: { left: marginX, right: marginX },
      head: [['ID', 'Date', 'Party Name', 'Sale Details', 'Amount']],
      body: salesRows,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [0, 0, 0],
        lineColor: [200, 200, 200],
        lineWidth: 0.3,
        valign: 'top',
      },
      columnStyles: {
        3: { cellWidth: 260 },
      },
      headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: 'bold' },
    } as UserOptions);

    let lastY = (doc as any).lastAutoTable.finalY + 20;

    drawHeading('Purchases', lastY);

    const purchaseRows = (report.purchases || []).map((p: any) => {
      const details = (p.purchase_details || [])
        .map(
          (d: any, idx: number) =>
            `${idx + 1}. ${d.product?.name ?? d.product_id} | ${d.unit?.name ?? d.unit_id} | Qty:${d.quantity} | Rate:${d.rate} | Tax:${d.tax_amount} | Total:${d.net}`
        )
        .join('\n');
      return [
        p.id,
        new Date(p.created_at).toLocaleDateString(),
        p.party?.name ?? '',
        details,
        `Rs.${(+p.net_total).toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      startY: lastY + 25,
      margin: { left: marginX, right: marginX },
      head: [['ID', 'Date', 'Party Name', 'Purchase Details', 'Amount']],
      body: purchaseRows,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [0, 0, 0],
        lineColor: [200, 200, 200],
        lineWidth: 0.3,
        valign: 'top',
      },
      columnStyles: {
        3: { cellWidth: 260 },
      },
      headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: 'bold' },
    } as UserOptions);

    let lastY2 = (doc as any).lastAutoTable.finalY + 20;

    drawHeading('Expenses', lastY2);

    const expenseRows = (report.expenses || []).map((e: any) => [
      e.id,
      new Date(e.created_at).toLocaleDateString(),
      e.expense_type,
      `Rs.${(+e.amount).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: lastY2 + 25,
      margin: { left: marginX, right: marginX },
      head: [['ID', 'Date', 'Type', 'Amount']],
      body: expenseRows,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 6,
        textColor: [0, 0, 0],
        lineColor: [200, 200, 200],
        lineWidth: 0.3,
      },
      headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: 'bold' },
    } as UserOptions);

    let lastY3 = (doc as any).lastAutoTable.finalY + 20;

    const totalSales = (report.sales || []).reduce((sum: number, s: any) => sum + +s.net_total, 0);
    const totalPurchases = (report.purchases || []).reduce((sum: number, p: any) => sum + +p.net_total, 0);
    const expenses = report.expenses || [];
    const totalExpense = expenses
      .filter((e: any) => e.expense_type === 'expense')
      .reduce((sum: number, e: any) => sum + +e.amount, 0);
    const totalGain = expenses
      .filter((e: any) => e.expense_type === 'gain')
      .reduce((sum: number, e: any) => sum + +e.amount, 0);
    const netProfit =  (totalSales + totalGain)-(totalPurchases + totalExpense)

    drawHeading('Summary', lastY3);

    autoTable(doc, {
      startY: lastY3 + 25,
      margin: { left: marginX, right: marginX },
      head: [['', '']],
      body: [
        ['Total Sales:', `Rs.${totalSales.toFixed(2)}`],
        ['Total Purchases:', `Rs.${totalPurchases.toFixed(2)}`],
        ['Total Expenses:', `Rs.${totalExpense.toFixed(2)}`],
        ['Total Gain:', `Rs.${totalGain.toFixed(2)}`],
        ['Net Profit:', `Rs.${netProfit.toFixed(2)}`],
      ],
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 6,
        textColor: [0, 0, 0],
        lineColor: [200, 200, 200],
        lineWidth: 0.3,
      },
      headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: 'bold' },
      columnStyles: { 0: { halign: 'left' }, 1: { halign: 'right' } },
      didParseCell: (data:any) => {
        if (data.section === 'body' && data.column.index === 1) {
          const label = data.row.raw[0];
          if (label === 'Net Profit:') {
            if (netProfit < 0) {
              data.cell.styles.textColor = [220, 38, 38];
            } else {
              data.cell.styles.textColor = [34, 197, 94];
            }
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
    } as UserOptions);

    doc.save('business_report.pdf');
  }
}
