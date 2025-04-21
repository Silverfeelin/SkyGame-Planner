import { Component, contentChildren, effect } from '@angular/core';
import { TabDirective } from './tab.directive';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-tabs',
  imports: [ NgTemplateOutlet ],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.less'
})
export class TabsComponent {
  tabs = contentChildren(TabDirective);
  activeTab?: TabDirective;

  constructor() {
    effect(() => {
      const tabs = this.tabs();
      this.activeTab = tabs?.[0];
    });
  }
}
