import { Component, MouseEventHandler, PropsWithChildren } from 'react';

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
export class Button extends Component<Props> {
  public static readonly displayName = 'UiKit(Button)';

  public override render() {
    const { children, onClick, prefix } = this.props;

    return (
      <button onClick={onClick} type="button">
        {prefix} {children}
      </button>
    );
  }
}
