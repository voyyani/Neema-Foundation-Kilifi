export interface AuthErrorInfo {
  title: string;
  message: string;
  action: string;
  code?: string;
}

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: {
    title: 'Invalid Credentials',
    message: 'The email or password you entered is incorrect.',
    action: 'Please try again or reset your password.',
    code: 'invalid_credentials',
  },
  INVALID_LOGIN_CREDENTIALS: {
    title: 'Invalid Login',
    message: 'The email or password you entered is incorrect.',
    action: 'Please check your credentials and try again.',
    code: 'invalid_login_credentials',
  },
  NETWORK_ERROR: {
    title: 'Connection Problem',
    message: 'Unable to connect to authentication server.',
    action: 'Check your internet connection and try again.',
    code: 'network_error',
  },
  RATE_LIMIT: {
    title: 'Too Many Attempts',
    message: 'Too many failed login attempts detected.',
    action: 'Please wait 15 minutes and try again.',
    code: 'rate_limit',
  },
  SESSION_EXPIRED: {
    title: 'Session Expired',
    message: 'Your session has expired for security reasons.',
    action: 'Please log in again to continue.',
    code: 'session_expired',
  },
  PROFILE_ERROR: {
    title: 'Profile Load Failed',
    message: 'Could not load your user profile.',
    action: 'Try refreshing the page or contact support.',
    code: 'profile_error',
  },
  EMAIL_NOT_CONFIRMED: {
    title: 'Email Not Verified',
    message: 'Please verify your email before logging in.',
    action: 'Check your inbox for a verification email.',
    code: 'email_not_confirmed',
  },
  USER_NOT_FOUND: {
    title: 'Account Not Found',
    message: 'No account exists with this email address.',
    action: 'Please check your email or create an account.',
    code: 'user_not_found',
  },
  WEAK_PASSWORD: {
    title: 'Weak Password',
    message: 'Your password does not meet security requirements.',
    action: 'Use at least 8 characters with letters and numbers.',
    code: 'weak_password',
  },
  EMAIL_ALREADY_IN_USE: {
    title: 'Email Already Registered',
    message: 'An account with this email already exists.',
    action: 'Try logging in or use password reset.',
    code: 'email_already_in_use',
  },
  GENERIC_ERROR: {
    title: 'Authentication Error',
    message: 'Something went wrong during authentication.',
    action: 'Please try again or contact support if the problem persists.',
    code: 'generic_error',
  },
} as const;

/**
 * Formats Supabase auth errors into user-friendly messages
 */
export function formatAuthError(error: any): AuthErrorInfo {
  // Handle null/undefined
  if (!error) {
    return AUTH_ERRORS.GENERIC_ERROR;
  }

  // Extract error code and message
  const code = error.code || error.error_code || error.name;
  const message = error.message || error.msg || error.error_description || '';

  // Log for debugging
  console.error('[Auth Error]', { code, message, error });

  // Match specific error codes
  if (code === 'invalid_grant' || message.includes('Invalid login credentials')) {
    return AUTH_ERRORS.INVALID_LOGIN_CREDENTIALS;
  }

  if (code === 'invalid_credentials' || message.includes('Invalid credentials')) {
    return AUTH_ERRORS.INVALID_CREDENTIALS;
  }

  if (code === 'email_not_confirmed' || message.includes('Email not confirmed')) {
    return AUTH_ERRORS.EMAIL_NOT_CONFIRMED;
  }

  if (code === 'user_not_found' || message.includes('User not found')) {
    return AUTH_ERRORS.USER_NOT_FOUND;
  }

  if (code === 'weak_password' || message.includes('Password should be')) {
    return AUTH_ERRORS.WEAK_PASSWORD;
  }

  if (code === 'email_exists' || message.includes('already registered')) {
    return AUTH_ERRORS.EMAIL_ALREADY_IN_USE;
  }

  if (code === 'over_request_rate_limit' || code === 'rate_limit') {
    return AUTH_ERRORS.RATE_LIMIT;
  }

  if (message.includes('network') || message.includes('fetch')) {
    return AUTH_ERRORS.NETWORK_ERROR;
  }

  if (message.includes('expired') || message.includes('session')) {
    return AUTH_ERRORS.SESSION_EXPIRED;
  }

  // Return generic error with actual message
  return {
    title: 'Authentication Error',
    message: message || 'An unexpected error occurred.',
    action: 'Please try again or contact support if the problem persists.',
    code: code || 'unknown',
  };
}

/**
 * Check if error is a network/connectivity issue
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;
  
  const message = (error.message || '').toLowerCase();
  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ETIMEDOUT'
  );
}

/**
 * Check if error requires re-authentication
 */
export function requiresReauth(error: any): boolean {
  if (!error) return false;
  
  const code = error.code || error.error_code;
  const message = (error.message || '').toLowerCase();
  
  return (
    code === 'session_expired' ||
    code === 'invalid_token' ||
    code === 'token_expired' ||
    message.includes('expired') ||
    message.includes('invalid token')
  );
}
