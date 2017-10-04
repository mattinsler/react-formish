import * as React from 'react';
import { ExternalFieldProps } from '../../';

import { Input, Props } from './Input';

export function Password(props: Props & ExternalFieldProps) {
  return <Input { ...props } type="password" />;
}
