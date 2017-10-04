import * as React from 'react';

import {
  FieldRender,
  FormComponent, FormProps,
  FormContext, FormContextTypes
} from './types';

export function createForm<M>(initialData: M): FormComponent<M> {
  class Form extends React.Component<FormProps<M>, M> {
    static childContextTypes = FormContextTypes;

    static field<F extends keyof M>(field: F, render: FieldRender<M[F]>): JSX.Element | null | false {
      class Field extends React.Component {
        static contextTypes = FormContextTypes;

        context: { form: FormContext<M> };

        onChange = (e: React.ChangeEvent<any>) => {
          this.context.form.setValue(field, e.target.value);
        }

        render() {
          return render({
            onChange: this.onChange,
            value: this.context.form.value[field]
          });
        }
      }

      return React.createElement(Field);
    }

    constructor(props: FormProps<M>) {
      super(props);

      this.state = Object.assign({}, initialData);
    }

    getChildContext(): { form: FormContext<M> } {
      return {
        form: {
          setValue: <F extends keyof M>(field: F, value: M[F]): void => {
            const newValue = Object.assign({}, this.state, { [field]: value });
            this.setState(newValue);
          },
          value: this.state
        }
      };
    }

    onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const { onSubmit, onValidate } = this.props;

      onValidate && onValidate(this.state);
      onSubmit && onSubmit(this.state);
    }

    render() {
      return (
        <form onSubmit={ this.onSubmit }>
          { this.props.children }
        </form>
      );
    }
  }

  return Form;
}
