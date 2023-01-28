import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { ProductModel } from '../../models/product.model';
import { WishlistService } from '../../services/wishlist.service';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-wish-list',
  templateUrl: './wish-list.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishListComponent {
  readonly inWishList$: Observable<string[]> =
    this._wishlistService._productInWishListSubject.asObservable()

  readonly productsList$: Observable<ProductModel[]> =
    this._productsService.getAllProducts();

  readonly productInWishList$: Observable<ProductModel[]> = combineLatest([
    this._productsService.getAllProducts(),
    this.inWishList$,
  ]).pipe(
    map(([products, wishList]) =>
      products.filter((p) => wishList.includes(p.id))
    )
  );
  constructor(
    private _wishlistService: WishlistService,
    private _productsService: ProductsService
  ) {}

  removeProductFromWishList(id: string) {
    this._wishlistService.removeProductFromWishList(id)
  }
}
