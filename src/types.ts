import * as PropTypes from 'prop-types';

import { FieldValidationError, FormValidationError } from './errors';

export const FormContextTypes = {
  form: PropTypes.any
};

export type FieldValidator<T, C = any> = (data: {
  component: C;
  field: string;
  formValue: any;
  value: T;
}) => void;
export type FormValidator<M> = (data: M) => void | Promise<void>;

export interface FormProps<M> {
  children?: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  tabIndex?: number;
  title?: string;

  error?: FormValidationError;
  initialData?: Readonly<M>;

  onCancel?(): void;
  onSubmit(data: M): void;
  onValidate?: FormValidator<M>;
}

export type FieldRender<T> = (opts: {
  error?: FieldValidationError;
  isSubmitting: boolean;
  isValidating: boolean;
  onChange: React.ChangeEventHandler<any>;
  value: T;
}) => JSX.Element | null | false;

export interface FormComponent<M> extends React.ComponentClass<FormProps<M>> {
  field<F extends keyof M>(field: F, render: FieldRender<M[F]>): JSX.Element | null | false;
}

export interface FormContext<M> {
  error?: FormValidationError;
  isSubmitting: boolean;
  isValidating: boolean;
  setFieldValidator<F extends keyof M>(field: F, validator: FieldValidator<M[F]>, component: React.Component): void;
  setValue<F extends keyof M>(field: F, value: M[F]): void;
  value: Readonly<M>;
}

export interface ExternalFieldProps<T, P> {
  field: string;
  onValidate?: FieldValidator<T, FieldComponentImpl<T, P>>;
}

export interface InternalFieldProps<T> {
  error?: FieldValidationError;
  formValue: any;
  isSubmitting: boolean;
  isValidating: boolean;
  onChange: (value: T) => void;
  value: T;
}

export type FieldComponent<T, P> = React.ComponentClass<P & ExternalFieldProps<T, P>>;
export type FieldComponentImpl<T, P> = React.ComponentClass<P & InternalFieldProps<T>>;
