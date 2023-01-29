import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject, Observable, of, take, tap } from 'rxjs';
import { CategoryModel } from '../../models/category.model';
import { CategoriesService } from '../../services/categories.service';

@Component({
  selector: 'app-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly categoriesList$: Observable<CategoryModel[]> =
    this._categoriesService.getAllCategories();

  private _hamburgerMenuSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public hamburgerMenu$: Observable<boolean> =
    this._hamburgerMenuSubject.asObservable();

  readonly dairyAndBread$: Observable<string[]> = of([
    'Butter',
    'Milk Drink',
    'Curd & Yogurt',
    'Eggs',
    'Buns & Bakery',
    'Cheese',
    'Condensed Milk',
    'Dairy Products',
  ]);

  readonly breakfast$: Observable<string[]> = of([
    'Breakfast Cereal',
    'Noodles, Pasta & Soup',
    'Frozen Veg Snacks',
    'Frozen Non-Veg Snacks',
    'Vermicelli',
    'Instant Mixes',
    'Batter',
    'Fruit and Juices',
  ]);

  readonly coldDrinks$: Observable<string[]> = of([
    'Soft Drinks',
    'Fruit Juices',
    'Coldpress',
    'Water & Ice Cubes',
    'Soda & Mixers',
    'Health Drinks',
    'Herbal Drinks',
    'Milk Drinks'
  ]);

  constructor(private _categoriesService: CategoriesService) {}
  showHamburgerMenu() {
    this.hamburgerMenu$
      .pipe(
        take(1),
        tap(() => this._hamburgerMenuSubject.next(true))
      )
      .subscribe();
  }
  hideHamburgerMenu() {
    this.hamburgerMenu$
      .pipe(
        take(1),
        tap(() => this._hamburgerMenuSubject.next(false))
      )
      .subscribe();
  }
}
