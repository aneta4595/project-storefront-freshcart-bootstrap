import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { WishListComponent } from './wish-list.component';

@NgModule({
  imports: [CommonModule],
  declarations: [WishListComponent],
  providers: [],
  exports: [WishListComponent]
})
export class WishListComponentModule {
}
