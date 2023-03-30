import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditorDashboardComponent } from './components/dashboard/editor-dashboard.component';
import { EditorTravelingSpiritComponent } from './components/editor-traveling-spirit/editor-traveling-spirit.component';

const routes: Routes = [
  { path: '', component: EditorDashboardComponent },
  { path: 'ts', component: EditorTravelingSpiritComponent },

];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class EditorRoutingModule { }
