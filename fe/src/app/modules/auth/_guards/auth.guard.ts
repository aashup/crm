// Angular
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, CanActivateChild } from '@angular/router';
import { TokenStorageService } from '../../core/token-storage.service';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private tokenStorageService: TokenStorageService, private router: Router) {}

  private navigateToLogin(state: RouterStateSnapshot): void {
    this.router.navigate(['/auth/login'], {
      queryParams: { forwardUrl: state.url, ...state.root.queryParams },
    });
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isLoggedIn = this.tokenStorageService.isAuth;
    if (!isLoggedIn) {
      this.navigateToLogin(state);
    }
    return isLoggedIn;
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isLoggedIn = this.tokenStorageService.isAuth;
    if (!isLoggedIn) {
      this.navigateToLogin(state);
    }
    return isLoggedIn;
  }
}
