# Snapshot report for `tests/node.test.ts`

The actual snapshot is saved in `node.test.ts.snap`.

Generated by [AVA](https://avajs.dev).

## generates source maps

> Snapshot 1

    `{␊
      "version": 3,␊
      "sources": ["../src/readJson.ts"],␊
      "sourcesContent": ["/// <reference path=\\"../types/vendor.d.ts\\" />\\nimport { readFile } from 'node:fs/promises';\\n\\nimport { parseJson } from 'parse-json';\\nimport { parseJsonDev } from 'parse-json-dev';\\nimport { parseJsonOptional } from 'parse-json-optional';\\nimport { parseJsonPeer } from 'parse-json-peer';\\n\\nexport async function readJson(\\n  filePath: string,\\n  use?: 'dev' | 'optional' | 'peer',\\n): Promise<unknown> {\\n  const content = await readFile(filePath, 'utf8');\\n\\n  switch (use) {\\n    case 'dev':\\n      return parseJsonDev(content);\\n    case 'optional':\\n      return parseJsonOptional(content);\\n    case 'peer':\\n      return parseJsonPeer(content);\\n  }\\n\\n  return parseJson(content);\\n}\\n"],␊
      "mappings": ";AACA,SAAS,gBAAgB;AAEzB,SAAS,iBAAiB;AAC1B,SAAS,oBAAoB;AAC7B,SAAS,yBAAyB;AAClC,SAAS,qBAAqB;AAE9B,eAAsB,SACpB,UACA,KACkB;AAClB,QAAM,UAAU,MAAM,SAAS,UAAU,MAAM;AAE/C,UAAQ,KAAK;AAAA,IACX,KAAK;AACH,aAAO,aAAa,OAAO;AAAA,IAC7B,KAAK;AACH,aAAO,kBAAkB,OAAO;AAAA,IAClC,KAAK;AACH,aAAO,cAAc,OAAO;AAAA,EAChC;AAEA,SAAO,UAAU,OAAO;AAC1B;",␊
      "names": []␊
    }␊
    `

## uses dependencies as external

> Snapshot 1

    `// src/readJson.ts␊
    import { readFile } from "node:fs/promises";␊
    import { parseJson } from "parse-json";␊
    import { parseJsonDev } from "parse-json-dev";␊
    import { parseJsonOptional } from "parse-json-optional";␊
    import { parseJsonPeer } from "parse-json-peer";␊
    async function readJson(filePath, use) {␊
      const content = await readFile(filePath, "utf8");␊
      switch (use) {␊
        case "dev":␊
          return parseJsonDev(content);␊
        case "optional":␊
          return parseJsonOptional(content);␊
        case "peer":␊
          return parseJsonPeer(content);␊
      }␊
      return parseJson(content);␊
    }␊
    export {␊
      readJson␊
    };␊
    //# sourceMappingURL=index.js.map␊
    `

> Snapshot 2

    `{␊
      "version": 3,␊
      "sources": ["../src/readJson.ts"],␊
      "sourcesContent": ["/// <reference path=\\"../types/vendor.d.ts\\" />\\nimport { readFile } from 'node:fs/promises';\\n\\nimport { parseJson } from 'parse-json';\\nimport { parseJsonDev } from 'parse-json-dev';\\nimport { parseJsonOptional } from 'parse-json-optional';\\nimport { parseJsonPeer } from 'parse-json-peer';\\n\\nexport async function readJson(\\n  filePath: string,\\n  use?: 'dev' | 'optional' | 'peer',\\n): Promise<unknown> {\\n  const content = await readFile(filePath, 'utf8');\\n\\n  switch (use) {\\n    case 'dev':\\n      return parseJsonDev(content);\\n    case 'optional':\\n      return parseJsonOptional(content);\\n    case 'peer':\\n      return parseJsonPeer(content);\\n  }\\n\\n  return parseJson(content);\\n}\\n"],␊
      "mappings": ";AACA,SAAS,gBAAgB;AAEzB,SAAS,iBAAiB;AAC1B,SAAS,oBAAoB;AAC7B,SAAS,yBAAyB;AAClC,SAAS,qBAAqB;AAE9B,eAAsB,SACpB,UACA,KACkB;AAClB,QAAM,UAAU,MAAM,SAAS,UAAU,MAAM;AAE/C,UAAQ,KAAK;AAAA,IACX,KAAK;AACH,aAAO,aAAa,OAAO;AAAA,IAC7B,KAAK;AACH,aAAO,kBAAkB,OAAO;AAAA,IAClC,KAAK;AACH,aAAO,cAAc,OAAO;AAAA,EAChC;AAEA,SAAO,UAAU,OAAO;AAC1B;",␊
      "names": []␊
    }␊
    `

> Snapshot 3

    `export { readJson } from './readJson';␊
    `

> Snapshot 4

    `/// <reference path="../types/vendor.d.ts" />␊
    export declare function readJson(filePath: string, use?: 'dev' | 'optional' | 'peer'): Promise<unknown>;␊
    `

## minify bundle by default

> Snapshot 1

    `// src/readJson.ts␊
    import { readFile } from "node:fs/promises";␊
    import { parseJson } from "parse-json";␊
    import { parseJsonDev } from "parse-json-dev";␊
    import { parseJsonOptional } from "parse-json-optional";␊
    import { parseJsonPeer } from "parse-json-peer";␊
    async function readJson(filePath, use) {␊
      const content = await readFile(filePath, "utf8");␊
      switch (use) {␊
        case "dev":␊
          return parseJsonDev(content);␊
        case "optional":␊
          return parseJsonOptional(content);␊
        case "peer":␊
          return parseJsonPeer(content);␊
      }␊
      return parseJson(content);␊
    }␊
    export {␊
      readJson␊
    };␊
    //# sourceMappingURL=index.js.map␊
    `

## generates typings by default

> Snapshot 1

    `export { readJson } from './readJson';␊
    `

> Snapshot 2

    `/// <reference path="../types/vendor.d.ts" />␊
    export declare function readJson(filePath: string, use?: 'dev' | 'optional' | 'peer'): Promise<unknown>;␊
    `

## drops debugger in production mode

> Snapshot 1

    `// src/readJson.ts␊
    import { readFile } from "node:fs/promises";␊
    async function readJson(filePath) {␊
      const content = await readFile(filePath, "utf8");␊
      return JSON.parse(content);␊
    }␊
    export {␊
      readJson␊
    };␊
    //# sourceMappingURL=index.js.map␊
    `

## don't minify code when production mode is off

> Snapshot 1

    `// src/readJson.ts␊
    import { readFile } from "node:fs/promises";␊
    import { parseJson } from "parse-json";␊
    import { parseJsonDev } from "parse-json-dev";␊
    import { parseJsonOptional } from "parse-json-optional";␊
    import { parseJsonPeer } from "parse-json-peer";␊
    async function readJson(filePath, use) {␊
      const content = await readFile(filePath, "utf8");␊
      switch (use) {␊
        case "dev":␊
          return parseJsonDev(content);␊
        case "optional":␊
          return parseJsonOptional(content);␊
        case "peer":␊
          return parseJsonPeer(content);␊
      }␊
      return parseJson(content);␊
    }␊
    export {␊
      readJson␊
    };␊
    //# sourceMappingURL=index.js.map␊
    `

## minify code when production mode is on

> Snapshot 1

    `// src/readJson.ts␊
    import { readFile } from "node:fs/promises";␊
    import { parseJson } from "parse-json";␊
    import { parseJsonDev } from "parse-json-dev";␊
    import { parseJsonOptional } from "parse-json-optional";␊
    import { parseJsonPeer } from "parse-json-peer";␊
    async function readJson(filePath, use) {␊
      const content = await readFile(filePath, "utf8");␊
      switch (use) {␊
        case "dev":␊
          return parseJsonDev(content);␊
        case "optional":␊
          return parseJsonOptional(content);␊
        case "peer":␊
          return parseJsonPeer(content);␊
      }␊
      return parseJson(content);␊
    }␊
    export {␊
      readJson␊
    };␊
    //# sourceMappingURL=index.js.map␊
    `