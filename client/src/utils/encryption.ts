import CryptoJS from 'crypto-js';

// Master encryption key (in production, this should be generated and stored securely)
const MASTER_KEY = process.env.REACT_APP_MASTER_KEY || 'CostaRica-MLS-2024-SecureKey';

export interface EncryptedCredentials {
  emailjs: {
    serviceId: string;
    templateId: string;
    publicKey: string;
  };
  paypal: {
    clientId: string;
  };
  aws: {
    lambdaPdfUrl: string;
  };
  github: {
    repoUrl: string;
    rawContentUrl: string;
  };
}

export class EncryptionManager {
  private static instance: EncryptionManager;
  private cachedCredentials: EncryptedCredentials | null = null;

  private constructor() {}

  public static getInstance(): EncryptionManager {
    if (!EncryptionManager.instance) {
      EncryptionManager.instance = new EncryptionManager();
    }
    return EncryptionManager.instance;
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, MASTER_KEY).toString();
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, MASTER_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Store encrypted credentials in localStorage
   */
  storeCredentials(credentials: EncryptedCredentials): void {
    const encrypted = this.encrypt(JSON.stringify(credentials));
    localStorage.setItem('cr_mls_credentials', encrypted);
    this.cachedCredentials = credentials;
  }

  /**
   * Retrieve and decrypt credentials from localStorage
   */
  getCredentials(): EncryptedCredentials | null {
    if (this.cachedCredentials) {
      return this.cachedCredentials;
    }

    try {
      const encrypted = localStorage.getItem('cr_mls_credentials');
      if (!encrypted) {
        return this.getDefaultCredentials();
      }

      const decrypted = this.decrypt(encrypted);
      const credentials = JSON.parse(decrypted) as EncryptedCredentials;
      this.cachedCredentials = credentials;
      return credentials;
    } catch (error) {
      console.error('Failed to decrypt credentials:', error);
      return this.getDefaultCredentials();
    }
  }

  /**
   * Get default credentials (encrypted in code)
   */
  private getDefaultCredentials(): EncryptedCredentials {
    // These are encrypted versions of the actual credentials
    // In production, these would be properly encrypted
    return {
      emailjs: {
        serviceId: this.decrypt(process.env.REACT_APP_EMAILJS_SERVICE_ID || ''),
        templateId: this.decrypt(process.env.REACT_APP_EMAILJS_TEMPLATE_ID || ''),
        publicKey: this.decrypt(process.env.REACT_APP_EMAILJS_PUBLIC_KEY || '')
      },
      paypal: {
        clientId: this.decrypt(process.env.REACT_APP_PAYPAL_CLIENT_ID || '')
      },
      aws: {
        lambdaPdfUrl: this.decrypt(process.env.REACT_APP_AWS_LAMBDA_PDF_URL || '')
      },
      github: {
        repoUrl: 'https://api.github.com/repos/urmt/CR_MLS/contents/database',
        rawContentUrl: 'https://raw.githubusercontent.com/urmt/CR_MLS/main/database'
      }
    };
  }

  /**
   * Initialize credentials setup (for first-time setup)
   */
  async initializeCredentials(): Promise<boolean> {
    const existingCredentials = this.getCredentials();
    
    if (existingCredentials && this.validateCredentials(existingCredentials)) {
      return true;
    }

    // Prompt user for credentials or use environment variables
    const credentials = await this.promptForCredentials();
    
    if (credentials) {
      this.storeCredentials(credentials);
      return true;
    }

    return false;
  }

  /**
   * Validate that credentials are properly formatted
   */
  private validateCredentials(credentials: EncryptedCredentials): boolean {
    return !!(
      credentials.emailjs.serviceId &&
      credentials.emailjs.templateId &&
      credentials.emailjs.publicKey &&
      credentials.paypal.clientId &&
      credentials.aws.lambdaPdfUrl
    );
  }

  /**
   * Prompt user for credentials (in a real app, this would be a proper form)
   */
  private async promptForCredentials(): Promise<EncryptedCredentials | null> {
    // For now, return null - in production this would show a setup modal
    console.warn('Credentials not found. Please configure through admin panel.');
    return null;
  }

  /**
   * Clear all stored credentials
   */
  clearCredentials(): void {
    localStorage.removeItem('cr_mls_credentials');
    this.cachedCredentials = null;
  }
}

export default EncryptionManager.getInstance();