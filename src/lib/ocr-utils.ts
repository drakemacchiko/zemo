import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  extractedData?: {
    name?: string;
    licenseNumber?: string;
    expiryDate?: string;
    dateOfBirth?: string;
    address?: string;
  };
}

export async function performOCR(imageUrl: string): Promise<OCRResult> {
  try {
    const {
      data: { text, confidence },
    } = await Tesseract.recognize(imageUrl, 'eng');

    return {
      text,
      confidence,
    };
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to perform OCR');
  }
}

export async function extractDriverLicenseData(imageUrl: string): Promise<OCRResult> {
  const ocrResult = await performOCR(imageUrl);

  const extractedData: any = {};
  const lines = ocrResult.text.split('\n');

  // Simple pattern matching for common license fields
  // This is a basic implementation - production would need more sophisticated parsing
  lines.forEach(line => {
    const upperLine = line.toUpperCase();

    // License number (varies by country/region)
    if (upperLine.includes('LICENSE') || upperLine.includes('LICENCE')) {
      const match = line.match(/[A-Z0-9]{6,15}/);
      if (match) extractedData.licenseNumber = match[0];
    }

    // Expiry date
    if (upperLine.includes('EXP') || upperLine.includes('EXPIR')) {
      const dateMatch = line.match(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/);
      if (dateMatch) extractedData.expiryDate = dateMatch[0];
    }

    // Date of birth
    if (upperLine.includes('DOB') || upperLine.includes('BIRTH')) {
      const dateMatch = line.match(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/);
      if (dateMatch) extractedData.dateOfBirth = dateMatch[0];
    }
  });

  return {
    ...ocrResult,
    extractedData,
  };
}

export async function extractNationalIDData(imageUrl: string): Promise<OCRResult> {
  const ocrResult = await performOCR(imageUrl);

  const extractedData: any = {};
  const lines = ocrResult.text.split('\n');

  lines.forEach(line => {
    const upperLine = line.toUpperCase();

    // ID number
    if (upperLine.includes('ID') || upperLine.includes('NUMBER')) {
      const match = line.match(/[0-9]{6,15}/);
      if (match) extractedData.idNumber = match[0];
    }

    // Name (usually appears after "NAME:" or similar)
    if (upperLine.includes('NAME')) {
      const nameParts = line.split(':');
      if (nameParts.length > 1 && nameParts[1]) {
        extractedData.name = nameParts[1].trim();
      }
    }
  });

  return {
    ...ocrResult,
    extractedData,
  };
}

export function validateLicenseExpiry(expiryDate: string): boolean {
  try {
    // Parse date (format may vary)
    const parts = expiryDate.split(/[-/]/);
    let parsedDate: Date;

    if (parts.length === 3) {
      // Assume MM-DD-YYYY or DD-MM-YYYY
      const [part1, part2, part3] = parts;
      const year = part3 && part3.length === 2 ? 2000 + parseInt(part3) : parseInt(part3 || '0');

      if (!part1 || !part2) return false;

      // Try MM-DD-YYYY first
      parsedDate = new Date(year, parseInt(part1) - 1, parseInt(part2));

      // If invalid, try DD-MM-YYYY
      if (isNaN(parsedDate.getTime())) {
        parsedDate = new Date(year, parseInt(part2) - 1, parseInt(part1));
      }

      // Check if license is still valid
      return parsedDate > new Date();
    }

    return false;
  } catch (error) {
    console.error('Error validating license expiry:', error);
    return false;
  }
}
