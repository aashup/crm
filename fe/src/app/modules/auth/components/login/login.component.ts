import { Component, OnInit, OnDestroy, ChangeDetectorRef, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { UserModel } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent implements OnInit, OnDestroy {

  defaultAuth: any = {
    email: 'vijay@xtrox.com',
    password: 'Vijay@123',
  };
  loginForm: FormGroup;
  hasError: boolean;
  returnUrl: string;
  isLoading$: Observable<boolean>;

  private unsubscribe: Subscription[] = []; 

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title
  ) {
    this.isLoading$ = this.authService.isLoading$;
    // redirect to home if already logged in
    // if (this.authService.currentUserValue) {
    //   this.router.navigate(['/']);
    // }
  }
  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
  ngOnInit(): void {
    this.titleService.setTitle('Login');
    this.initForm();
   
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'.toString()] || '/';
  }

 
  get f() {
    return this.loginForm.controls;
  }

  initForm() {
    this.loginForm = this.fb.group({
      email: [
        this.defaultAuth.email,
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.minLength(3),
          Validators.maxLength(320), // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
        ]),
      ],
      password: [
        this.defaultAuth.password,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ]),
      ],
    });
  }
  signUp() {
    this.titleService.setTitle("Registration")
    this.router.navigate(['/auth/registration']);
  }

  submit() {
    this.hasError = false;
    this.authService.isLoadingSubject.next(true);
    const loginSubscr = this.authService
      .login(this.f.email.value, this.f.password.value)
      .subscribe({
        next : (data) => {
          // if (this.form.remember_me) {
          //   // this.storage.setItem('loginCredentials', this.form.value)
          // } else {
          //   // this.storage.removeItem('loginCredentials')
          // }
          this.router.navigate(['/']);
        },
        error : (e) => {
          this.authService.isLoadingSubject.next(false);
        },
        complete : () => {
          this.authService.isLoadingSubject.next(false);
        }

      });
    this.unsubscribe.push(loginSubscr);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
