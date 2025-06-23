import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { first } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';

enum ErrorStates {
  NotSubmitted,
  HasError,
  NoError,
}

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
    standalone: false
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  errorState: ErrorStates = ErrorStates.NotSubmitted;
  errorStates = ErrorStates;
  isLoading$: Observable<boolean>;
  emailSent = false;
  error:string
  private unsubscribe: Subscription[] = []; 
  constructor(private fb: FormBuilder, private authService: AuthService,private titleService: Title) {
    this.isLoading$ = this.authService.isLoading$;
  }

  ngOnInit(): void {
    this.titleService.setTitle('Forgot Password');
    this.initForm();
  }

  initForm() {
    
    this.forgotPasswordForm = this.fb.group({
      email: ["",
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.minLength(3),
          Validators.maxLength(320), 
        ]),
      ],
    });
  }

  submit() {
    this.errorState = ErrorStates.NotSubmitted;
    this.authService.isLoadingSubject.next(true);
    const forgotPasswordSubscr = this.authService
      .forgotPassword(this.forgotPasswordForm.value.email)
      .subscribe({
        next: (res) => {
          this.errorState = ErrorStates.NoError;
          this.forgotPasswordForm.reset();
          this.emailSent = true;
        },
        error: (err) => {
          this.errorState = ErrorStates.HasError;
          this.error=err.error.message
          this.authService.isLoadingSubject.next(false);
        },
        complete: () => {
          this.authService.isLoadingSubject.next(false);
        },
      });
    this.unsubscribe.push(forgotPasswordSubscr);
  }
}
