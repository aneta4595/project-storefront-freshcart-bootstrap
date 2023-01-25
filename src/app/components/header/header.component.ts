import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject, Observable , take, tap} from 'rxjs';
import { CategoryModel } from '../../models/category.model';
import { CategoriesService } from '../../services/categories.service';

@Component({
  selector: 'app-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  readonly categoriesList$: Observable<CategoryModel[]> = this._categoriesService.getAllCategories();

  private _hamburgerMenuSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public hamburgerMenu$: Observable<boolean> = this._hamburgerMenuSubject.asObservable();

  constructor(private _categoriesService: CategoriesService) {
  }
  showHamburgerMenu() {
    this.hamburgerMenu$.pipe(
      take(1),
      tap(() => this._hamburgerMenuSubject.next(true))
    ).subscribe()
  }
  hideHamburgerMenu() {
    this.hamburgerMenu$.pipe(
      take(1),
      tap(() => this._hamburgerMenuSubject.next(false))
    ).subscribe()
  }
}
