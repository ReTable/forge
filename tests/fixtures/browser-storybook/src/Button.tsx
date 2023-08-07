import { FC, MouseEventHandler, PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
  /**
   * This is click handler.
   */
  onClick: MouseEventHandler;
  prefix?: string;
}>;

/**
 * This is awesome component.
 */
export const Button: FC<Props> = ({ children, onClick, prefix }: Props) => (
  <button onClick={onClick} type="button">
    {prefix} {children}
  </button>
);
