import * as PropTypes from 'prop-types';

export const FormContextTypes = {
  form: PropTypes.any
};

export interface FormProps<M> {
  onSubmit?(data: M): void;
  onValidate?(data: M): void | Promise<void>;
  onValidateChange?<K extends keyof M>(key: K, value: M[K]): void;
}

export type FieldRender<T> = (opts: {
  onChange: React.ChangeEventHandler<any>;
  value: T;
}) => JSX.Element | null | false;

export interface FormComponent<M> extends React.ComponentClass<FormProps<M>> {
  field<F extends keyof M>(field: F, render: FieldRender<M[F]>): JSX.Element | null | false;
}

export interface FormContext<M> {
  setValue<F extends keyof M>(field: F, value: M[F]): void;
  value: Readonly<M>;
}

export interface ExternalFieldProps {
  field: string;
}

export interface InternalFieldProps<T> {
  onChange: (value: T) => void;
  value: T;
}

export type FieldComponent<P> = React.ComponentClass<P & ExternalFieldProps>;
export type FieldComponentImpl<T, P> = React.ComponentClass<P & InternalFieldProps<T>>;
