import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { filter, map, startWith, switchMap } from 'rxjs/operators';
import { StoreTagModel } from '../../models/store-tag.model';
import { StoreQuery } from '../../queries/store.query';
import { ProductModel } from '../../models/product.model';
import { ProductsService } from '../../services/products.service';
import { StoresService } from '../../services/stores.service';
import { StoreTagsService } from '../../services/store-tags.service';
import { StoreModel } from '../../models/store.model';

@Component({
  selector: 'app-store-products',
  styleUrls: ['./store-products.component.scss'],
  templateUrl: './store-products.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreProductsComponent {

  readonly search: FormGroup = new FormGroup({ title: new FormControl() });

  readonly storeId$: Observable<string> = this._activatedRoute.params.pipe(
    map((params) => params['storeId'])
  );

  readonly storeTags$: Observable<StoreTagModel[]> = this._storeTagsService.getAllTags();

  readonly store$: Observable<StoreQuery> = combineLatest([
    this.storeId$,
    this.storeTags$,
  ]).pipe(
    switchMap(([store, storeTag]) => this._storesService.getOneStore(store).pipe(
      map((store) => this._mapToStoreQuery(storeTag, store))
    ))
  )

  readonly productsList$: Observable<ProductModel[]> = combineLatest([
    this._productsService.getAllProducts(),
    this.storeId$,
    this.search.valueChanges.pipe(map((form) => form.title)).pipe(startWith(''))
  ]).pipe(
    map(([products, storeId, search]) => products.filter((product) => product.storeIds.includes(storeId)).slice(0, 6).filter((product) => product.name.toLowerCase().includes(search.toLowerCase())))
  )


  constructor(private _productsService: ProductsService, private _storesService: StoresService, private _activatedRoute: ActivatedRoute, private _storeTagsService: StoreTagsService) {
  }

  private _mapToStoreQuery(storeTag: StoreTagModel[], store: StoreModel): StoreQuery {
    const storeTagMap = storeTag.reduce((a, c) => ({ ...a, [c.id]: c }),
      {} as Record<string, StoreTagModel>
    )
    return {
      name: store.name,
      logoUrl: store.logoUrl,
      id: store.id,
      distanceInMeters: Math.round(store.distanceInMeters / 100) / 10,
      tagIds: store.tagIds.map((sId) => storeTagMap[sId]?.name)
    }
  }

  onSearchSubmitted(search: FormGroup): void {
  }
}
