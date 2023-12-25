import * as t from '@babel/types';

import { SVGRDisplayNameFn } from '../../types';

type Options = {
  memo: boolean;
  transformDisplayName?: SVGRDisplayNameFn;
};

export function buildDisplayName(
  name: string,
  { memo, transformDisplayName }: Options,
): t.ExpressionStatement | t.IfStatement | null {
  if (transformDisplayName == null) {
    return null;
  }

  const displayNameConfig = transformDisplayName(name);

  const [displayName, isDebugOnly] =
    typeof displayNameConfig === 'string'
      ? [displayNameConfig, false]
      : [displayNameConfig.displayName, displayNameConfig.isDebugOnly ?? false];

  const assignment = t.expressionStatement(
    t.assignmentExpression(
      '=',
      t.memberExpression(t.identifier(memo ? 'Memo' : name), t.identifier('displayName')),
      t.stringLiteral(displayName),
    ),
  );

  if (!isDebugOnly) {
    return assignment;
  }

  const flag = t.memberExpression(
    t.memberExpression(
      t.metaProperty(t.identifier('import'), t.identifier('meta')),
      t.identifier('env'),
    ),
    t.identifier('DEV'),
  );

  return t.ifStatement(flag, t.blockStatement([assignment]));
}
