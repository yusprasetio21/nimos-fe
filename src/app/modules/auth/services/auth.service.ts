import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { map, catchError, switchMap, finalize } from 'rxjs/operators';
import { UserModel } from '../models/user.model';
import { AuthModel } from '../models/auth.model';
import { AuthHTTPService } from './auth-http';
import { environment } from 'src/environments/environment';
import { Router, RouterStateSnapshot } from '@angular/router';

export type UserType = UserModel | undefined;

@Injectable({
    providedIn: 'root'
})
export class AuthService implements OnDestroy {
    // private fields
    private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
    private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;
    private userLocalStorageKey = `${environment.appVersion}-currentUser`;

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

    constructor(private authHttpService: AuthHTTPService, private router: Router) {
        this.isLoadingSubject = new BehaviorSubject<boolean>(false);
        this.currentUserSubject = new BehaviorSubject<UserType>(undefined);
        this.currentUser$ = this.currentUserSubject.asObservable();
        this.isLoading$ = this.isLoadingSubject.asObservable();
        const subscr = this.getUserByToken().subscribe();
        this.unsubscribe.push(subscr);
    }

    // public methods
    login(username: string, password: string): Observable<UserType> {
        this.isLoadingSubject.next(true);
        return this.authHttpService.login(username, password).pipe(
            map((auth: string) => {
                const response = JSON.parse(JSON.stringify(auth));
                const authModel = new AuthModel();
                authModel.accessToken = response.access_token;
                authModel.refreshToken = response.refresh_token;
                authModel.tokenType = response.token_type;
                authModel.expiresIn = new Date(response.expires_in * 1000);
                const result = this.setAuthFromLocalStorage(authModel);
                return result;
            }),
            switchMap(() => this.getUserByToken()),
            catchError(err => {
                console.error('err', err);
                return of(undefined);
            }),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    logout() {
        const token: string = this.getAuthFromLocalStorage()?.accessToken ?? '';
        this.authHttpService.logout(token);
        localStorage.removeItem(this.authLocalStorageToken);
        localStorage.removeItem(this.userLocalStorageKey);
        //this.router.navigate(['/auth/login'], {
        this.router.navigate(['/index'], {
            queryParams: {}
        });
    }

    logoutGuard(state: RouterStateSnapshot) {
        const token: string = this.getAuthFromLocalStorage()?.accessToken ?? '';
        this.authHttpService.logout(token);
        localStorage.removeItem(this.authLocalStorageToken);
        localStorage.removeItem(this.userLocalStorageKey);
        console.log('state.url' + state.url);
        this.router.navigate(['/auth/login'], {
            //this.router.navigate(['/index'], {
            queryParams: { returnUrl: state.url }
        });
    }

    getUserByToken(): Observable<UserType> {
        const auth = this.getAuthFromLocalStorage();
        if (!auth || !auth.accessToken) {
            return of(undefined);
        }

        this.isLoadingSubject.next(true);
        return this.authHttpService.getUserByToken(auth.accessToken).pipe(
            map((user: UserType) => {
                if (user) {
                    this.currentUserSubject.next(user);
                    this.setUserFromLocalStorage(user);
                } else {
                    this.logout();
                }
                return user;
            }),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    // need create new user then login
    registration(user: UserModel): Observable<any> {
        this.isLoadingSubject.next(true);
        return this.authHttpService.createUser(user).pipe(
            map(() => {
                this.isLoadingSubject.next(false);
            }),
            switchMap(() => this.login(user.email, user.password)),
            catchError(err => {
                console.error('err', err);
                return of(undefined);
            }),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    forgotPassword(email: string): Observable<boolean> {
        this.isLoadingSubject.next(true);
        return this.authHttpService.forgotPassword(email).pipe(finalize(() => this.isLoadingSubject.next(false)));
    }

    refreshToken(token: string): Observable<AuthModel> {
        return this.authHttpService.refreshToken(token).pipe(
            map((auth: AuthModel) => {
                this.setAuthFromLocalStorage(auth);
                return auth;
            })
        );
    }

    // private methods
    private setAuthFromLocalStorage(auth: AuthModel): boolean {
        // store auth accessToken/refreshToken/expiresIn in local storage to keep user logged in between page refreshes
        // console.log(auth, auth.accessToken);
        if (auth && auth.accessToken) {
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

    private setUserFromLocalStorage(user: UserModel): boolean {
        if (user) {
            localStorage.setItem(this.userLocalStorageKey, JSON.stringify(user));
            return true;
        }
        return false;
    }

    private getUserFromLocalStorage(): UserModel | undefined {
        try {
            const lsValue = localStorage.getItem(this.userLocalStorageKey);
            if (!lsValue) {
                return undefined;
            }

            const userData = JSON.parse(lsValue);
            return userData;
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }

    ngOnDestroy() {
        this.unsubscribe.forEach(sb => sb.unsubscribe());
    }
}
