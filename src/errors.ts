export class FieldValidationError extends Error {
  public field?: string;
  public message: string;

  constructor(field: string | null, message: string) {
    super(message);

    this.field = field === null ? undefined : field;

    Object.setPrototypeOf(this, FieldValidationError.prototype);
  }
}

export class ValidationError extends Error {
  public message: string;
  public fieldErrors: FieldValidationError[];

  constructor(message: string, fieldErrors: FieldValidationError[] = []) {
    super(message);

    this.fieldErrors = fieldErrors;

    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export function validationError(message: string): ValidationError {
  return new ValidationError(message);
}

export function fieldValidationError(message: string): FieldValidationError;
export function fieldValidationError(field: string, message?: string): FieldValidationError {
  if (!message) {
    return new FieldValidationError(null, field);
  }
  return new FieldValidationError(field, message);
}
