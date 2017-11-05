import * as React from 'react';

import { FormValidationError } from './errors';
import {
  ExternalFieldProps, InternalFieldProps,
  FieldComponent, FieldComponentImpl,
  FormContext, FormContextTypes
} from './types';

export function createField<T, P = {}>(Component: FieldComponentImpl<T, P>): FieldComponent<T, P> {
  type FieldProps = P & ExternalFieldProps<T, P> & InternalFieldProps<T>;

  class FormField extends React.Component<FieldProps> {
    static displayName = `FormField(${Component.displayName || Component.name})`;
    static WrappedComponent = Component;

    static contextTypes = FormContextTypes;

    wrappedComponent: FieldComponentImpl<T, P>;
    context: { form: FormContext<any> };

    constructor(props: FieldProps, context: { form: FormContext<any>; }) {
      super(props, context);

      if (props.onValidate) {
        context.form.setFieldValidator(props.field, props.onValidate, this);
      }
    }

    onChange = (value: T) => {
      this.context.form.setValue(this.props.field, value);
    }

    render() {
      const { field, onValidate } = this.props;

      const props = Object.assign({}, this.props);

      delete (props as any).field;
      delete (props as any).onValidate;

      const { error, isSubmitting, isValidating, value } = this.context.form;

      Object.assign(props, {
        error: error instanceof FormValidationError ? error.errorByField[field] : undefined,
        formValue: value,
        isSubmitting,
        isValidating,
        onChange: this.onChange,
        value: value[field]
      });

      return <Component { ...props } ref={ component => this.wrappedComponent = component as any } />;
    }
  }

  return FormField;
}
