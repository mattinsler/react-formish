import * as React from 'react';
import { createForm } from '../';

import { Input } from './components/Input';
import { Password } from './components/Password';

interface Model {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface Props {
  onSubmit?(data: Model): void;
}

const Form = createForm<Model>({
  email: '',
  password: '',
  rememberMe: false
});

export class LoginForm extends React.Component<Props> {
  onSubmit = (data: Model) => {
    console.log('SUBMIT', data);
  }

  render() {
    return (
      <Form onSubmit={ this.onSubmit }>
        {Form.field('email', ({ onChange, value }) => (
          <input
            type="text"
            name="username"
            onChange={ onChange }
            value={ value }
          />
        ))}
        {Form.field('password', ({ onChange, value }) => (
          <input
            type="password"
            name="password"
            onChange={ onChange }
            value={ value }
          />
        ))}

        <Input field="email" />
        <Password field="password" />
        
        <button>Submit</button>
      </Form>
    );
  }
}
