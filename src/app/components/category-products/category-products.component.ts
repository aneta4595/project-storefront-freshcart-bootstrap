import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, of } from 'rxjs';
import {
  filter,
  map,
  shareReplay,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { PriceFilterQuery } from '../../queries/price-filter.query';
import { SortQuery } from '../../queries/sort.query';
import { ProductQuery } from '../../queries/product.query';
import { CategoryModel } from '../../models/category.model';
import { PaginationQuery } from '../../queries/pagination.query';
import { ProductModel } from '../../models/product.model';
import { StoreModel } from '../../models/store.model';
import { CategoriesService } from '../../services/categories.service';
import { ProductsService } from '../../services/products.service';
import { StoresService } from '../../services/stores.service';
import { StarFilterQuery } from 'src/app/queries/star-filter.query';
import { RatingQuery } from 'src/app/queries/rating.query';

@Component({
  selector: 'app-category-products',
  styleUrls: ['./category-products.component.scss'],
  templateUrl: './category-products.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryProductsComponent {
  readonly starsFilterForm: FormGroup = new FormGroup({
    rating: new FormControl(1),
  });

  readonly starsFilter$: Observable<RatingQuery> =
    this.starsFilterForm.valueChanges.pipe(startWith({ rating: 1 }));

  readonly filterPriceForm: FormGroup = new FormGroup({
    priceFrom: new FormControl(),
    priceTo: new FormControl(),
  });

  readonly filterByPrice$: Observable<PriceFilterQuery> =
    this.filterPriceForm.valueChanges.pipe(
      startWith({ priceFrom: 1, priceTo: Infinity }),
      map((form) => ({
        priceFrom: !!form.priceFrom ? form.priceFrom : 1,
        priceTo: !!form.priceTo ? form.priceTo : Infinity,
      }))
    );
  readonly sortAscDescForm: FormGroup = new FormGroup({
    sortBy: new FormControl('Featured'),
  });

  readonly sortValues$: Observable<SortQuery> =
    this.sortAscDescForm.valueChanges.pipe(
      map((form) => form.sortBy),
      startWith({ name: 'Featured', sortBy: 'featureValue', direction: 'desc' })
    );
  readonly sortCheckboxForm: FormGroup = new FormGroup({});

  readonly sortCheckBoxValues$: Observable<string[]> =
    this.sortCheckboxForm.valueChanges.pipe(
      startWith({}),
      map((form) => Object.keys(form).filter((k) => form[k] === true)),
      shareReplay(1)
    );

  readonly searchStoreForm: FormGroup = new FormGroup({
    store: new FormControl(),
  });

  readonly categoryId$: Observable<string> = this._activatedRoute.params.pipe(
    map((params) => params['categoryId'])
  );

  readonly productList$: Observable<ProductQuery[]> = combineLatest([
    this._productsService.getAllProducts(),
    this.categoryId$,
    this.sortValues$,
    this.sortCheckBoxValues$,
    this.filterByPrice$,
    this.starsFilter$,
  ]).pipe(
    map(
      ([
        products,
        categoryId,
        sort,
        selectedStoreIds,
        filterByPrice,
        starsFilter,
      ]) =>
        this._mapToProductQuery(products)
          .filter((product) => product.categoryId.includes(categoryId))
          .sort((a, b) => b.featureValue - a.featureValue)
          .filter(
            (product) =>
              !selectedStoreIds.length ||
              selectedStoreIds.filter((storeId) =>
                product.storeIds.includes(storeId)
              ).length
          )
          .sort((a: Record<string, any>, b: Record<string, any>) =>
            sort.direction === 'desc'
              ? b[sort.sortBy] - a[sort.sortBy]
              : a[sort.sortBy] - b[sort.sortBy]
          )
          .map((p) => {
            return {
              id: p.id,
              name: p.name,
              price: p.price,
              categoryId: p.categoryId,
              ratingValue: p.ratingValue,
              ratingCount: p.ratingCount,
              imageUrl: p.imageUrl,
              featureValue: p.featureValue,
              storeIds: p.storeIds,
              ratingOptions: this._mapToRatingOptions(p.ratingValue),
            };
          })
          .filter(
            (product) =>
              product.price >= filterByPrice.priceFrom &&
              product.price <= filterByPrice.priceTo
          )
          .filter((product) => product.ratingValue >= starsFilter.rating)

    ),
    shareReplay(1)
  );

  readonly categoriesList$: Observable<CategoryModel[]> =
    this._categoriesService.getAllCategories().pipe(shareReplay(1));

  readonly oneCategory$: Observable<CategoryModel> =
    this._activatedRoute.params.pipe(
      switchMap((data) =>
        this._categoriesService.getOneCategory(data['categoryId'])
      )
    );

  readonly stars$: Observable<StarFilterQuery[]> = of([
    { id: '1', value: 5, stars: [1, 1, 1, 1, 1] },
    { id: '2', value: 4, stars: [1, 1, 1, 1, 0] },
    { id: '3', value: 3, stars: [1, 1, 1, 0, 0] },
    { id: '4', value: 2, stars: [1, 1, 0, 0, 0] },
  ]);

  readonly sorting$: Observable<SortQuery[]> = of([
    { name: 'Featured', sortBy: 'featureValue', direction: 'desc' },
    { name: 'Price: Low to High', sortBy: 'price', direction: 'asc' },
    { name: 'Price: High to Low', sortBy: 'price', direction: 'desc' },
    { name: 'Avg. Rating', sortBy: 'ratingValue', direction: 'desc' },
  ]);

  readonly limitOptions$: Observable<number[]> = of([5, 10, 15]);

  readonly paginationParams$: Observable<PaginationQuery> =
    this._activatedRoute.queryParams
      .pipe(
        map((params) => ({
          pageNumber: params['pageNumber'] ? +params['pageNumber'] : 1,
          pageSize: params['pageSize'] ? +params['pageSize'] : 5,
        }))
      )
      .pipe(shareReplay(1));

  readonly numberOfPages$: Observable<number[]> = combineLatest([
    this.paginationParams$,
    this.productList$,
  ])
    .pipe(
      map(([params, products]) => {
        let pageNumber: number[] = [];
        let numberOfPages: number = Math.ceil(
          products.length / params.pageSize
        );
        for (let i = 1; i <= numberOfPages; i++) {
          pageNumber.push(i);
        }
        return pageNumber;
      })
    )
    .pipe(shareReplay(1));

  readonly productsListOfPagination$: Observable<ProductQuery[]> =
    combineLatest([this.productList$, this.paginationParams$]).pipe(
      map(
        ([products, params]: [
          ProductQuery[],
          PaginationQuery,
        ]) => {
          return products
            
            .slice(
              (params.pageNumber - 1) * params.pageSize,
              params.pageNumber * params.pageSize
            );
        }
      )
    );

  readonly storesList$: Observable<StoreModel[]> = combineLatest([
    this._storesService.getAllStores(),
    this.searchStoreForm.valueChanges.pipe(startWith({ store: '' })),
  ]).pipe(
    map(([stores, search]) =>
      stores.filter((store) =>
        store.name.toLowerCase().includes(search.store.toLowerCase())
      )
    ),
    tap((stores) => this._setStoreControls(stores.map((store) => store.id))),
    shareReplay(1)
  );

  constructor(
    private _categoriesService: CategoriesService,
    private _activatedRoute: ActivatedRoute,
    private _productsService: ProductsService,
    private _router: Router,
    private _storesService: StoresService
  ) {}

  private _mapToProductQuery(products: ProductModel[]): ProductQuery[] {
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      categoryId: p.categoryId,
      featureValue: p.featureValue,
      imageUrl: p.imageUrl,
      ratingCount: p.ratingCount,
      ratingValue: p.ratingValue,
      storeIds: p.storeIds,
      ratingOptions: this._mapToRatingOptions(p.ratingValue),
    }));
  }

  onPageNumberChange(param: number): void {
    this.paginationParams$
      .pipe(
        take(1),
        tap((params) => {
          this._router.navigate([], {
            queryParams: {
              pageNumber: param,
              pageSize: params.pageSize,
            },
          });
        })
      )
      .subscribe();
  }

  onPageSizeChange(param: number): void {
    combineLatest([this.paginationParams$, this.productList$])
      .pipe(
        take(1),
        tap(([params, products]) => {
          this._router.navigate([], {
            queryParams: {
              pageSize: param,
              pageNumber:
                params.pageNumber <= Math.ceil(products.length / param)
                  ? params.pageNumber
                  : Math.ceil(products.length / param),
            },
          });
        })
      )
      .subscribe();
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

  private _setStoreControls(storeIds: string[]): void {
    this.sortCheckboxForm.reset();
    storeIds.forEach((storeId) =>
      this.sortCheckboxForm.addControl(storeId, new FormControl(false))
    );
  }

}
