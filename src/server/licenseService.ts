/**
 * On-Premise Offline Cryptographic License Management Service
 * 
 * Supports air-gapped local server deployments without requiring continuous internet access.
 * Cryptographically verifies signature, expiration date, max employee seats, and enabled SAP modules.
 */

import crypto from 'crypto';

export interface LicensePayload {
  customerId: string;
  companyName: string;
  expiryDate: string; // YYYY-MM-DD
  maxEmployees: number;
  modules: string[];
  issuedAt: string;
  hardwareFingerprint?: string;
}

export interface LicenseVerificationResult {
  valid: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'SEATS_EXCEEDED' | 'TAMPERED' | 'MISSING';
  error?: string;
  payload?: LicensePayload;
  daysRemaining?: number;
  maxEmployees?: number;
  currentEmployees?: number;
}

const DEFAULT_SECRET = process.env.LICENSE_HMAC_SECRET || 'ezwaty-enterprise-airgap-license-secret-2026';

/**
 * Generate a cryptographically signed license key
 * Format: <BASE64_PAYLOAD>.<HEX_SIGNATURE>
 */
export function generateLicenseKey(payload: LicensePayload, secret = DEFAULT_SECRET): string {
  const jsonString = JSON.stringify(payload);
  const base64Payload = Buffer.from(jsonString, 'utf-8').toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(base64Payload)
    .digest('hex');

  return `${base64Payload}.${signature}`;
}

/**
 * Verifies the license key integrity and business invariants
 */
export function verifyLicenseKey(
  licenseKey: string | undefined,
  currentEmployeeCount = 0,
  secret = DEFAULT_SECRET
): LicenseVerificationResult {
  if (!licenseKey || typeof licenseKey !== 'string' || !licenseKey.includes('.')) {
    return {
      valid: false,
      status: 'MISSING',
      error: 'On-premise license key is missing or improperly formatted.',
    };
  }

  const [base64Payload, signature] = licenseKey.split('.');

  // 1. Verify Cryptographic Signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(base64Payload)
    .digest('hex');

  const signatureBuffer = Buffer.from(signature, 'utf-8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');

  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return {
      valid: false,
      status: 'TAMPERED',
      error: 'License verification failed: Digital signature is invalid or license has been altered.',
    };
  }

  // 2. Decode Payload
  let payload: LicensePayload;
  try {
    const jsonString = Buffer.from(base64Payload, 'base64url').toString('utf-8');
    payload = JSON.parse(jsonString);
  } catch (err) {
    return {
      valid: false,
      status: 'TAMPERED',
      error: 'Malformed license payload.',
    };
  }

  // 3. Verify Expiry Date
  const expiryDate = new Date(payload.expiryDate);
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    return {
      valid: false,
      status: 'EXPIRED',
      error: `License has expired on ${payload.expiryDate}. Please contact Ezwaty sales to renew your on-premise subscription.`,
      payload,
      daysRemaining: 0,
      maxEmployees: payload.maxEmployees,
      currentEmployees: currentEmployeeCount,
    };
  }

  // 4. Verify Seat / Employee Count Limit
  if (currentEmployeeCount > payload.maxEmployees) {
    return {
      valid: false,
      status: 'SEATS_EXCEEDED',
      error: `Licensed seat quota exceeded: System currently contains ${currentEmployeeCount} employees, but license limit is ${payload.maxEmployees}.`,
      payload,
      daysRemaining,
      maxEmployees: payload.maxEmployees,
      currentEmployees: currentEmployeeCount,
    };
  }

  return {
    valid: true,
    status: 'ACTIVE',
    payload,
    daysRemaining,
    maxEmployees: payload.maxEmployees,
    currentEmployees: currentEmployeeCount,
  };
}

// Pre-generated default demo on-premise license valid until 2028-12-31 for 500 seats
export const DEFAULT_ON_PREMISE_DEMO_LICENSE: string = generateLicenseKey({
  customerId: 'CLIENT-ONPREM-2026',
  companyName: 'Ezwaty Local Enterprise',
  expiryDate: '2028-12-31',
  maxEmployees: 500,
  modules: ['HR_CORE', 'SAP_FICO', 'JSONB_DYNAMIC', 'LEAVE_MANAGEMENT'],
  issuedAt: '2026-01-01T00:00:00Z',
});
