import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';
import { UserModel } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
    //password: string;
    //password_confirmation: string;
    message: string;
    loginForm: FormGroup;
    hasError: boolean;
    returnUrl: string;
    isLoading: boolean;
    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    private unsubscribe: Subscription[] = [];

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router,
        protected http: HttpClient
    ) {
        this.unsubscribe.push(this.isLoading$.asObservable().subscribe(res => (this.isLoading = res)));
    }

    ngOnInit(): void {
        this.initForm();
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.loginForm.controls;
    }

    initForm() {
        this.loginForm = this.fb.group({
            token: [this.route.snapshot.paramMap.get('token')],
            email: [this.route.snapshot.queryParamMap.get('email')],
            password: [
                '',
                Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(100)])
            ],
            password_confirmation: [
                '',
                Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(100)])
            ]
        });
    }

    submit() {
        this.isLoading$.next(true);
        console.log(this.loginForm);
        this.hasError = false;
        if (this.f.password.value !== this.f.password_confirmation.value) {
            this.hasError = true;
            this.message = 'Password and Password Confirmation is not equal';
            this.isLoading$.next(false);
        } else {
            this.http.post(`${environment.app.apiUrl}/api/reset-password`, this.loginForm.value).subscribe({
                next: () => {
                    this.message = 'Data is saved successfully';
                    this.hasError = false;
                    this.isLoading$.next(false);
                },
                error: err => {
                    this.message = err.error.errors[0]?.value;
                    this.hasError = true;
                    this.isLoading$.next(false);
                }
            });
        }
    }

    ngOnDestroy() {
        this.unsubscribe.forEach(sb => sb.unsubscribe());
    }
}
