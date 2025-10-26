class EmailService {
  async sendOTP(email: string, otp: string): Promise<boolean> {
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      
      if (data.success) {
        return true;
      } else {
        // If email fails, log OTP for development
        console.log(`📧 OTP for ${email}: ${otp}`);
        throw new Error(data.message);
      }
    } catch (error) {
      // Fallback - log OTP for development
      console.log(`📧 OTP for ${email}: ${otp}`);
      throw new Error('Failed to send OTP. Check console for OTP code.');
    }
  }
}

export const emailService = new EmailService();