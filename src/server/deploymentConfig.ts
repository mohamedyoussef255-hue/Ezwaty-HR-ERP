/**
 * Hybrid Deployment Configuration Manager
 * Manages CLOUD (Multi-Tenant SaaS) vs ON_PREMISE (Single-Tenant Local Server) modes.
 */

import { DEFAULT_ON_PREMISE_DEMO_LICENSE, verifyLicenseKey, LicenseVerificationResult } from './licenseService';

export type DeploymentMode = 'CLOUD' | 'ON_PREMISE';

export interface SystemDeploymentState {
  mode: DeploymentMode;
  localTenantId: string;
  localTenantName: string;
  licenseKey: string;
  licenseStatus: LicenseVerificationResult;
  features: {
    multiTenantSwitcher: boolean;
    licenseManagement: boolean;
    cloudBilling: boolean;
    localServerBackup: boolean;
    sapGatewayLocalTunnel: boolean;
  };
}

class DeploymentManager {
  private mode: DeploymentMode;
  private localTenantId: string;
  private localTenantName: string;
  private licenseKey: string;

  constructor() {
    this.mode = (process.env.DEPLOYMENT_MODE as DeploymentMode) || 'CLOUD';
    this.localTenantId = process.env.LOCAL_TENANT_ID || 'local-premise-org';
    this.localTenantName = process.env.LOCAL_TENANT_NAME || 'Ezwaty Local Enterprise';
    this.licenseKey = process.env.ON_PREMISE_LICENSE_KEY || DEFAULT_ON_PREMISE_DEMO_LICENSE;
  }

  public getMode(): DeploymentMode {
    return this.mode;
  }

  public setMode(newMode: DeploymentMode): void {
    this.mode = newMode;
  }

  public getLocalTenantId(): string {
    return this.localTenantId;
  }

  public getLicenseKey(): string {
    return this.licenseKey;
  }

  public setLicenseKey(key: string): void {
    this.licenseKey = key;
  }

  public getSystemState(currentEmployeeCount = 0): SystemDeploymentState {
    const licenseStatus = verifyLicenseKey(this.licenseKey, currentEmployeeCount);

    return {
      mode: this.mode,
      localTenantId: this.localTenantId,
      localTenantName: this.localTenantName,
      licenseKey: this.licenseKey,
      licenseStatus,
      features: {
        multiTenantSwitcher: this.mode === 'CLOUD',
        cloudBilling: this.mode === 'CLOUD',
        licenseManagement: this.mode === 'ON_PREMISE',
        localServerBackup: this.mode === 'ON_PREMISE',
        sapGatewayLocalTunnel: this.mode === 'ON_PREMISE',
      },
    };
  }
}

export const deploymentManager = new DeploymentManager();
