import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorDashboardComponent } from './components/dashboard/editor-dashboard.component';
import { EditorRoutingModule } from './editor-routing.module';
import { EditorTravelingSpiritComponent } from './components/editor-traveling-spirit/editor-traveling-spirit.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    EditorDashboardComponent,
    EditorTravelingSpiritComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    EditorRoutingModule
  ]
})
export class EditorModule { }
