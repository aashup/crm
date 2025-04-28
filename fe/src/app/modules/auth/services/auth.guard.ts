import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { TokenStorageService } from '../../core/token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(
    private tokenStorageService: TokenStorageService,
    private router: Router
  ) {}

  private navigateToLogin(state: RouterStateSnapshot): void {
    this.router.navigate(['/auth/login'], {
      queryParams: { forwardUrl: state.url, ...state.root.queryParams },
    });
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const isLoggedIn = this.tokenStorageService.isAuth;
    if (!isLoggedIn) {
      this.navigateToLogin(state);
    }
    return isLoggedIn;
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const isLoggedIn = this.tokenStorageService.isAuth;
    if (!isLoggedIn) {
      this.navigateToLogin(state);
    }
    return isLoggedIn;
  }
}
