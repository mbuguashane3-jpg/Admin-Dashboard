import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin as supabase } from '../supabase.js';

// Extends Express Request to include user info
export interface AuthRequest extends Request {
  user?: any;
  role?: string;
}

export async function verifyUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void | Response> {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log('No auth header found');
    return res.status(401).json({ success: false, message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('No token found in auth header');
    return res.status(401).json({ success: false, message: 'Bearer token missing' });
  }

  try {
    // 1. Verify token with Supabase
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth verification failed:', userError?.message);
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    // 2. Fetch role from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.warn(`Profile not found for user ${user.id}, assuming 'analyst'`);
      req.role = 'analyst';
    } else {
      req.role = profile.role;
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Security Gate Error:', err);
    res.status(500).json({ success: false, message: 'Internal Security Error' });
  }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction): void | Response {
  if (req.role !== 'admin') {
    console.warn(`Unauthorized access attempt by ${req.user?.email} (Role: ${req.role})`);
    return res.status(403).json({ success: false, message: 'Access Denied: Admin Privileges Required' });
  }
  next();
}
