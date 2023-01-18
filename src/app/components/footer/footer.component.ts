import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CategoriesModel } from '../../models/categories.model';
import { StoresModel } from '../../models/stores.model';
import { CategoriesService } from '../../services/categories.service';
import { StoresService } from '../../services/stores.service';

@Component({
  selector: 'app-footer',
  styleUrls: ['./footer.component.scss'],
  templateUrl: './footer.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  readonly categoriesList$: Observable<CategoriesModel[]> = this._categoriesService.getAllCategories();
  readonly storesList$: Observable<StoresModel[]> = this._storesService.getAllStores();
  readonly knowUs$: Observable<string[]> = of(['Company', 'About', 'Blog', 'Help Center', 'Our Value'])

  constructor(private _categoriesService: CategoriesService, private _storesService: StoresService) {
  }
}