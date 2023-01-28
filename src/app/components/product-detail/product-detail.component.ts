import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CategoryModel } from '../../models/category.model';
import { ProductQuery } from '../../queries/product.query';
import { CategoriesService } from '../../services/categories.service';
import { ProductsService } from '../../services/products.service';
import { WishlistService } from '../../services/wishlist.service';
import { ProductModel } from '../../models/product.model';
import { setTheme } from 'ngx-bootstrap/utils';
import { ProductDetailQuery } from 'src/app/queries/product-detail.query';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent {
  readonly oneCategory$: Observable<CategoryModel> =
    this._activatedRoute.params.pipe(
      switchMap((data) =>
        this._categoriesService.getOneCategory(data['categoryId'])
      )
    );

  readonly oneProduct$: Observable<ProductDetailQuery> = combineLatest([
    this._activatedRoute.params,
    this._categoriesService.getAllCategories(),
    this._productsService.getAllProducts(),
  ]).pipe(
    switchMap(([params, categories, products]) =>
      this._productsService
        .getOneProduct(params['productId'])
        .pipe(
          map((oneProduct) =>
            this._mapToProductDetailQuery(oneProduct, categories, products)
          )
        )
    )
  );


  constructor(
    private _categoriesService: CategoriesService,
    private _productsService: ProductsService,
    private _activatedRoute: ActivatedRoute,
    private _wishlistService: WishlistService
  ) {
    setTheme('bs5');
  }

  private _mapToProductDetailQuery(
    oneProduct: ProductModel,
    categories: CategoryModel[],
    products: ProductModel[]
  ): ProductDetailQuery {
    const categoriesMap = categories.reduce(
      (a, c) => ({ ...a, [c.id]: c }),
      {} as Record<string, CategoryModel>
    );
    const categoryProductMap = products.filter(
      (p) => p.categoryId === oneProduct.categoryId && p.id !== oneProduct.id
    );

    return {
      id: oneProduct.id,
      name: oneProduct.name,
      price: oneProduct.price,
      categoryId: oneProduct.categoryId,
      categoryName: categoriesMap[oneProduct.categoryId]?.name,
      featureValue: oneProduct.featureValue,
      imageUrl: oneProduct.imageUrl,
      ratingCount: oneProduct.ratingCount,
      ratingValue: oneProduct.ratingValue,
      storeIds: oneProduct.storeIds,
      ratingOptions: this._mapToRatingOptions(oneProduct.ratingValue),
      relatedProducts: categoryProductMap.map((p) => ({
        id: p.name,
        name: p.name,
        price: p.price,
        imageUrl: p.imageUrl,
        ratingOptions: this._mapToRatingOptions(p.ratingValue),
        ratingValue: p.ratingValue,
        ratingCount: p.ratingCount
      })).slice(0,5),
    };
  }

  private _mapToRatingOptions(rating: number): number[] {
    const stars = new Array(5).fill(0).map((_, index) => {
      if (rating >= index + 1) {
        return 1;
      } else if (rating > index) {
        return 0.5;
      } else {
        return 0;
      }
    });
    return stars;
  }

addProductToWishList(id: string): void {
  this._wishlistService.addProductToWishList(id)
}

}
