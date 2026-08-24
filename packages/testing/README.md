# @yamlresume/testing

Shared testing utilities for YAMLResume packages. This package is **private**
(workspace-only) and is never published to npm.

## Installation

Add it as a dev dependency of your workspace package:

```sh
pnpm add -D @yamlresume/testing --workspace
```

## Utilities

### `getFixture(baseDir, fileName)`

Resolve the path of a fixture file inside a `fixtures` directory next to the
calling module:

```ts
import { getFixture } from '@yamlresume/testing'

const resumePath = getFixture(__dirname, 'software-engineer.yml')
```

### `createMockLogger()`

Create a mock logger whose methods (`start`, `success`, `debug`, `info`, `log`,
`warn`, `error`) are all vitest mocks matching the `Logger` interface from
`@yamlresume/core`:

```ts
import { createMockLogger } from '@yamlresume/testing'

const logger = createMockLogger()
logger.success('done')
expect(logger.success).toHaveBeenCalledWith('done')
```

### `spyOnConsola(...methods)`

Spy on consola methods with mocked implementations:

```ts
import { spyOnConsola } from '@yamlresume/testing'

const spies = spyOnConsola('error', 'log')
// ... run code that logs ...
expect(spies.error).toHaveBeenCalledWith('oops')
```

Remember to call `vi.restoreAllMocks()` in an `afterEach` hook.

### `createExecaResult(overrides?)`

Create a successful execa result object for mocking `execa` calls:

```ts
import { createExecaResult } from '@yamlresume/testing'

vi.mocked(execa).mockResolvedValue(createExecaResult({ stdout: 'hi' }))
```

## License

MIT License

Copyright (c) 2023–Present PPResume (https://ppresume.com)
