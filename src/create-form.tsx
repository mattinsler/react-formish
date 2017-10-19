import * as React from 'react';

import {
  FieldRender,
  FormComponent, FormProps,
  FormContext, FormContextTypes
} from './types';

interface FormState<M> {
  isSubmitting: boolean;
  isValidating: boolean;
  value: M;
}

const localState = {
  cancel: false,
  submit: false
};

export function createForm<M>(
  initialData: M,
  opts?: {
    render?: (props: React.HTMLAttributes<HTMLFormElement>) => JSX.Element | null | false;
  }
): FormComponent<M> {
  class Form extends React.Component<FormProps<M>, FormState<M>> {
    static childContextTypes = FormContextTypes;

    static field<F extends keyof M>(field: F, render: FieldRender<M[F]>): JSX.Element | null | false {
      class Field extends React.Component {
        static contextTypes = FormContextTypes;

        context: { form: FormContext<M> };

        onChange = (e: React.ChangeEvent<any>) => {
          this.context.form.setValue(field, e.target.value);
        }

        render() {
          const props = Object.assign({}, this.props, {
            isSubmitting: this.context.form.isSubmitting,
            isValidating: this.context.form.isValidating,
            onChange: this.onChange,
            value: this.context.form.value[field]
          });

          return render(props);
        }
      }

      return React.createElement(Field);
    }

    constructor(props: FormProps<M>) {
      super(props);

      this.state = {
        isSubmitting: false,
        isValidating: false,
        value: Object.assign({}, props.initialData || initialData)
      };
    }

    getChildContext(): { form: FormContext<M> } {
      return {
        form: {
          isSubmitting: this.state.isSubmitting,
          isValidating: this.state.isValidating,
          setValue: <F extends keyof M>(field: F, value: M[F]): void => {
            const newValue = Object.assign({}, this.state.value, { [field]: value });
            this.setState({ value: newValue });
          },
          value: this.state.value
        }
      };
    }

    static cancel = () => {
      localState.cancel = true;
      setTimeout(() => localState.cancel = false);
    };
    static submit = () => {
      localState.submit = true;
      setTimeout(() => localState.submit = false);
    }

    onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const {
        props: { onCancel, onSubmit, onValidate },
        state
      } = this;

      if (localState.cancel && !localState.submit) {
        return onCancel && onCancel();
      }

      if (onValidate) {
        this.setState({ isValidating: true });
        await Promise.resolve(onValidate(state.value));
        this.setState({ isValidating: false });
      }

      if (onSubmit) {
        this.setState({ isSubmitting: true });
        await Promise.resolve(onSubmit(state.value));
        this.setState({ isSubmitting: false });
      }
    }

    render() {
      const props: React.HTMLAttributes<HTMLFormElement> = Object.assign({}, this.props);

      delete (props as any).initialData;
      delete (props as any).onValidate;
      delete (props as any).onValidateField;
      props.onSubmit = this.onSubmit;
      props.onKeyPress = (e) => {
        if (e.which === 13) {
          Form.submit();
        }
      }

      if (opts && typeof(opts.render) === 'function') {
        return opts.render(props);
      }

      const children = props.children;
      delete props.children;

      return (
        <form { ...props }>
          { children }
        </form>
      );
    }
  }

  return Form;
}
