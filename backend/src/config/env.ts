import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  RESEND_API_KEY?: string;
  ALERT_EMAIL?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

export function validateEnv(): EnvConfig {
  const requiredVars = ['PORT'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  const config: EnvConfig = {
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    ALERT_EMAIL: process.env.ALERT_EMAIL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
  };

  // Validate optional but important variables
  if (config.NODE_ENV === 'production') {
    const productionRequired = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    const missingProduction = productionRequired.filter(varName => !process.env[varName]);
    
    if (missingProduction.length > 0) {
      console.warn(`Warning: Missing production environment variables: ${missingProduction.join(', ')}`);
    }
  }

  console.log(`Environment: ${config.NODE_ENV}`);
  console.log(`Server will run on port: ${config.PORT}`);

  return config;
}

export const env = validateEnv();
