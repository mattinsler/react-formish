export class FieldValidationError extends Error {
  public field?: string;
  public message: string;

  constructor(field: string | null, message: string) {
    super(message);

    this.field = field === null ? undefined : field;

    Object.setPrototypeOf(this, FieldValidationError.prototype);
  }
}

export type FieldValidationErrorMap = { [field: string]: FieldValidationError };

/**
 * ValidationError
 * 
 * There will either be a message or field errors.
 */
export class FormValidationError extends Error {
  public readonly fieldErrors: FieldValidationError[];
  public readonly errorByField: FieldValidationErrorMap;

  constructor(message: string, fieldErrors: FieldValidationError[] = []) {
    super(message);

    this.fieldErrors = fieldErrors;
    this.errorByField = fieldErrors.reduce((o: FieldValidationErrorMap, error) => {
      if (!error.field) {
        throw new Error('All FieldValidationErrors must have a field when passed to the ValidationError constructor');
      }
      o[error.field] = error;
      return o;
    }, {});

    Object.setPrototypeOf(this, FormValidationError.prototype);
  }
}

export function formValidationError(message: string): FormValidationError;
export function formValidationError(fieldErrors: FieldValidationError[]): FormValidationError;
export function formValidationError(arg: any): FormValidationError {
  if (typeof(arg) === 'string') {
    return new FormValidationError(arg);
  } else if (Array.isArray(arg)) {
    return new FormValidationError('', arg);
  }

  throw new Error();
}

export function fieldValidationError(message: string): FieldValidationError;
export function fieldValidationError(field: string, message?: string): FieldValidationError {
  if (!message) {
    return new FieldValidationError(null, field);
  }
  return new FieldValidationError(field, message);
}
