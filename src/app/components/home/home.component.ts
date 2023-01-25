import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { CategoryModel } from '../../models/category.model';
import { StoreTagModel } from '../../models/store-tag.model';
import { ProductModel } from '../../models/product.model';
import { StoreQuery } from '../../queries/store.query';
import { CategoriesService } from '../../services/categories.service';
import { StoreTagsService } from '../../services/store-tags.service';
import { ProductsService } from '../../services/products.service';
import { StoresService } from '../../services/stores.service';
import { StoreModel } from '../../models/store.model';

@Component({
  selector: 'app-home',
  styleUrls: ['./home.component.scss'],
  templateUrl: './home.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  readonly categoriesList$: Observable<CategoryModel[]> =
    this._categoriesService.getAllCategories();

  readonly storeTags$: Observable<StoreTagModel[]> =
    this._storeTagsService.getAllTags();

  readonly fruitsAndVegetables$: Observable<ProductModel[]> =
    this._productsService
      .getAllProducts()
      .pipe(
        map((products) =>
          products
            .filter((product) => product.categoryId === '5')
            .sort((a, b) => b.featureValue - a.featureValue)
        )
      );

  readonly SnackAndMunchies$: Observable<ProductModel[]> = this._productsService
    .getAllProducts()
    .pipe(
      map((products) =>
        products.filter((product) => product.categoryId === '2').sort((a,b) => b.featureValue - a.featureValue).slice(0,5)
      )
    );

  readonly storesList$: Observable<StoreQuery[]> = combineLatest([
    this._storesService.getAllStores(),
    this._storeTagsService.getAllTags(),
  ]).pipe(
    map(([stores, tags]) => {
      return this._mapToTagQuery(stores, tags);
    })
  );

  constructor(
    private _categoriesService: CategoriesService,
    private _storeTagsService: StoreTagsService,
    private _productsService: ProductsService,
    private _storesService: StoresService
  ) {}

  private _mapToTagQuery(
    stores: StoreModel[],
    tags: StoreTagModel[]
  ): StoreQuery[] {
    const tagMap = tags.reduce(
      (a, c) => ({ ...a, [c.id]: c }),
      {} as Record<string, StoreTagModel>
    );

    return stores.map((s) => ({
      id: s.id,
      name: s.name,
      distanceInMeters: Math.round(s.distanceInMeters / 100) / 10,
      logoUrl: s.logoUrl,
      tagIds: (s.tagIds ?? []).map((tagId) => tagMap[tagId]?.name),
    }));
  }
}
