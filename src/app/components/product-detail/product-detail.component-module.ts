import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProductDetailComponent } from './product-detail.component';
import { TabsModule } from 'ngx-bootstrap/tabs';

@NgModule({
  imports: [CommonModule, RouterModule, TabsModule.forRoot()],
  declarations: [ProductDetailComponent],
  providers: [],
  exports: [ProductDetailComponent]
})
export class ProductDetailComponentModule {
}
