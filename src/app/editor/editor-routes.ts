import { Routes } from '@angular/router';
import { EditorDashboardComponent } from './components/dashboard/editor-dashboard.component';
import { EditorTravelingSpiritComponent } from './components/editor-traveling-spirit/editor-traveling-spirit.component';
import { EditorShopComponent } from './components/editor-shop/editor-shop.component';
import { EditorOrderComponent } from './components/editor-order/editor-order.component';
import { EditorEventInstanceComponent } from './components/editor-event-instance/editor-event-instance.component';
import { EditorTodoComponent } from './components/editor-todo/editor-todo.component';
import { EditorOutfitShrineComponent } from './components/editor-outfit-shrine/editor-outfit-shrine.component';
import { EditorDyesComponent } from './components/editor-dyes/editor-dyes.component';
import { SpiritTreeEditorComponent } from './components/editor-spirit-tree/editor-spirit-tree.component';
import { EditorItemComponent } from './components/editor-item/editor-item.component';
import { EditorItemPageComponent } from './components/editor-item/editor-item-page.component';

export const routes: Routes = [
  { path: '', component: EditorDashboardComponent },
  { path: 'dye', component: EditorDyesComponent },
  { path: 'item/:guid', component: EditorItemPageComponent },
  { path: 'todo', component: EditorTodoComponent },
  { path: 'ts', component: EditorTravelingSpiritComponent },
  { path: 'spirit-tree', component: SpiritTreeEditorComponent, title: 'Spirit Tree Editor' },
  { path: 'shop', component: EditorShopComponent },
  { path: 'order', component: EditorOrderComponent },
  { path: 'event-instance', component: EditorEventInstanceComponent },
  { path: 'outfit-shrine', component: EditorOutfitShrineComponent },
];
