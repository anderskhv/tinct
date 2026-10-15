/**
 * Resolves once the shared e-ink stylesheet (`/lab/display-profile.css`,
 * marked `data-display-profile`) has loaded, so a page can wait for it before
 * it says it is ready. Without this, `/sign-in` could set `data-ready` while
 * the sheet was still in flight and the account card kept its normal paper
 * colours under `data-eink="true"`.
 *
 * No sheet on the page resolves at once. A sheet that fails, or never reports,
 * stops holding the page after `timeoutMs`, so a page is never stuck unready.
 */
export function displayProfileStylesReady(doc: Document = document, timeoutMs = 4000): Promise<void> {
  const link = doc.querySelector<HTMLLinkElement>('link[data-display-profile]')
  if (!link || link.sheet) return Promise.resolve()
  return new Promise(resolve => {
    const done = () => { clearTimeout(timer); resolve() }
    const timer = setTimeout(done, timeoutMs)
    link.addEventListener('load', done, { once: true })
    link.addEventListener('error', done, { once: true })
  })
}
