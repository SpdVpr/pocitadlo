import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from '@/types';
import QRCode from 'qrcode';
import { createShortPaymentDescriptor } from '@spayd/core';
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
  if (invoice.supplier.bankAccount) {
    const accountLabel = invoice.supplier.bankAccount.match(/^CZ\d{22}$/) ? 'IBAN:' : 'Číslo účtu:';
    doc.text(accountLabel + ' ' + String(invoice.supplier.bankAccount), leftColX, yPosition);
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

  console.log('Payment method:', invoice.paymentMethod);
  console.log('Bank account:', invoice.supplier.bankAccount);

  if (invoice.paymentMethod === 'transfer' && invoice.supplier.bankAccount) {
    console.log('Generating QR code...');
    const qrData = generateQRPaymentString(invoice);
    console.log('QR Payment String:', qrData);

    if (qrData) {
      console.log('QR data is valid, generating QR code image...');
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 512,
        margin: 4,
        errorCorrectionLevel: 'M',
        type: 'image/png'
      });

      const qrSize = 50; // Increased from 40 to 50mm
      const qrX = marginLeft;
      const qrY = yPosition;
      console.log('Adding QR code to PDF at position:', qrX, qrY);
      doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

      doc.setFontSize(9);
      doc.setFont('Roboto');
      doc.text('QR Platba', qrX + 2, qrY + qrSize + 5);
      console.log('QR code added successfully');
    } else {
      console.warn('QR data is empty, skipping QR code generation');
    }
  } else {
    console.warn('QR code not generated - payment method or bank account missing');
  }

  doc.save('faktura-' + invoice.invoiceNumber + '.pdf');
}

function czechAccountToIBAN(accountNumber: string): string {
  // Remove spaces
  const cleaned = accountNumber.replace(/\s/g, '');

  // Check if it's already IBAN
  if (cleaned.match(/^CZ\d{22}$/)) {
    return cleaned;
  }

  // Parse Czech account number format: [prefix-]account/bankCode
  const match = cleaned.match(/^(?:(\d+)-)?(\d+)\/(\d+)$/);
  if (!match) {
    console.warn('Invalid account number format');
    return '';
  }

  const prefix = (match[1] || '0').padStart(6, '0');
  const account = match[2].padStart(10, '0');
  const bankCode = match[3].padStart(4, '0');

  // Create BBAN (Basic Bank Account Number)
  const bban = bankCode + prefix + account;

  // Calculate check digits using modulo 97
  // Move country code and 00 to the end, convert letters to numbers (C=12, Z=35)
  const numericIBAN = bban + '1235' + '00'; // CZ = 12 35, 00 for calculation
  let remainder = BigInt(numericIBAN) % BigInt(97);
  const checkDigits = (BigInt(98) - remainder).toString().padStart(2, '0');

  return `CZ${checkDigits}${bban}`;
}

function generateQRPaymentString(invoice: Invoice): string {
  console.log('generateQRPaymentString called');
  console.log('Bank account:', invoice.supplier.bankAccount);

  if (!invoice.supplier.bankAccount) {
    console.warn('No bank account provided');
    return '';
  }

  const iban = czechAccountToIBAN(invoice.supplier.bankAccount);
  console.log('Converted IBAN:', iban);

  if (!iban) {
    console.warn('Could not convert to IBAN, QR code will not be generated');
    return '';
  }

  try {
    // X-VS requires exactly 10 digits according to Czech banking standards (KB specification)
    // Pad the variable symbol to 10 digits with leading zeros
    const vs10Digits = invoice.variableSymbol.padStart(10, '0');

    console.log('Creating SPAYD string with params:', {
      acc: iban,
      am: invoice.totalPrice.toFixed(2),
      cc: 'CZK',
      vs: vs10Digits,
    });

    // Create SPAYD string manually because @spayd/core has incorrect validation
    // that doesn't allow leading zeros in X-VS (but KB specification requires 10 digits)
    // Format: SPD*1.0*ACC:iban*AM:amount*CC:currency*X-VS:variableSymbol
    const spaydString = `SPD*1.0*ACC:${iban}*AM:${invoice.totalPrice.toFixed(2)}*CC:CZK*X-VS:${vs10Digits}`;

    console.log('Generated SPAYD string:', spaydString);
    return spaydString;
  } catch (error) {
    console.error('Error generating SPAYD string:', error);
    return '';
  }
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
