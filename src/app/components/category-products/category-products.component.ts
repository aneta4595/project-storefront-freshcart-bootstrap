import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest, of } from 'rxjs';
import {  map, switchMap} from 'rxjs/operators';
import { CategoryModel } from '../../models/category.model';
import { ProductModel } from '../../models/product.model';
import { CategoriesService } from '../../services/categories.service';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-category-products',
  styleUrls: ['./category-products.component.scss'],
  templateUrl: './category-products.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryProductsComponent {

  readonly filterForm: FormGroup = new FormGroup({
    Featured: new FormControl(),
  });
  readonly categoryId$: Observable<string> = this._activatedRoute.params.pipe(
    map((params) => params['categoryId'])
  );

  readonly productList$: Observable<ProductModel[]> = combineLatest([
    this._productsService.getAllProducts(),
    this.categoryId$,
  ]).pipe(
    map(([products, categoryId]) =>
      products
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
    readonly ordering$: Observable<{name:string}[]> = of([
      { name: 'Featured' },
      { name: 'Price: Low to High'},
      { name: 'Price: High to Low' },
      { name: 'Avg. Rating' },
    ]);
  

  onFilterFormSubmitted(filterForm: FormGroup): void {
  }

  constructor(
    private _categoriesService: CategoriesService,
    private _activatedRoute: ActivatedRoute,
    private _productsService: ProductsService
  ) { }

}
