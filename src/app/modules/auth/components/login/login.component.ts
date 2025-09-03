import {
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectorRef,
    Renderer2,
    ViewChild,
    ElementRef,
    AfterViewInit
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { UserModel } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('togglePassword') togglePassword: ElementRef;
    @ViewChild('passwordInput') passwordInput: ElementRef;
    count = 0;

    isVerified: boolean;
    username: string;
    password: string;
    loginForm: FormGroup;
    hasError: boolean;
    returnUrl: string;
    isLoading$: Observable<boolean>;

    // private fields
    private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router,
        private renderer: Renderer2
    ) {
        this.isLoading$ = this.authService.isLoading$;
        // redirect to home if already logged in
        if (this.authService.currentUserValue) {
            this.router.navigate(['/']);
        }
    }

    ngOnInit(): void {
        this.isVerified = this.route.snapshot.queryParamMap.get('verified') === '1' ? true : false;

        this.initForm();
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'.toString()] || '/';
        //this.returnUrl = this.route.snapshot.queryParams['returnUrl'.toString()] || '/index';
        console.log('this.returnUrl: ' + this.returnUrl);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.loginForm.controls;
    }

    ngAfterViewInit(): void {
        this.renderer.listen(this.togglePassword.nativeElement, 'click', event => {
            this.count++;
            if (this.count % 2 !== 0) {
                this.renderer.removeClass(this.togglePassword.nativeElement, 'bi-eye-slash');
                this.renderer.addClass(this.togglePassword.nativeElement, 'bi-eye');
                this.renderer.setAttribute(this.passwordInput.nativeElement, 'type', 'text');
            } else {
                this.renderer.removeClass(this.togglePassword.nativeElement, 'bi-eye');
                this.renderer.addClass(this.togglePassword.nativeElement, 'bi-eye-slash');
                this.renderer.setAttribute(this.passwordInput.nativeElement, 'type', 'password');
            }
        });
    }

    initForm() {
        this.loginForm = this.fb.group({
            username: [
                this.username,
                Validators.compose([
                    Validators.required,
                    Validators.email,
                    Validators.minLength(3),
                    Validators.maxLength(320) // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
                ])
            ],
            password: [
                this.password,
                Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])
            ]
        });
    }

    submit() {
        this.hasError = false;
        const loginSubscr = this.authService
            .login(this.f.username.value, this.f.password.value)
            .pipe(first())
            .subscribe((user: UserModel | undefined) => {
                if (user) {
                    if ('/' === this.returnUrl) {
                        localStorage.setItem('organizationId',user.organization.id)
                        this.router.navigate(['dashboard']);
                    } else {
                        this.router.navigate([this.returnUrl]);
                    }
                } else {
                    //this.message = err?.error?.message;
                    this.hasError = true;
                }
            });
        this.unsubscribe.push(loginSubscr);
        this.isVerified = false;
    }

    ngOnDestroy() {
        this.unsubscribe.forEach(sb => sb.unsubscribe());
    }
}
