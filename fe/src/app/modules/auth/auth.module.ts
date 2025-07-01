import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { AuthComponent } from './auth.component';
import { TranslationModule } from '../i18n/translation.module';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { VrfcnMessageComponent } from './components/email-vrfcn-message/vrfcn-message.component';
import { MatCardModule } from '@angular/material/card';
import { EmailVerificationSuccessMessageComponent } from './components/email-verified-success/email-verification-success-message';

@NgModule({
  declarations: [
    LoginComponent,
    RegistrationComponent,
    ResetPasswordComponent,
    ForgotPasswordComponent,
    AuthComponent,
    VrfcnMessageComponent,
    EmailVerificationSuccessMessageComponent

  ],
  imports: [
    CommonModule,
    TranslationModule,
    AuthRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
     MatInputModule, 
     MatButtonModule, 
     MatIconModule,
     MatSelectModule,
     MatCardModule, 
    
  ],
})
export class AuthModule {}
