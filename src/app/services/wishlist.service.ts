import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProductDetailQuery } from '../queries/product-detail.query';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  constructor(private _httpClient: HttpClient) {}

  public _productInWishListSubject: BehaviorSubject<string[]> =
    new BehaviorSubject<string[]>(this.getElementToWishList());

  public productInWishList$: Observable<string[]> =
    this._productInWishListSubject.asObservable();

  addProductToWishList(id: string): void {
    const newValues = [
      ...new Set([...this._productInWishListSubject.value, id]),
    ];
    this._productInWishListSubject.next(newValues);
    this.setItemToWishList(newValues);
  }
  removeProductFromWishList(id: string): void {
    const newValues = this._productInWishListSubject.value.filter(
      (productInWishList) => id !== productInWishList
    );
    this._productInWishListSubject.next(newValues);
    this.setItemToWishList(newValues)
  }

  getElementToWishList() {
    const element = localStorage.getItem('wishList');
    return element ? JSON.parse(element) : [];
  }
  
  setItemToWishList(ids: string[]) {
    localStorage.setItem('wishList', JSON.stringify(ids));
  }

}
