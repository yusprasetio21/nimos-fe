import { MessageService } from 'primeng/api';
import { EmailVerifyComponent } from './components/email-verify/email-verify.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ToastModule } from 'primeng/toast';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { LogoutComponent } from './components/logout/logout.component';
import { AuthComponent } from './auth.component';
import { TranslationModule } from '../i18n/translation.module';

@NgModule({
    declarations: [
        LoginComponent,
        RegistrationComponent,
        ForgotPasswordComponent,
        LogoutComponent,
        AuthComponent,
        ResetPasswordComponent,
        EmailVerifyComponent
    ],
    imports: [
        ToastModule,
        CommonModule,
        TranslationModule,
        AuthRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule
    ],
    providers: [MessageService]
})
export class AuthModule {}
