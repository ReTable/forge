import { FC, HTMLProps } from 'react';

type Props = HTMLProps<HTMLDivElement>;

/**
 * This is awesome component.
 */
export const Button: FC<Props> = ({ children, ...props }: Props) => (
  <div {...props}>{children}</div>
);
