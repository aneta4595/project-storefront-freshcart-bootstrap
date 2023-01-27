import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CategoryModel } from '../../models/category.model';
import { ProductModel } from '../../models/product.model';
import { CategoriesService } from '../../services/categories.service';
import { ProductsService } from '../../services/products.service';
import { ProductQuery } from '../../queries/product.query';

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

  readonly oneProduct$: Observable<ProductQuery> =
    this._activatedRoute.params.pipe(
      switchMap((data) =>
        this._productsService
          .getOneProduct(data['productId'])
          .pipe(map((product) => this._mapToProductQuery(product)))
      )
    );


  constructor(
    private _categoriesService: CategoriesService,
    private _productsService: ProductsService,
    private _activatedRoute: ActivatedRoute
  ) {}

  private _mapToProductQuery(product: ProductModel): ProductQuery {
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      categoryId: product.categoryId,
      featureValue: product.featureValue,
      imageUrl: product.imageUrl,
      ratingCount: product.ratingCount,
      ratingValue: product.ratingValue,
      storeIds: product.storeIds,
      ratingOptions: this._mapToRatingOptions(product.ratingValue),
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
}
