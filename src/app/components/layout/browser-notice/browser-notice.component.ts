import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

const dismissedKey = 'browserNotice.dismissed';

/** Parses a nested rule the way AG Grid's runtime-injected theme CSS writes them. */
function supportsCssNesting(): boolean {
  const style = document.createElement('style');
  style.textContent = 'a{&:hover{color:red}}';
  document.head.appendChild(style);
  const rule = style.sheet?.cssRules[0] as (CSSStyleRule & { cssRules?: CSSRuleList }) | undefined;
  const supported = !!rule?.cssRules?.length;
  style.remove();
  return supported;
}

/**
 * Without CSS nesting (iOS before 16.5) AG Grid drops the rules that size its body,
 * so every table renders as an empty box. No fallback is attempted; this only explains it.
 */
@Component({
  selector: 'app-browser-notice',
  templateUrl: './browser-notice.component.html',
  styleUrl: './browser-notice.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon]
})
export class BrowserNoticeComponent {
  readonly isVisible = signal(localStorage.getItem(dismissedKey) !== '1' && !supportsCssNesting());

  dismiss(): void {
    localStorage.setItem(dismissedKey, '1');
    this.isVisible.set(false);
  }
}
