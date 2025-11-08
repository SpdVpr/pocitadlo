import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from '@/types';
import QRCode from 'qrcode';
import { robotoRegularBase64, robotoBoldBase64 } from './roboto-font';

export async function generateInvoicePDF(invoice: Invoice): Promise<void> {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
    compress: true,
  });
  
  doc.addFileToVFS('Roboto-Regular.ttf', robotoRegularBase64);
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
  doc.addFileToVFS('Roboto-Bold.ttf', robotoBoldBase64);
  doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
  doc.setFont('Roboto');
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 20;
  const marginRight = 20;
  const centerX = pageWidth / 2;
  let yPosition = 20;

  doc.setFontSize(24);
  doc.setFont('Roboto');
  doc.text('FAKTURA', centerX, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFontSize(10);
  doc.setFont('Roboto');
  
  const leftInfoX = marginLeft;
  const rightInfoX = centerX + 20;
  const infoY = yPosition;
  
  doc.text('Číslo faktury:', leftInfoX, yPosition);
  doc.text(String(invoice.invoiceNumber), leftInfoX + 35, yPosition);
  
  doc.text('Variabilní symbol:', rightInfoX, yPosition);
  doc.text(String(invoice.variableSymbol || invoice.invoiceNumber.replace(/\D/g, '')), rightInfoX + 38, yPosition);
  yPosition += 6;

  const issueDate = invoice.issueDate.toDate();
  const dueDate = invoice.dueDate.toDate();
  
  doc.text('Datum vystavení:', leftInfoX, yPosition);
  doc.text(String(formatDate(issueDate)), leftInfoX + 35, yPosition);
  
  const paymentMethod = invoice.paymentMethod === 'transfer' ? 'Převodem' : 'Hotově';
  doc.text('Způsob platby:', rightInfoX, yPosition);
  doc.text(String(paymentMethod), rightInfoX + 38, yPosition);
  yPosition += 6;
  
  doc.text('Datum splatnosti:', leftInfoX, yPosition);
  doc.text(String(formatDate(dueDate)), leftInfoX + 35, yPosition);
  yPosition += 15;

  const leftColX = marginLeft;
  const rightColX = centerX + 10;
  const supplierY = yPosition;

  doc.setFontSize(11);
  doc.setFont('Roboto', 'bold');
  doc.text('Dodavatel:', leftColX, yPosition);
  doc.setFont('Roboto');
  yPosition += 6;
  doc.text(String(invoice.supplier.companyName), leftColX, yPosition);
  yPosition += 5;
  doc.text(String(invoice.supplier.street), leftColX, yPosition);
  yPosition += 5;
  doc.text(String(invoice.supplier.zipCode) + ' ' + String(invoice.supplier.city), leftColX, yPosition);
  yPosition += 5;
  doc.text('IČO: ' + String(invoice.supplier.ico), leftColX, yPosition);
  yPosition += 5;
  
  let maxSupplierY = yPosition;
  
  if (invoice.supplier.dic) {
    doc.text('DIČ: ' + String(invoice.supplier.dic), leftColX, yPosition);
    yPosition += 5;
    maxSupplierY = yPosition;
  }
  if (invoice.supplier.phone) {
    doc.text('Tel: ' + String(invoice.supplier.phone), leftColX, yPosition);
    yPosition += 5;
    maxSupplierY = yPosition;
  }
  if (invoice.supplier.email) {
    doc.text('Email: ' + String(invoice.supplier.email), leftColX, yPosition);
    yPosition += 5;
    maxSupplierY = yPosition;
  }

  yPosition = supplierY;
  doc.setFont('Roboto', 'bold');
  doc.text('Odběratel:', rightColX, yPosition);
  doc.setFont('Roboto');
  yPosition += 6;
  doc.text(String(invoice.client.companyName), rightColX, yPosition);
  yPosition += 5;
  doc.text(String(invoice.client.street), rightColX, yPosition);
  yPosition += 5;
  doc.text(String(invoice.client.zipCode) + ' ' + String(invoice.client.city), rightColX, yPosition);
  yPosition += 5;
  
  if (invoice.client.ico) {
    doc.text('IČO: ' + String(invoice.client.ico), rightColX, yPosition);
    yPosition += 5;
  }
  if (invoice.client.dic) {
    doc.text('DIČ: ' + String(invoice.client.dic), rightColX, yPosition);
    yPosition += 5;
  }

  yPosition = Math.max(maxSupplierY, yPosition) + 10;

  autoTable(doc, {
    startY: yPosition,
    head: [['Popis', 'Počet hodin', 'Cena za MJ', 'Celkem']],
    body: [[
      invoice.description,
      invoice.hours.toFixed(2),
      formatCurrency(invoice.hourlyRate),
      formatCurrency(invoice.totalPrice)
    ]],
    margin: { left: marginLeft, right: marginRight },
    styles: {
      font: 'Roboto',
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [230, 230, 230],
      textColor: [0, 0, 0],
      fontStyle: 'normal',
    },
    theme: 'plain',
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(12);
  doc.setFont('Roboto', 'bold');
  doc.text('Cena celkem: ' + formatCurrency(invoice.totalPrice), pageWidth - marginRight, yPosition, { align: 'right' });
  doc.setFont('Roboto');
  yPosition += 15;

  if (invoice.paymentMethod === 'transfer' && invoice.supplier.bankAccount) {
    const qrData = generateQRPaymentString(invoice);
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, { width: 200, margin: 1 });
    
    const qrX = marginLeft;
    const qrY = yPosition;
    doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, 35, 35);
    
    doc.setFontSize(9);
    doc.setFont('Roboto');
    doc.text('QR Platba', qrX + 2, qrY + 40);
  }

  doc.save('faktura-' + invoice.invoiceNumber + '.pdf');
}

function generateQRPaymentString(invoice: Invoice): string {
  if (!invoice.supplier.bankAccount) return '';
  
  const amount = invoice.totalPrice.toFixed(2);
  const vs = invoice.variableSymbol;
  const accountNumber = invoice.supplier.bankAccount.replace(/\s/g, '');
  
  return `SPD*1.0*ACC:${accountNumber}*AM:${amount}*CC:CZK*X-VS:${vs}`;
}

function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatCurrency(amount: number): string {
  const formatted = amount.toFixed(2);
  const [whole, decimal] = formatted.split('.');
  const withSpaces = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${withSpaces},${decimal} Kč`;
}
