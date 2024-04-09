import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorDashboardComponent } from './components/dashboard/editor-dashboard.component';
import { EditorRoutingModule } from './editor-routing.module';
import { EditorTravelingSpiritComponent } from './components/editor-traveling-spirit/editor-traveling-spirit.component';
import { FormsModule } from '@angular/forms';
import { EditorTreeComponent } from './components/editor-tree/editor-tree.component';
import { EditorShopComponent } from './components/editor-shop/editor-shop.component';
import { EditorItemComponent } from './components/editor-item/editor-item.component';
import { MatIconModule } from '@angular/material/icon';
import { EditorOrderComponent } from './components/editor-order/editor-order.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EditorEventInstanceComponent } from './components/editor-event-instance/editor-event-instance.component';

@NgModule({
  declarations: [
    EditorDashboardComponent,
    EditorTravelingSpiritComponent,
    EditorTreeComponent,
    EditorShopComponent,
    EditorItemComponent,
    EditorOrderComponent,
    EditorEventInstanceComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    NgbModule,
    EditorRoutingModule
  ]
})
export class EditorModule { }
