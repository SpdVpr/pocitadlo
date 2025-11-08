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

  // QR Payment Code
  console.log('Payment method:', invoice.paymentMethod);
  console.log('Bank account:', invoice.supplier.bankAccount);

  if (invoice.paymentMethod === 'transfer' && invoice.supplier.bankAccount) {
    console.log('Generating QR code...');
    const qrData = generateQRPaymentString(invoice);
    console.log('QR Payment String:', qrData);

    if (qrData) {
      console.log('QR data is valid, generating QR code image...');
      console.log('QR data string:', qrData);
      console.log('QR data length:', qrData.length);
      console.log('QR data bytes:', new TextEncoder().encode(qrData));

      // Generate QR code with high quality settings for banking apps
      // - Larger size (1024px) for better scanning
      // - Margin 4 (recommended for print and mobile scanning)
      // - Error correction M (15% recovery)
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 1024,
        margin: 4,
        errorCorrectionLevel: 'M'
      });

      // QR code size: 70mm (minimum recommended for reliable mobile scanning)
      const qrSize = 70;
      const qrX = marginLeft;
      const qrY = yPosition;
      console.log('Adding QR code to PDF at position:', qrX, qrY);
      console.log('QR code size:', qrSize, 'mm');
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

  const iban = `CZ${checkDigits}${bban}`;

  console.log('IBAN conversion:', {
    input: accountNumber,
    prefix: match[1] || '0',
    account: match[2],
    bankCode: match[3],
    bban: bban,
    checkDigits: checkDigits,
    iban: iban
  });

  return iban;
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
    // Variable symbol: Max. 10 characters, Integer (whole number without leading zeros)
    const variableSymbol = invoice.variableSymbol?.replace(/^0+/, '') || '0';

    // Build SPAYD string according to SPAYD specification
    // Format: SPD*version*key:value*key:value*...
    // All values must be from ISO-8859-1 charset, preferably alphanumeric for efficiency
    const parts = ['SPD', '1.0'];

    // ACC is required - IBAN format
    parts.push(`ACC:${iban}`);

    // AM - amount (optional but recommended)
    parts.push(`AM:${invoice.totalPrice.toFixed(2)}`);

    // CC - currency (optional, defaults to CZK)
    parts.push(`CC:CZK`);

    // VS - variable symbol (using VS instead of X-VS for better compatibility)
    // Some banks require VS: instead of X-VS: for proper recognition
    if (variableSymbol) {
      parts.push(`VS:${variableSymbol}`);
    }

    // Join parts with * separator - NO trailing asterisk
    const spaydString = parts.join('*');

    // Validate: no spaces, no newlines, no BOM
    const cleanString = spaydString.trim();

    console.log('Generated SPAYD string:', cleanString);
    console.log('SPAYD length:', cleanString.length);
    console.log('SPAYD parts:', parts);
    console.log('Has spaces:', cleanString.includes(' '));
    console.log('Has newlines:', cleanString.includes('\n'));
    console.log('First char code:', cleanString.charCodeAt(0));
    console.log('Last char code:', cleanString.charCodeAt(cleanString.length - 1));

    return cleanString;
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
