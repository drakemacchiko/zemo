import jsPDF from 'jspdf';

interface AgreementData {
  hostName: string;
  hostEmail: string;
  hostPhone: string;
  hostAddress: string;
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  renterAddress: string;
  renterLicense: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehiclePlate: string;
  vehicleVin: string;
  rentalStartDate: string;
  rentalEndDate: string;
  pickupLocation: string;
  returnLocation: string;
  dailyRate: number;
  totalDays: number;
  totalCost: number;
  securityDeposit: number;
  mileageAllowance: number;
  extraMileageFee: number;
  fuelPolicy: string;
  insurancePlan: string;
  additionalRules: string[];
}

export async function generateRentalAgreementPDF(data: AgreementData): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Set font
  doc.setFont('helvetica');
  
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = doc.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    });
    yPosition += 5;
  };

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('VEHICLE RENTAL AGREEMENT', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Agreement Date
  addText(`Agreement Date: ${new Date().toLocaleDateString()}`, 10, true);
  yPosition += 5;

  // Parties Section
  addText('PARTIES TO THIS AGREEMENT', 14, true);
  addText(`Host: ${data.hostName}`);
  addText(`Email: ${data.hostEmail}`);
  addText(`Phone: ${data.hostPhone}`);
  addText(`Address: ${data.hostAddress}`);
  yPosition += 5;

  addText(`Renter: ${data.renterName}`);
  addText(`Email: ${data.renterEmail}`);
  addText(`Phone: ${data.renterPhone}`);
  addText(`Address: ${data.renterAddress}`);
  addText(`License Number: ${data.renterLicense}`);
  yPosition += 10;

  // Vehicle Details
  addText('VEHICLE DETAILS', 14, true);
  addText(`Vehicle: ${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}`);
  addText(`License Plate: ${data.vehiclePlate}`);
  addText(`VIN: ${data.vehicleVin}`);
  yPosition += 10;

  // Rental Period
  addText('RENTAL PERIOD', 14, true);
  addText(`Start Date & Time: ${new Date(data.rentalStartDate).toLocaleString()}`);
  addText(`End Date & Time: ${new Date(data.rentalEndDate).toLocaleString()}`);
  addText(`Total Duration: ${data.totalDays} day(s)`);
  addText(`Pickup Location: ${data.pickupLocation}`);
  addText(`Return Location: ${data.returnLocation}`);
  yPosition += 10;

  // Pricing
  addText('PRICING & PAYMENT', 14, true);
  addText(`Daily Rate: ZMW ${data.dailyRate.toFixed(2)}`);
  addText(`Total Rental Cost: ZMW ${data.totalCost.toFixed(2)}`);
  addText(`Security Deposit: ZMW ${data.securityDeposit.toFixed(2)}`);
  addText(`Mileage Allowance: ${data.mileageAllowance} km per day`);
  addText(`Extra Mileage Fee: ZMW ${data.extraMileageFee.toFixed(2)} per km`);
  addText(`Fuel Policy: ${data.fuelPolicy}`);
  addText(`Insurance Plan: ${data.insurancePlan}`);
  yPosition += 10;

  // Terms and Conditions
  addText('TERMS AND CONDITIONS', 14, true);
  
  const standardTerms = [
    'The renter agrees to use the vehicle in a safe and responsible manner.',
    'The vehicle must be returned in the same condition as provided.',
    'Any damage or mechanical issues must be reported immediately.',
  ];
  standardTerms.forEach((term: string) => {
    if (term.trim()) {
      addText(term.trim(), 9);
    }
  });

  // Additional Rules
  if (data.additionalRules.length > 0) {
    addText('ADDITIONAL RULES', 14, true);
    data.additionalRules.forEach((rule, index) => {
      addText(`${index + 1}. ${rule}`, 9);
    });
    yPosition += 10;
  }

  // Signatures Section
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }

  addText('SIGNATURES', 14, true);
  yPosition += 10;

  // Host Signature
  doc.line(margin, yPosition, margin + 70, yPosition);
  yPosition += 5;
  addText('Host Signature', 9);
  addText('Date: _________________', 9);
  yPosition += 15;

  // Renter Signature
  doc.line(margin, yPosition, margin + 70, yPosition);
  yPosition += 5;
  addText('Renter Signature', 9);
  addText('Date: _________________', 9);

  // Footer
  yPosition = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'This agreement is legally binding. Both parties should retain a copy for their records.',
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );

  // Convert to Blob
  return doc.output('blob');
}

export async function generateInspectionReportPDF(
  inspectionData: any,
  type: 'pre-trip' | 'post-trip'
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  doc.setFont('helvetica');
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const title = type === 'pre-trip' ? 'PRE-TRIP INSPECTION REPORT' : 'POST-TRIP INSPECTION REPORT';
  doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Booking Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Booking ID: ${inspectionData.bookingId}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Vehicle: ${inspectionData.vehicle}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Date: ${new Date(inspectionData.date).toLocaleString()}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Inspector: ${inspectionData.inspector}`, margin, yPosition);
  yPosition += 15;

  // Inspection Items
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INSPECTION CHECKLIST', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  Object.entries(inspectionData.items).forEach(([category, items]: [string, any]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(category.toUpperCase(), margin, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');

    Object.entries(items).forEach(([item, condition]: [string, any]) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`• ${item}: ${condition}`, margin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
  });

  // Notes
  if (inspectionData.notes) {
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES:', margin, yPosition);
    yPosition += 7;
    doc.setFont('helvetica', 'normal');
    const notes = doc.splitTextToSize(inspectionData.notes, pageWidth - 2 * margin);
    notes.forEach((line: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });
  }

  return doc.output('blob');
}
