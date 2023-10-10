import { ComponentDoc } from 'react-docgen-typescript';

export function renderDocs(docs: ComponentDoc[]): string {
  if (docs.length === 0) {
    return '';
  }

  return docs
    .map((doc) => {
      const { expression, ...storybook } = doc;

      // NOTE: We must use name from expression, instead of the `displayName` property, because it can be (and it will
      //       be in most cases) invalid JS expression.
      //       We should assign docs to the JS variables, not string value from the `displayName`.
      const instance = expression?.getName() ?? doc.displayName;

      return `${instance}.__docgenInfo = ${JSON.stringify(storybook, null, 2)};`;
    })
    .join('\n');
}
