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
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.isLoading$ = this.authService.isLoading$;
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || ''; // Token URL se le rahe hain
    this.initForm();
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.resetPasswordForm.controls;
  }

  initForm() {
    this.resetPasswordForm = this.fb.group({
      token: [this.token, Validators.required],
      password: ["",
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(20),
        ]),
      ],
      confirmPassword: ["",
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(20),
        ]),
      ],
    });
  }

  submit() {
    if (this.resetPasswordForm.invalid) {
      this.errorState = ErrorStates.HasError;
      return;
    }

    const payload = {
      token: this.f['token'].value,
      password: this.f['password'].value,
      confirmPassword: this.f['confirmPassword'].value,
    };

    this.authService.resetPassword(payload).subscribe({
      next: () => {
        this.errorState = ErrorStates.NoError;
        this.router.navigate(['/login']); // Reset ke baad login page par redirect
      },
      error: () => {
        this.errorState = ErrorStates.HasError;
      },
    });
  }
}