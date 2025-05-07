import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

enum ErrorStates {
  NotSubmitted,
  HasError,
  NoError,
}

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss'],
    standalone: false
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  errorState: ErrorStates = ErrorStates.NotSubmitted;
  errorStates = ErrorStates;
  isLoading$: Observable<boolean>;
  private token: string = '';

  // private fields
  private unsubscribe: Subscription[] = []; 
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.isLoading$ = this.authService.isLoading$;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.token = params.get('token') || ''; 
      console.log('Extracted Token:', this.token); 
    });
    
    this.initForm();
  }

  get f() {
    return this.resetPasswordForm.controls;
  }

  initForm() {
    this.resetPasswordForm = this.fb.group({
  
      password: ["",
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(20),
        ]),
      ],
      cpassword: ["",
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(20),
        ]),
      ],
    });
  }

  submit(event: Event): void {
    debugger
    console.log('Form Submitted:', this.resetPasswordForm.value);
    
    event.preventDefault();

    if (this.resetPasswordForm?.value.cpassword=== this.resetPasswordForm?.value.password) {
      console.log('Form Submitted:', this.resetPasswordForm.value);
      console.log({
        password: this.resetPasswordForm.value.password,
        cpassword: this.resetPasswordForm.value.cpassword,
        token: this.token
      })
      this.authService.resetPassword({
        password: this.resetPasswordForm.value.password,
        cpassword: this.resetPasswordForm.value.cpassword,
        token: this.token
      }).subscribe({
        next: (res) => {
          debugger;
          this.errorState = ErrorStates.NoError;
          this.resetPasswordForm.reset();
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.errorState = ErrorStates.HasError;
          this.authService.isLoadingSubject.next(false);
        },
        complete: () => {
          debugger;
          this.authService.isLoadingSubject.next(false);
        },
      });
      this.unsubscribe.push(this.authService.resetPassword({
        password: this.resetPasswordForm.value.password,
        cpassword: this.resetPasswordForm.value.cpassword,
        token: this.token
      }).subscribe());
    } else {
      console.log('Form is invalid');
    }
  }
}