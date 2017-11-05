import * as React from 'react';

import {
  FieldValidationError,
  fieldValidationError,
  FormValidationError,
  formValidationError
} from './errors';
import {
  InternalFieldProps,
  FieldRender, FieldValidator,
  FormComponent, FormProps,
  FormContext, FormContextTypes
} from './types';

type FieldValidatorMap<M> = {
  [F in keyof M]?: {
    component: React.Component;
    validator: FieldValidator<M[F]>;
  };
}

interface FormState<M> {
  error?: FormValidationError;
  isSubmitting: boolean;
  isValidating: boolean;
  value: M;
}

const localState = {
  cancel: false,
  submit: false
};

import { createField } from './create-field';

export function createForm<M>(
  initialData: M,
  opts?: {
    render?: (props: React.HTMLAttributes<HTMLFormElement>) => JSX.Element | null | false;
  }
): FormComponent<M> {
  class Form extends React.Component<FormProps<M>, FormState<M>> {
    static childContextTypes = FormContextTypes;

    static field<F extends keyof M>(
      field: F,
      render: FieldRender<M[F]>,
      onValidate?: FieldValidator<M[F]>
    ): JSX.Element | null | false {
      const Field = createField<any>(
        class extends React.Component<InternalFieldProps<any>> {
          onChange = (e: React.ChangeEvent<any>) => {
            this.props.onChange(e.target.value);
          }
      
          render() {
            const props = Object.assign({}, this.props, { onChange: this.onChange });
            return render(props);
          }
        }
      );

      return <Field field={ field } onValidate={ onValidate } />;
    }

    private fieldValidators: FieldValidatorMap<M> = {};

    constructor(props: FormProps<M>) {
      super(props);

      this.state = {
        error: undefined,
        isSubmitting: false,
        isValidating: false,
        value: Object.assign({}, props.initialData || initialData)
      };
    }

    getChildContext(): { form: FormContext<M> } {
      return {
        form: {
          error: this.state.error,
          isSubmitting: this.state.isSubmitting,
          isValidating: this.state.isValidating,
          setFieldValidator: <F extends keyof M>(field: F, validator: FieldValidator<M[F]>, component: React.Component): void => {
            this.fieldValidators[field] = { component, validator };
          },
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

      if (this.state.isSubmitting) { return; }

      const {
        props: { onCancel, onSubmit, onValidate },
        state
      } = this;
      const validateFields = Object.keys(this.fieldValidators).length > 0;

      this.setState({ error: undefined, isSubmitting: true });

      if (localState.cancel && !localState.submit) {
        this.setState({ isSubmitting: false });
        onCancel && onCancel();
        return;
      }

      if (validateFields || onValidate) {
        this.setState({ isValidating: true });

        if (validateFields) {
          const errors = [];

          for (const [field, { component, validator }] of Object.entries(this.fieldValidators)) {
            try {
              validator({
                component: component.wrappedComponent,
                field,
                formValue: state.value,
                value: (state.value as any)[field]
              });
            } catch (err) {
              const error = err instanceof FieldValidationError ? err : fieldValidationError(err.message);
              error.field = field;
              errors.push(error);
            }
          }

          if (errors.length > 0) {
            this.setState({
              error: formValidationError(errors),
              isSubmitting: false,
              isValidating: false
            });
            return;
          }
        }

        if (onValidate) {
          try {
            await Promise.resolve(onValidate(state.value));
          } catch (err) {
            this.setState({
              error: err instanceof FormValidationError ? err : formValidationError(err.message),
              isSubmitting: false,
              isValidating: false
            });
          }
        }

        this.setState({ isValidating: false });
      }

      try {
        await Promise.resolve(onSubmit(state.value));
      } catch (err) {
        this.setState({
          error: err,
          isSubmitting: false
        });
        return;
      }
      
      this.setState({ isSubmitting: false });
    }

    render() {
      const { error, isSubmitting, isValidating } = this.state;
      const props: React.HTMLAttributes<HTMLFormElement> = Object.assign({}, this.props, {
        error, isSubmitting, isValidating
      });

      delete (props as any).initialData;
      delete (props as any).onValidate;
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
