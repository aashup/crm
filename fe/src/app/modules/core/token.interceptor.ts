import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { TokenStorageService } from './token-storage.service';
import { SnackBarService } from './snack-bar.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private tokenStorageService: TokenStorageService,
    private router: Router,
    public snackBar: SnackBarService
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const headers: any = {};
    if (!request.headers.get('X-Dev')) {
      headers['Content-Type'] = 'application/json';
    }
    if (this.tokenStorageService.isAuth && !request.headers.get('X-Auth')) {
      headers['Authorization'] =
        `Bearer ${this.tokenStorageService.accessToken}`;
    }
    const jsonReq = request.clone({
      setHeaders: headers,
    });
    return next.handle(jsonReq).pipe(
      tap({
        next: (data) => {

        },
        error: (error) => {
          if (error.status == 401) {
            this.snackBar.openSnackBar(error.error && error.error.errors);
            this.tokenStorageService.clearToken();
            this.router.navigate(['auth/login']);
          }
        },
      })
    );
  }
}
