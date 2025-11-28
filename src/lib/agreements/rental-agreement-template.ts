export interface RentalAgreementData {
  bookingId: string
  agreementNumber: string
  
  // Host Information
  host: {
    name: string
    email: string
    phone: string
    address: string
    idNumber: string
  }
  
  // Renter Information
  renter: {
    name: string
    email: string
    phone: string
    address: string
    licenseNumber: string
    idNumber: string
  }
  
  // Vehicle Information
  vehicle: {
    make: string
    model: string
    year: number
    plateNumber: string
    vin: string
    color: string
    mileage: number
  }
  
  // Rental Details
  rental: {
    startDate: Date
    endDate: Date
    pickupLocation: string
    dropoffLocation: string
    dailyRate: number
    totalDays: number
    totalAmount: number
    securityDeposit: number
    platformFee: number
  }
  
  // Terms & Conditions
  terms: {
    mileageLimit?: number
    fuelPolicy: string
    lateReturnFee: number
    smokingAllowed: boolean
    petsAllowed: boolean
    additionalDrivers: string[]
  }
}

export const generateRentalAgreementHTML = (data: RentalAgreementData): string => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW'
    }).format(amount)
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Vehicle Rental Agreement - ${data.agreementNumber}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #2563eb;
      margin: 0 0 10px 0;
    }
    .agreement-number {
      font-size: 14px;
      color: #666;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 15px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 5px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    .info-item {
      margin-bottom: 10px;
    }
    .info-label {
      font-weight: bold;
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
    }
    .info-value {
      color: #333;
      font-size: 14px;
      margin-top: 2px;
    }
    .terms-list {
      list-style: decimal;
      padding-left: 20px;
    }
    .terms-list li {
      margin-bottom: 15px;
    }
    .signature-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 60px;
    }
    .signature-box {
      border-top: 2px solid #333;
      padding-top: 10px;
    }
    .signature-label {
      font-weight: bold;
      margin-bottom: 5px;
    }
    .signature-date {
      font-size: 12px;
      color: #666;
    }
    .footer {
      text-align: center;
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #666;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #f3f4f6;
      font-weight: bold;
    }
    .highlight {
      background-color: #fef3c7;
      padding: 15px;
      border-left: 4px solid #f59e0b;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>VEHICLE RENTAL AGREEMENT</h1>
    <div class="agreement-number">Agreement No: ${data.agreementNumber}</div>
    <div class="agreement-number">Date: ${formatDate(new Date())}</div>
  </div>

  <div class="section">
    <div class="section-title">PARTIES TO THE AGREEMENT</div>
    
    <div class="info-grid">
      <div>
        <h3 style="margin-bottom: 10px;">HOST (Owner)</h3>
        <div class="info-item">
          <div class="info-label">Name</div>
          <div class="info-value">${data.host.name}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Email</div>
          <div class="info-value">${data.host.email}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Phone</div>
          <div class="info-value">${data.host.phone}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Address</div>
          <div class="info-value">${data.host.address}</div>
        </div>
        <div class="info-item">
          <div class="info-label">ID Number</div>
          <div class="info-value">${data.host.idNumber}</div>
        </div>
      </div>

      <div>
        <h3 style="margin-bottom: 10px;">RENTER</h3>
        <div class="info-item">
          <div class="info-label">Name</div>
          <div class="info-value">${data.renter.name}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Email</div>
          <div class="info-value">${data.renter.email}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Phone</div>
          <div class="info-value">${data.renter.phone}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Address</div>
          <div class="info-value">${data.renter.address}</div>
        </div>
        <div class="info-item">
          <div class="info-label">License Number</div>
          <div class="info-value">${data.renter.licenseNumber}</div>
        </div>
        <div class="info-item">
          <div class="info-label">ID Number</div>
          <div class="info-value">${data.renter.idNumber}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">VEHICLE INFORMATION</div>
    <table>
      <tr>
        <th>Make & Model</th>
        <td>${data.vehicle.year} ${data.vehicle.make} ${data.vehicle.model}</td>
      </tr>
      <tr>
        <th>License Plate</th>
        <td>${data.vehicle.plateNumber}</td>
      </tr>
      <tr>
        <th>VIN</th>
        <td>${data.vehicle.vin}</td>
      </tr>
      <tr>
        <th>Color</th>
        <td>${data.vehicle.color}</td>
      </tr>
      <tr>
        <th>Current Mileage</th>
        <td>${data.vehicle.mileage.toLocaleString()} km</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">RENTAL PERIOD & CHARGES</div>
    <table>
      <tr>
        <th>Rental Start Date</th>
        <td>${formatDate(data.rental.startDate)}</td>
      </tr>
      <tr>
        <th>Rental End Date</th>
        <td>${formatDate(data.rental.endDate)}</td>
      </tr>
      <tr>
        <th>Pickup Location</th>
        <td>${data.rental.pickupLocation}</td>
      </tr>
      <tr>
        <th>Drop-off Location</th>
        <td>${data.rental.dropoffLocation}</td>
      </tr>
      <tr>
        <th>Daily Rate</th>
        <td>${formatCurrency(data.rental.dailyRate)}</td>
      </tr>
      <tr>
        <th>Total Days</th>
        <td>${data.rental.totalDays}</td>
      </tr>
      <tr>
        <th>Security Deposit</th>
        <td>${formatCurrency(data.rental.securityDeposit)}</td>
      </tr>
      <tr>
        <th>Platform Fee</th>
        <td>${formatCurrency(data.rental.platformFee)}</td>
      </tr>
      <tr style="background-color: #fef3c7; font-weight: bold;">
        <th>TOTAL AMOUNT</th>
        <td>${formatCurrency(data.rental.totalAmount)}</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">TERMS AND CONDITIONS</div>
    <ol class="terms-list">
      <li>
        <strong>Use of Vehicle:</strong> The Renter agrees to use the vehicle solely for personal use and will not 
        use it for any illegal purposes, racing, or off-road driving unless expressly permitted.
      </li>
      
      <li>
        <strong>Fuel Policy:</strong> ${data.terms.fuelPolicy}. The vehicle should be returned with the same fuel level as at pickup.
      </li>
      
      ${data.terms.mileageLimit ? `
      <li>
        <strong>Mileage Limit:</strong> The rental includes ${data.terms.mileageLimit} km per day. 
        Additional mileage will be charged at the rate specified in the booking.
      </li>
      ` : ''}
      
      <li>
        <strong>Late Return:</strong> Late returns will incur a charge of ${formatCurrency(data.terms.lateReturnFee)} per hour.
        Returns more than 2 hours late may be charged as an additional full day.
      </li>
      
      <li>
        <strong>Smoking Policy:</strong> Smoking is ${data.terms.smokingAllowed ? 'permitted' : 'strictly prohibited'} 
        in the vehicle. ${!data.terms.smokingAllowed ? 'Violations will result in a cleaning fee of ZMW 500.' : ''}
      </li>
      
      <li>
        <strong>Pet Policy:</strong> Pets are ${data.terms.petsAllowed ? 'allowed' : 'not permitted'} in the vehicle.
        ${!data.terms.petsAllowed ? 'Violations will result in a cleaning fee of ZMW 500.' : ''}
      </li>
      
      ${data.terms.additionalDrivers.length > 0 ? `
      <li>
        <strong>Additional Drivers:</strong> The following additional drivers are authorized: 
        ${data.terms.additionalDrivers.join(', ')}. Only these individuals may drive the vehicle.
      </li>
      ` : ''}
      
      <li>
        <strong>Insurance:</strong> The vehicle is covered by the Owner's insurance policy. The Renter is responsible 
        for any damages not covered by insurance, up to the amount of the security deposit.
      </li>
      
      <li>
        <strong>Accidents & Damage:</strong> In case of an accident or damage, the Renter must immediately notify 
        both the Owner and local authorities. A police report must be filed for insurance purposes.
      </li>
      
      <li>
        <strong>Security Deposit:</strong> A security deposit of ${formatCurrency(data.rental.securityDeposit)} 
        has been collected. This will be refunded within 7 business days after the vehicle is returned in good 
        condition, subject to any deductions for damages or violations.
      </li>
      
      <li>
        <strong>Traffic Violations:</strong> The Renter is responsible for all traffic violations, parking tickets, 
        and tolls incurred during the rental period.
      </li>
      
      <li>
        <strong>Cancellation:</strong> Cancellations are subject to the platform's cancellation policy. 
        Refunds will be processed according to the timing of cancellation.
      </li>
      
      <li>
        <strong>Vehicle Condition:</strong> The Renter acknowledges receiving the vehicle in good working condition 
        and agrees to return it in the same condition, normal wear and tear excepted.
      </li>
      
      <li>
        <strong>Jurisdiction:</strong> This agreement shall be governed by the laws of the Republic of Zambia. 
        Any disputes shall be resolved in the courts of Zambia.
      </li>
    </ol>
  </div>

  <div class="highlight">
    <strong>IMPORTANT:</strong> By signing this agreement, both parties acknowledge that they have read, 
    understood, and agree to all terms and conditions stated herein. This is a legally binding contract.
  </div>

  <div class="signature-section">
    <div class="signature-box">
      <div class="signature-label">Host Signature</div>
      <div style="height: 60px;"></div>
      <div>${data.host.name}</div>
      <div class="signature-date">Date: _________________</div>
    </div>

    <div class="signature-box">
      <div class="signature-label">Renter Signature</div>
      <div style="height: 60px;"></div>
      <div>${data.renter.name}</div>
      <div class="signature-date">Date: _________________</div>
    </div>
  </div>

  <div class="footer">
    <p><strong>ZEMO Car Rental Platform</strong></p>
    <p>This agreement was generated electronically through the ZEMO platform</p>
    <p>For support, contact: support@zemo.com | +260 XXX XXXX</p>
  </div>
</body>
</html>
  `
}
