/**
 * MIT License
 *
 * Copyright (c) 2023–Present PPResume (https://ppresume.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

import { loader } from '@monaco-editor/react'

/**
 * Type alias for the monaco-editor module namespace.
 *
 * We cannot statically import `monaco-editor` at the top level because its
 * initialization code accesses `window` immediately. In a server-side
 * rendering environment such as Next.js that throws `window is not defined`.
 * Instead we dynamically import it on demand inside the browser.
 */
type MonacoModule = typeof import('monaco-editor')

/**
 * `@monaco-editor/loader` does not return a native Promise from `init()`.
 *
 * It returns a promise augmented with a `.cancel()` method.
 * `@monaco-editor/react` relies on that method in its useEffect cleanup: if the
 * editor component unmounts before Monaco finishes loading, it calls
 * `.cancel()` to abort the pending load. If our wrapper returns a plain
 * Promise, the cleanup throws `TypeError: p.cancel is not a function`.
 */
type CancelablePromise<T> = Promise<T> & {
  cancel: () => void
}

/**
 * Cached resolved module and in-flight promise for `loadMonacoModule()`.
 *
 * Keeping a singleton promise avoids fetching/bundling monaco-editor multiple
 * times if `loader.init()` is called more than once, which happens with React
 * Strict Mode and with multiple editor instances on the same page.
 */
let monacoModule: MonacoModule | undefined
let monacoModulePromise: Promise<MonacoModule> | undefined

/**
 * Lazily imports the locally bundled monaco-editor module.
 *
 * The import is deferred until this function is called. Because the only call
 * site is inside the `loader.init()` wrapper guarded by
 * `typeof window !== 'undefined'`, the module is never evaluated during SSR.
 */
function loadMonacoModule(): Promise<MonacoModule> {
  if (monacoModule) {
    return Promise.resolve(monacoModule)
  }
  if (!monacoModulePromise) {
    monacoModulePromise = import('monaco-editor').then((module) => {
      monacoModule = module
      return module
    })
  }
  return monacoModulePromise
}

/**
 * Use the locally bundled monaco-editor instead of the CDN.
 *
 * `@monaco-editor/react` loads Monaco through `@monaco-editor/loader`. By
 * default the loader injects a `<script>` tag that fetches Monaco from a CDN.
 * We want the editor and the YAML/web workers to use the exact same Monaco
 * version that is declared in this package's dependencies, so we tell the
 * loader to use our local copy.
 *
 * Why intercept `loader.init()` instead of calling `loader.config()` at module
 * load?
 *
 * 1. `loader.config({ monaco: module })` needs the actual module object, but
 *    we cannot import it synchronously without breaking SSR.
 * 2. `loader.init()` is the async entry point that `@monaco-editor/react`
 *    calls when the editor component mounts. By the time it is called we are
 *    guaranteed to be in a browser, so we can safely dynamic-import Monaco.
 *
 * The wrapper below:
 * - starts the local Monaco import,
 * - waits for it to resolve,
 * - calls `loader.config({ monaco: module })` so the loader's internal state
 *   knows about the local module,
 * - then calls the original `loader.init()`, which now resolves immediately
 *   with the local module instead of fetching from the CDN,
 * - and finally returns a cancelable promise so React cleanup works.
 */
if (typeof window !== 'undefined' && loader.init) {
  const originalInit = loader.init.bind(loader)

  loader.init = () => {
    /**
     * The cancelable promise returned by the original loader.init() once we
     * have configured the local module. Undefined until Monaco finishes
     * loading.
     */
    let initPromise: CancelablePromise<MonacoModule> | undefined

    /**
     * The reject function of the outer wrapper promise. Used by `.cancel()`
     * when cancellation happens before `initPromise` exists.
     */
    let rejectWrapper: (reason?: unknown) => void = () => {}

    /** True once `.cancel()` has been called. */
    let canceled = false

    /**
     * Outer promise returned to `@monaco-editor/react`. It looks like a normal
     * Monaco init promise but carries a `.cancel()` implementation.
     */
    const wrapper = new Promise<MonacoModule>((resolve, reject) => {
      rejectWrapper = reject

      loadMonacoModule()
        .then((module) => {
          // If the caller already canceled (e.g. component unmounted), do not
          // configure the loader or start the original init.
          if (canceled) return

          // Configure the loader with the local module BEFORE calling the
          // original init. loader.init() checks its internal state; when it
          // sees a pre-configured `monaco` it resolves with it instead of
          // injecting the CDN script.
          loader.config({ monaco: module })

          initPromise = originalInit() as CancelablePromise<MonacoModule>
          initPromise.then(resolve, reject)
        })
        .catch(reject)
    }) as CancelablePromise<MonacoModule>

    /**
     * Implement the cancelable promise API expected by `@monaco-editor/react`.
     *
     * If cancellation happens before the original init has started, we reject
     * the wrapper with the same shape used by `@monaco-editor/loader`'s
     * internal `makeCancelable()` helper. That lets `@monaco-editor/react`'s
     * error handler recognize the cancellation and ignore it silently.
     *
     * If cancellation happens after the original init has started, delegate to
     * its own `.cancel()` so the loader can stop any in-flight CDN request.
     */
    wrapper.cancel = () => {
      canceled = true
      if (initPromise) {
        initPromise.cancel()
      } else {
        rejectWrapper({
          type: 'cancelation',
          msg: 'operation is manually canceled',
        })
      }
    }

    return wrapper
  }
}
