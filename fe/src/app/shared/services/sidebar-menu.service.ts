import { Injectable } from '@angular/core';
import { clone } from 'lodash';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarMenuService {
  menuList$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  constructor() {}

  setMenu(data: any[]) {
    const cData: any[] = clone(data);
    this.menuList$.next(cData);
  }
}
