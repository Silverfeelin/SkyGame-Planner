import { Routes } from '@angular/router';
import { EditorTodoComponent } from './components/editor-todo/editor-todo.component';
import { EditorOutfitShrineComponent } from './components/editor-outfit-shrine/editor-outfit-shrine.component';
import { EditorDyesComponent } from './components/editor-dyes/editor-dyes.component';
import { SpiritTreeEditorComponent } from './components/editor-spirit-tree/editor-spirit-tree.component';
import { EditorItemPageComponent } from './components/editor-item/editor-item-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'spirit-tree', pathMatch: 'full' },
  { path: 'dye', component: EditorDyesComponent },
  { path: 'item/:guid', component: EditorItemPageComponent },
  { path: 'todo', component: EditorTodoComponent },
  { path: 'spirit-tree', component: SpiritTreeEditorComponent, title: 'Spirit Tree Editor' },
  { path: 'outfit-shrine', component: EditorOutfitShrineComponent },
];
