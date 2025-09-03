# Legal & Compliance Guide for Nigeria

## 1. Regulatory Landscape

### Central Bank of Nigeria (CBN)
- **Current Status**: CBN has restrictions on cryptocurrency transactions
- **Key Regulation**: Circular on cryptocurrency transactions in Nigerian Banks (February 2021)
- **Impact**: Banks cannot facilitate crypto transactions directly

### Securities and Exchange Commission (SEC)
- **Recognition**: Recognizes digital assets as securities
- **Registration**: May require registration for certain operations
- **Compliance**: Must follow SEC guidelines for digital asset operations

### Economic and Financial Crimes Commission (EFCC)
- **AML Requirements**: Anti-money laundering compliance
- **Reporting**: Suspicious transaction reporting
- **KYC**: Know Your Customer requirements

## 2. Compliance Requirements

### 2.1 Know Your Customer (KYC)
```typescript
// Implement KYC data collection
interface KYCData {
  fullName: string;
  dateOfBirth: string;
  idNumber: string; // NIN, Driver's License, or Passport
  idType: 'NIN' | 'DRIVERS_LICENSE' | 'PASSPORT';
  address: string;
  phoneNumber: string;
  email: string;
  proofOfAddress?: string; // Utility bill, bank statement
  idDocument?: string; // Photo of ID
  selfie?: string; // Selfie for verification
}
```

### 2.2 Anti-Money Laundering (AML)
- **Transaction Limits**: Implement daily/monthly limits
- **Monitoring**: Flag suspicious transactions
- **Reporting**: Report to relevant authorities
- **Record Keeping**: Maintain transaction records for 5+ years

### 2.3 Customer Due Diligence (CDD)
- **Enhanced Due Diligence**: For high-value transactions
- **Risk Assessment**: Categorize customers by risk level
- **Ongoing Monitoring**: Continuous transaction monitoring

## 3. Implementation Guidelines

### 3.1 Transaction Limits
```typescript
const TRANSACTION_LIMITS = {
  BASIC_USER: {
    daily: 50000, // ₦500,000
    monthly: 500000, // ₦5,000,000
  },
  VERIFIED_USER: {
    daily: 200000, // ₦2,000,000
    monthly: 2000000, // ₦20,000,000
  },
  PREMIUM_USER: {
    daily: 1000000, // ₦10,000,000
    monthly: 10000000, // ₦100,000,000
  },
};
```

### 3.2 Risk Scoring
```typescript
interface RiskScore {
  score: number; // 0-100
  factors: {
    transactionAmount: number;
    frequency: number;
    geolocation: number;
    deviceFingerprint: number;
    accountAge: number;
  };
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}
```

### 3.3 Suspicious Activity Monitoring
- Large or unusual transactions
- Rapid succession of transactions
- Transactions to high-risk jurisdictions
- Patterns suggesting money laundering

## 4. Data Protection (NDPR Compliance)

### Nigeria Data Protection Regulation (NDPR)
- **Consent**: Explicit consent for data processing
- **Purpose Limitation**: Process data only for stated purposes
- **Data Minimization**: Collect only necessary data
- **Security**: Implement appropriate security measures
- **Rights**: Provide data subject rights (access, correction, deletion)

### Implementation
```typescript
interface ConsentRecord {
  userId: string;
  consentType: 'KYC' | 'MARKETING' | 'ANALYTICS';
  consentGiven: boolean;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}
```

## 5. Tax Implications

### Value Added Tax (VAT)
- **Rate**: 7.5% on applicable services
- **Registration**: Required if annual turnover exceeds ₦25 million
- **Remittance**: Monthly VAT returns

### Company Income Tax (CIT)
- **Rate**: 30% for large companies, 20% for small companies
- **Filing**: Annual tax returns
- **Withholding**: WHT on certain transactions

## 6. Business Registration

### Corporate Affairs Commission (CAC)
- **Business Registration**: Register as a company
- **Business Name**: Reserve and register business name
- **Directors**: Minimum of 2 directors for private companies
- **Share Capital**: Minimum authorized share capital

### Required Documents
- Memorandum and Articles of Association
- Form CAC 2 (Statement of Share Capital and Return of Allotment)
- Form CAC 4 (Statement of Share Capital)
- Form CAC 7 (Particular of Directors)

## 7. Banking Relationships

### Challenges
- Many banks reluctant to work with crypto businesses
- Need specialized fintech-friendly banks
- Consider payment processors as intermediaries

### Solutions
- Partner with payment processors (Flutterwave, Paystack)
- Use virtual account numbers
- Maintain separate accounts for different purposes

## 8. Insurance Requirements

### Professional Indemnity Insurance
- Coverage for professional negligence
- Minimum coverage based on business size

### Cyber Security Insurance
- Coverage for data breaches
- Business interruption coverage
- Fraud and theft coverage

## 9. Operational Compliance

### 9.1 Terms of Service
- Clear terms and conditions
- Risk disclosures
- Limitation of liability
- Dispute resolution procedures

### 9.2 Privacy Policy
- Data collection practices
- Data usage and sharing
- User rights under NDPR
- Contact information for data protection

### 9.3 Customer Support
- Accessible customer support
- Complaint handling procedures
- Response time commitments

## 10. Ongoing Compliance

### Regular Reviews
- Monthly compliance assessments
- Quarterly policy updates
- Annual compliance audits
- Staff training programs

### Documentation
- Policy and procedure manuals
- Training records
- Incident reports
- Regulatory correspondence

## 11. Red Flags to Monitor

### Transaction Red Flags
- Transactions just below reporting thresholds
- Round number transactions
- Transactions with no clear business purpose
- Rapid movement of funds

### Customer Red Flags
- Reluctance to provide identification
- Inconsistent information
- Unusual transaction patterns
- High-risk geographic locations

## 12. Penalties and Consequences

### Non-Compliance Penalties
- Fines up to ₦10 million or 2% of annual turnover
- Criminal prosecution for severe violations
- Business license revocation
- Reputational damage

### Best Practices
- Implement robust compliance systems
- Regular staff training
- Document all compliance activities
- Engage legal and compliance experts
- Stay updated on regulatory changes

## Disclaimer

This guide is for informational purposes only and does not constitute legal advice. Always consult with qualified legal professionals and regulatory experts before implementing any compliance measures. Laws and regulations are subject to change, and this guide may not reflect the most current requirements.