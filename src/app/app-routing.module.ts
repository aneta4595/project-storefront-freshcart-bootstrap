import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryProductsComponent } from './components/category-products/category-products.component';
import { HomeComponent } from './components/home/home.component';
import { StoreProductsComponent } from './components/store-products/store-products.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { WishListComponent } from './components/wish-list/wish-list.component';
import { CategoryProductsComponentModule } from './components/category-products/category-products.component-module';
import { StoreProductsComponentModule } from './components/store-products/store-products.component-module';
import { HomeComponentModule } from './components/home/home.component-module';
import { ProductDetailComponentModule } from './components/product-detail/product-detail.component-module';
import { WishListComponentModule } from './components/wish-list/wish-list.component-module';

const routes: Routes = [
  { path: 'categories/:categoryId', component: CategoryProductsComponent },
  { path: '', component: HomeComponent },
  { path: 'stores/:storeId', component: StoreProductsComponent },
  { path: 'product-detail/:productId', component: ProductDetailComponent },
  { path: 'wish-list', component: WishListComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    CategoryProductsComponentModule,
    StoreProductsComponentModule,
    HomeComponentModule,
    ProductDetailComponentModule,
    WishListComponentModule
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
