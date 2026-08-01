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
  
  // Add title with hotel branding
  doc.setFontSize(20);
  doc.setTextColor(22, 48, 43); // #16302B - Hotel dark green
  doc.text('Hotel Management System', 14, 20);
  
  // Add gold accent line
  doc.setDrawColor(201, 164, 104); // #C9A468 - Hotel gold
  doc.setLineWidth(0.5);
  doc.line(14, 25, 196, 25);
  
  // Add report title
  doc.setFontSize(16);
  doc.setTextColor(42, 38, 34); // #2A2622 - Dark text
  doc.text(title, 14, 38);
  
  // Add period
  doc.setFontSize(12);
  doc.setTextColor(138, 131, 119); // #8A8377 - Muted text
  doc.text(`Period: ${period}`, 14, 48);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 55);
  
  // Add table with hotel colors
  autoTable(doc, {
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => row[col.dataKey])),
    startY: 65,
    styles: { 
      fontSize: 10, 
      cellPadding: 3,
      font: 'helvetica',
    },
    headStyles: { 
      fillColor: [22, 48, 43], // #16302B
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: { 
      fillColor: [247, 241, 228], // #F7F1E4 - Cream
    },
    didParseCell: function(data) {
      // Highlight total rows with gold
      if (data.row.index === data.table.body.length - 1) {
        data.cell.styles.fillColor = [201, 164, 104]; // #C9A468
        data.cell.styles.textColor = [255, 255, 255];
      }
    }
  });
  
  // Add summary
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  if (title.includes('Revenue')) {
    const totalRevenue = data.reduce((sum, row) => sum + (row.revenue || 0), 0);
    const totalProfit = data.reduce((sum, row) => sum + (row.profit || 0), 0);
    
    doc.setFontSize(12);
    doc.setTextColor(42, 38, 34);
    doc.text(`Total Revenue: ₦${totalRevenue.toLocaleString()}`, 14, finalY);
    doc.text(`Total Profit: ₦${totalProfit.toLocaleString()}`, 14, finalY + 7);
    
    // Gold accent for profit margin
    const margin = Math.round((totalProfit / totalRevenue) * 100) || 0;
    doc.setTextColor(201, 164, 104);
    doc.text(`Profit Margin: ${margin}%`, 14, finalY + 14);
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