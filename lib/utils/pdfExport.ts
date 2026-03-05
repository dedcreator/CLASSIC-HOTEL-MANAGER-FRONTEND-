// frontend/lib/utils/pdfExport.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportOptions {
  title: string;
  period: string;
  data: any[];
  columns: { header: string; dataKey: string }[];
}

export const exportToPDF = ({ title, period, data, columns }: ExportOptions) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.setTextColor(229, 62, 62); // Red color
  doc.text('Hotel Management System', 14, 20);
  
  // Add report title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 14, 35);
  
  // Add period
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Period: ${period}`, 14, 45);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 52);
  
  // Add table
  autoTable(doc, {
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => row[col.dataKey])),
    startY: 60,
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [229, 62, 62], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });
  
  // Add summary at the bottom
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  if (title.includes('Revenue')) {
    const totalRevenue = data.reduce((sum, row) => sum + (row.revenue || 0), 0);
    const totalProfit = data.reduce((sum, row) => sum + (row.profit || 0), 0);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Revenue: ₦${totalRevenue.toLocaleString()}`, 14, finalY);
    doc.text(`Total Profit: ₦${totalProfit.toLocaleString()}`, 14, finalY + 7);
    doc.text(`Profit Margin: ${Math.round((totalProfit / totalRevenue) * 100)}%`, 14, finalY + 14);
  }
  
  // Save the PDF
  doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${period}.pdf`);
};

export const exportToExcel = ({ title, period, data, columns }: ExportOptions) => {
  // Convert data to CSV
  const headers = columns.map(col => col.header).join(',');
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col.dataKey];
      if (typeof value === 'number') return value;
      if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
      return value;
    }).join(',')
  ).join('\n');
  
  const csv = `${headers}\n${rows}`;
  
  // Create and download CSV file
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${period}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};