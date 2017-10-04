import * as React from 'react';
import { createField, InternalFieldProps } from '../../';

export interface Props {
  className?: string;
  label?: string;
  type?: string;
}

export const Input = createField<string, Props>(
  class extends React.Component<Props & InternalFieldProps<string>> {
    static defaultProps = {
      type: 'text',
      value: ''
    };

    onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      this.props.onChange(e.target.value);
    }

    render() {
      const { className, label, type, value } = this.props;

      return (
        <div className={ `form-field ${className}` }>
          { label && <label>{ label }</label> }
          <input
            type={ type }
            onChange={ this.onChange }
            value={ value }
          />
        </div>
      );
    }
  }
);
