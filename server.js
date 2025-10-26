import express from 'express';
import cors from 'cors';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
// --- Supabase setup ---
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Your Microsoft 365 credentials
export const MS365_CONFIG = {
  tenantId: import.meta.env.VITE_TENANT_ID,
  clientId: import.meta.env.VITE_CLIENT_ID,
  clientSecret: import.meta.env.VITE_CLIENT_SECRET,
  senderEmail: import.meta.env.VITE_SENDER_EMAIL,
};



let accessToken = null;
let tokenExpiry = null;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'dist')));

async function getAccessToken() {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    console.log('🔄 Getting Microsoft Graph access token...');
    const tokenUrl = `https://login.microsoftonline.com/${MS365_CONFIG.tenantId}/oauth2/v2.0/token`;
    
    const params = new URLSearchParams();
    params.append('client_id', MS365_CONFIG.clientId);
    params.append('client_secret', MS365_CONFIG.clientSecret);
    params.append('scope', 'https://graph.microsoft.com/.default');
    params.append('grant_type', 'client_credentials');

    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    
    console.log('✅ Access token obtained successfully');
    return accessToken;
  } catch (error) {
    console.error('❌ Failed to get access token:', error.response?.data || error.message);
    throw new Error('Microsoft 365 authentication failed');
  }
}

// Send OTP endpoint
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }

    console.log(`📧 Sending OTP to: ${email}`);

    const accessToken = await getAccessToken();

    const emailData = {
      message: {
        subject: 'CareerCast - Verify Your Email',
        body: {
          contentType: 'HTML',
          content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb; text-align: center;">CareerCast Email Verification</h2>
              <p>Hello,</p>
              <p>Thank you for signing up for CareerCast! Use the following OTP code to verify your email address:</p>
              <div style="text-align: center; font-size: 32px; font-weight: bold; color: #2563eb; margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 8px;">
                ${otp}
              </div>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't request this verification, please ignore this email.</p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
                <p>Best regards,<br>The CareerCast Team</p>
              </div>
            </div>
          `
        },
        toRecipients: [
          {
            emailAddress: {
              address: email
            }
          }
        ],
        from: {
          emailAddress: {
            address: MS365_CONFIG.senderEmail
          }
        }
      },
      saveToSentItems: true
    };

    await axios.post(
      `https://graph.microsoft.com/v1.0/users/${MS365_CONFIG.senderEmail}/sendMail`,
      emailData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

   console.log('✅ OTP email sent successfully');

// 🧩 Insert or update user profile in Supabase
try {
  const { data: existing } = await supabase
    .from('profiles')
    .select('email')
    .eq('email', email)
    .maybeSingle();

  if (!existing) {
    await supabase.from('profiles').insert([
      {
        email,
        full_name: email.split('@')[0],
        first_name: '',
        last_name: '',
        status: 'otp_sent',
        created_at: new Date().toISOString(),
      },
    ]);
    console.log(`🟢 New profile created in Supabase for ${email}`);
  } else {
    await supabase
      .from('profiles')
      .update({
        status: 'otp_sent',
        updated_at: new Date().toISOString(),
      })
      .eq('email', email);
    console.log(`🟡 Existing profile updated for ${email}`);
  }
} catch (supabaseError) {
  console.error('❌ Supabase upsert failed:', supabaseError.message);
}

// Finally respond
res.json({
  success: true,
  message: 'OTP sent successfully to your email',
});

  } catch (error) {
    console.error('❌ Error sending OTP:', error.response?.data || error.message);
    
    // Development fallback - log OTP
    console.log(`🔧 OTP for ${req.body.email}: ${req.body.otp}`);
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP email. Check console for OTP.',
      developmentOtp: req.body.otp
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'CareerCast Email Service',
    timestamp: new Date().toISOString()
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 CareerCast Server running on port ${PORT}`);
  console.log(`📧 Email service ready`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});