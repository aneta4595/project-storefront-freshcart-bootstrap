import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, of } from 'rxjs';
import { map, shareReplay, startWith, switchMap, take, tap } from 'rxjs/operators';
import { ProductQuery } from '../../queries/product.query';
import { CategoryModel } from '../../models/category.model';
import { CategoriesService } from '../../services/categories.service';
import { ProductsService } from '../../services/products.service';
import { ProductModel } from '../../models/product.model';
import { PaginationQuery } from 'src/app/queries/pagination.query';

@Component({
  selector: 'app-category-products',
  styleUrls: ['./category-products.component.scss'],
  templateUrl: './category-products.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryProductsComponent {

  readonly sort: FormGroup = new FormGroup({ value: new FormControl() });

  readonly filterForm: FormGroup = new FormGroup({
    Featured: new FormControl(),
  });

  readonly categoryId$: Observable<string> = this._activatedRoute.params.pipe(
    map((params) => params['categoryId'])
  );

  readonly productList$: Observable<ProductQuery[]> = combineLatest([
    this._productsService.getAllProducts(),
    this.categoryId$,
  ]).pipe(
    map(([products, categoryId]) => this._mapToProductQuery(products)
      .filter((product) => product.categoryId.includes(categoryId))
      .sort((a, b) => b.featureValue - a.featureValue)));

  readonly categoriesList$: Observable<CategoryModel[]> =
    this._categoriesService.getAllCategories();


  readonly oneCategory$: Observable<CategoryModel> =
    this._activatedRoute.params.pipe(
      switchMap((data) =>
        this._categoriesService.getOneCategory(data['categoryId'])
      )
    );
  // readonly sorting$: Observable<{ name: string, value: string}[]> = of([
  //   { name: 'Featured', value: 'desc' },
  //   { name: 'Price: Low to High', value: 'asc' },
  //   { name: 'Price: High to Low', value:'desc' },
  //   { name: 'Avg. Rating', value: 'desc'},
  // ]);

  readonly limitOptions$: Observable<number[]> = of([5, 10, 15]);

  readonly paginationParams$: Observable<PaginationQuery> = this._activatedRoute.queryParams
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
    combineLatest([
      this.productList$,
      this.paginationParams$,
      this.sort.valueChanges.pipe(map((form) => form.value), startWith(''))
    ]).pipe(
      map(([products, params]) =>
        products.slice(
          (params.pageNumber - 1) * params.pageSize,
          params.pageNumber * params.pageSize
        )
      )
    )

  onFilterFormSubmitted(filterForm: FormGroup): void {
  }

  constructor(
    private _categoriesService: CategoriesService,
    private _activatedRoute: ActivatedRoute,
    private _productsService: ProductsService, private _router: Router
  ) { }

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
      ratingOptions: new Array(5).fill(0).map((_, index) => {
        if (p.ratingValue >= index + 1) {
          return 1
        } else if (p.ratingValue > index) {
          return 0.5
        } else {
          return 0
        }
      })
    }))
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
}
