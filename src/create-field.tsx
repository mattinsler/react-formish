import * as React from 'react';

import {
  ExternalFieldProps, InternalFieldProps,
  FieldComponent, FieldComponentImpl,
  FormContext, FormContextTypes
} from './types';

export function createField<T, P = {}>(Component: FieldComponentImpl<T, P>): FieldComponent<P> {
  type FieldProps = P & ExternalFieldProps & InternalFieldProps<T>;

  class FormField extends React.Component<FieldProps> {
    static displayName = `FormField(${Component.displayName || Component.name})`;
    static WrappedComponent = Component;

    static contextTypes = FormContextTypes;

    context: { form: FormContext<any> };

    onChange = (value: T) => {
      this.context.form.setValue(this.props.field, value);
    }

    render() {
      const field = this.props.field;

      const props = Object.assign({}, this.props, {
        isSubmitting: this.context.form.isSubmitting,
        isValidating: this.context.form.isValidating,
        onChange: this.onChange,
        value: this.context.form.value[field]
      });

      delete (props as any).field;

      return <Component { ...props } />;
    }
  }

  return FormField;
}
