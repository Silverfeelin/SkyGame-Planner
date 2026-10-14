/** Temporary on-device diagnostics for blank AG Grid tables in Safari 26. Enabled with `?grid-debug`. */

const chain: Array<[string, string]> = [
  ['card', '.atmos-card:has(> ag-grid-angular)'],
  ['host', 'ag-grid-angular'],
  ['wrapper', '.ag-root-wrapper'],
  ['wrapperBody', '.ag-root-wrapper-body'],
  ['root', '.ag-root'],
  ['header', '.ag-header'],
  ['body', '.ag-body'],
  ['bodyViewport', '.ag-body-viewport'],
  ['centerViewport', '.ag-center-cols-viewport'],
  ['centerContainer', '.ag-center-cols-container'],
  ['firstRow', '.ag-center-cols-container .ag-row'],
  ['firstHeaderCell', '.ag-header-cell'],
];

const props = ['display', 'height', 'contentVisibility', 'containerType', 'visibility', 'opacity', 'overflow', 'transform', 'webkitBackdropFilter'];

const experiments: Array<[string, string, Record<string, string>]> = [
  ['No card backdrop-filter', '.atmos-card:has(> ag-grid-angular)', { 'backdrop-filter': 'none', '-webkit-backdrop-filter': 'none' }],
  ['Card overflow visible', '.atmos-card:has(> ag-grid-angular)', { overflow: 'visible' }],
  ['Host fixed 70vh', 'ag-grid-angular', { height: '70vh', flex: 'none' }],
  ['Wrapper no container-type', '.ag-root-wrapper', { 'container-type': 'normal' }],
  ['Wrapper content-visibility visible', '.ag-root-wrapper', { 'content-visibility': 'visible' }],
];

export function initGridDebug(): void {
  if (!new URLSearchParams(location.search).has('grid-debug')) { return; }

  const errors: string[] = [];
  addEventListener('error', e => errors.push(`${e.message} @ ${e.filename}:${e.lineno}`));
  addEventListener('unhandledrejection', e => errors.push(`rejection: ${e.reason}`));

  const panel = document.createElement('div');
  panel.style.cssText = 'position:fixed;left:0;right:0;bottom:0;max-height:55vh;overflow:auto;z-index:99999;background:#000e;color:#0f0;font:11px/1.35 monospace;padding:6px;-webkit-user-select:text;user-select:text';
  const buttons = document.createElement('div');
  const pre = document.createElement('pre');
  pre.style.cssText = 'margin:4px 0 0;white-space:pre-wrap;word-break:break-all';
  panel.append(buttons, pre);

  const addButton = (label: string, onClick: () => void) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.cssText = 'margin:2px;font:11px sans-serif;padding:4px 6px';
    btn.onclick = onClick;
    buttons.append(btn);
    return btn;
  };

  const applied: string[] = [];
  const report = () => {
    const lines = [
      `UA: ${navigator.userAgent}`,
      `viewport: ${innerWidth}x${innerHeight} dpr ${devicePixelRatio}`,
      `url: ${location.href}`,
      `ag style tags: ${document.querySelectorAll('style[data-ag-css]').length}`,
      `css nesting: ${supportsNesting()}`,
      `experiments: ${applied.join(', ') || 'none'}`,
      `rows: ${document.querySelectorAll('.ag-center-cols-container .ag-row').length}, header cells: ${document.querySelectorAll('.ag-header-cell').length}`,
      '',
    ];
    for (const [name, selector] of chain) {
      const el = document.querySelector<HTMLElement>(selector);
      if (!el) { lines.push(`${name}: MISSING`); continue; }
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el) as unknown as Record<string, string>;
      lines.push(`${name}: ${Math.round(r.width)}x${Math.round(r.height)} @${Math.round(r.left)},${Math.round(r.top)} client ${el.clientWidth}x${el.clientHeight} scroll ${el.scrollWidth}x${el.scrollHeight}`);
      lines.push('  ' + props.map(p => `${p}=${cs[p] ?? '-'}`).join(' '));
      lines.push(`  inline: ${el.getAttribute('style') ?? ''}`);
    }
    lines.push('', `errors (${errors.length}):`, ...errors);
    pre.textContent = lines.join('\n');
  };

  addButton('Refresh', report);
  addButton('Copy', () => navigator.clipboard?.writeText(pre.textContent ?? ''));
  addButton('Resize event', () => { dispatchEvent(new Event('resize')); setTimeout(report, 500); });
  for (const [label, selector, style] of experiments) {
    addButton(label, () => {
      document.querySelectorAll<HTMLElement>(selector).forEach(el => {
        for (const [k, v] of Object.entries(style)) { el.style.setProperty(k, v, 'important'); }
      });
      applied.push(label);
      setTimeout(report, 500);
    });
  }

  const mount = () => {
    document.body.append(panel);
    const started = Date.now();
    const poll = setInterval(() => {
      if (document.querySelector('.ag-root-wrapper') || Date.now() - started > 15000) {
        clearInterval(poll);
        setTimeout(report, 1500);
      }
    }, 250);
  };
  if (document.body) { mount(); } else { addEventListener('DOMContentLoaded', mount); }
}

function supportsNesting(): boolean {
  const style = document.createElement('style');
  style.textContent = 'a{&:hover{color:red}}';
  document.head.append(style);
  const rule = style.sheet?.cssRules[0] as (CSSStyleRule & { cssRules?: CSSRuleList }) | undefined;
  const supported = !!rule?.cssRules?.length;
  style.remove();
  return supported;
}
