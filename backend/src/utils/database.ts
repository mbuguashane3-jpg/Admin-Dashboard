import { PostgrestError } from '@supabase/supabase-js';

export interface DatabaseErrorType extends Error {
  code?: string;
  details?: any;
  hint?: string;
}

export class DatabaseError extends Error implements DatabaseErrorType {
  public readonly code?: string;
  public readonly details?: any;
  public readonly hint?: string;

  constructor(message: string, code?: string, details?: any) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.details = details;
  }
}

export class DatabaseOperationError extends DatabaseError {
  public readonly operation: string;
  public readonly table: string;
  public readonly originalError?: PostgrestError;

  constructor(operation: string, table: string, message: string, originalError?: PostgrestError) {
    super(message, 'OPERATION_ERROR', originalError);
    this.name = 'DatabaseOperationError';
    this.operation = operation;
    this.table = table;
    this.originalError = originalError;
  }
}

export function handleDatabaseError(error: any, operation: string, table: string): DatabaseError {
  if (error?.code) {
    // Handle specific PostgreSQL errors
    switch (error.code) {
      case '23505': // unique_violation
        return new DatabaseError(`Duplicate entry in ${table} during ${operation}`, 'DUPLICATE_ENTRY', error);
      case '23503': // foreign_key_violation
        return new DatabaseError(`Foreign key constraint violation in ${table} during ${operation}`, 'FOREIGN_KEY_VIOLATION', error);
      case '23502': // not_null_violation
        return new DatabaseError(`Required field missing in ${table} during ${operation}`, 'REQUIRED_FIELD_MISSING', error);
      case '42501': // insufficient_privilege
        return new DatabaseError(`Insufficient privileges for ${operation} on ${table}`, 'INSUFFICIENT_PRIVILEGES', error);
      case 'PGRST116': // not found
        return new DatabaseError(`Record not found in ${table} during ${operation}`, 'NOT_FOUND', error);
      default:
        return new DatabaseError(`Database error during ${operation} on ${table}: ${error.message}`, 'DATABASE_ERROR', error);
    }
  }

  if (error?.message?.includes('JWT')) {
    return new DatabaseError('Authentication token is invalid or expired', 'JWT_ERROR', error);
  }

  if (error?.message?.includes('RLS')) {
    return new DatabaseError(`Row Level Security policy violation during ${operation} on ${table}`, 'RLS_VIOLATION', error);
  }

  // Generic error
  return new DatabaseError(
    error?.message || `Unknown error during ${operation} on ${table}`,
    'UNKNOWN_ERROR',
    error
  );
}

export async function safeDatabaseOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  tableName: string
): Promise<{ data?: T; error?: DatabaseOperationError }> {
  try {
    const result = await operation();
    return { data: result };
  } catch (error: any) {
    const dbError = handleDatabaseError(error, operationName, tableName);
    console.error(`Database operation failed: ${operationName} on ${tableName}`, {
      error: dbError.message,
      code: dbError.code,
      originalError: error
    });
    return { error: new DatabaseOperationError(operationName, tableName, dbError.message, error) };
  }
}

export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message: message || 'Operation completed successfully'
  };
}

export function createErrorResponse(error: DatabaseOperationError) {
  return {
    success: false,
    error: {
      message: error.message,
      code: error.code,
      operation: error.operation,
      table: error.table
    }
  };
}

// Helper function to log database operations for debugging
export function logDatabaseOperation(operation: string, table: string, details?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DB] ${operation} on ${table}`, details || '');
  }
}
