import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoriesModel } from '../../models/categories.model';
import { CategoriesService } from '../../services/categories.service';

@Component({
  selector: 'app-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  readonly categoriesList$: Observable<CategoriesModel[]> = this._categoriesService.getAllCategories();

  constructor(private _categoriesService: CategoriesService) {
  }
}
