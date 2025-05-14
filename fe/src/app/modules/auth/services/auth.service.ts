import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { map, catchError, switchMap, finalize, tap } from 'rxjs/operators';
import { UserModel } from '../models/user.model';
import { AuthModel } from '../models/auth.model';
import { AuthHTTPService } from './auth-http';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { TokenStorageService } from '../../core/token-storage.service';

export type UserType = UserModel | undefined;

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;

  // public fields
  currentUser$: Observable<UserType>;
  isLoading$: Observable<boolean>;
  currentUserSubject: BehaviorSubject<UserType>;
  isLoadingSubject: BehaviorSubject<boolean>;

  get currentUserValue(): UserType {
    return this.currentUserSubject.value;
  }

  set currentUserValue(user: UserType) {
    this.currentUserSubject.next(user);
  }

  constructor(
    private authHttpService: AuthHTTPService,
    private http: HttpClient,
    public token: TokenStorageService,
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<UserType>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoading$ = this.isLoadingSubject.asObservable();
    const subscr = this.getUserByToken().subscribe();
    this.unsubscribe.push(subscr);
  }

  // public methods
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${environment.API_ENDPOINT}/login`, {email, password}).pipe(
      tap((data: any) => {
        this.token.storeToken(data.data);
      }),
    );
  }

  logout(user: any) {
    return this.http.post(`${environment.API_ENDPOINT}/logout`, user);
  }
  getCurrentUser(): any {
    const user = localStorage.getItem('user-data'); 
    return user ? JSON.parse(user) : null;
  }
  getUserByToken(): Observable<UserType> {
    const auth = this.getAuthFromLocalStorage();
    if (!auth || !auth.authToken) {
      return of(undefined);
    }

    this.isLoadingSubject.next(true);
    return this.authHttpService.getUserByToken(auth.authToken).pipe(
      map((user: UserType) => {
        if (user) {
          this.currentUserSubject.next(user);
        } else {
          this.logout(null);
        }
        return user;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  // need create new user then login
registration(user: UserModel): Observable<any> {  
  this.isLoadingSubject.next(true);
  return this.http.post(`${environment.API_ENDPOINT}/register`, user).pipe(
    tap((data: any) => {
      console.log('Registration successful:', data);
    }),
    switchMap(() => this.login(user.email, user.password)), // Optional: If you still want to log in after registration
    catchError((err) => {
      console.error('Registration error:', err);
      return of(undefined);
    }),
    finalize(() => this.isLoadingSubject.next(false))
  );
}

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${environment.API_ENDPOINT}/forgot-password`, {email});
  }
  resetPassword(payload: { token: string; password: string; cpassword: string }): Observable<any> {
    return this.http.post(`${environment.API_ENDPOINT}/reset-password`, payload);
  }
  // private methods
  private setAuthFromLocalStorage(auth: AuthModel): boolean {
    // store auth authToken/refreshToken/epiresIn in local storage to keep user logged in between page refreshes
    if (auth && auth.authToken) {
      localStorage.setItem(this.authLocalStorageToken, JSON.stringify(auth));
      return true;
    }
    return false;
  }

  private getAuthFromLocalStorage(): AuthModel | undefined {
    try {
      const lsValue = localStorage.getItem(this.authLocalStorageToken);
      if (!lsValue) {
        return undefined;
      }

      const authData = JSON.parse(lsValue);
      return authData;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
