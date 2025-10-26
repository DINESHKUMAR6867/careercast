interface OTPData {
  email: string;
  otp: string;
  expiresAt: number;
  verified: boolean;
}

class OTPService {
  private otpStorage: Map<string, OTPData> = new Map();

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  storeOTP(email: string, otp: string): void {
    const expiresAt = Date.now() + 10 * 60 * 1000;
    this.otpStorage.set(email, {
      email,
      otp,
      expiresAt,
      verified: false
    });

    setTimeout(() => {
      this.otpStorage.delete(email);
    }, 10 * 60 * 1000);
  }

  verifyOTP(email: string, otp: string): boolean {
    const storedOTP = this.otpStorage.get(email);
    
    if (!storedOTP) {
      return false;
    }

    if (Date.now() > storedOTP.expiresAt) {
      this.otpStorage.delete(email);
      return false;
    }

    if (storedOTP.otp === otp) {
      storedOTP.verified = true;
      return true;
    }

    return false;
  }

  isOTPVerified(email: string): boolean {
    const storedOTP = this.otpStorage.get(email);
    return storedOTP?.verified || false;
  }

  removeOTP(email: string): void {
    this.otpStorage.delete(email);
  }
}

export const otpService = new OTPService();