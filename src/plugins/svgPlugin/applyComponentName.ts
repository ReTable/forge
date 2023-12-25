import { Template } from '@svgr/babel-plugin-transform-svg-component';

import { SVGRComponentNameFn } from '../../types';

type Variables = Template extends (variables: infer V, ...args: never[]) => unknown ? V : never;

type Options = {
  memo: boolean;
  transformName?: SVGRComponentNameFn;
};

function applyComponentNameNotMemoized(variables: Variables, name: string) {
  variables.componentName = name;

  const [exports] = variables.exports;

  if (exports.type !== 'ExportNamedDeclaration') {
    return;
  }

  const [specifier] = exports.specifiers;

  if (specifier.type !== 'ExportSpecifier') {
    return;
  }

  specifier.local.name = name;
}

function applyComponentNameToMemoized(variables: Variables, name: string) {
  variables.componentName = name;

  const [exports] = variables.exports;

  if (exports.type !== 'VariableDeclaration') {
    return;
  }

  const { init } = exports.declarations[0];

  if (init == null || init.type !== 'CallExpression') {
    return;
  }

  const [argument] = init.arguments;

  if (argument.type !== 'Identifier') {
    return;
  }

  argument.name = name;
}

export function applyComponentName(variables: Variables, { memo, transformName }: Options): void {
  if (transformName == null) {
    return;
  }

  const name = transformName(variables.componentName);

  if (memo) {
    applyComponentNameToMemoized(variables, name);
  } else {
    applyComponentNameNotMemoized(variables, name);
  }
}
