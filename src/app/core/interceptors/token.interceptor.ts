import { UserModel } from './../../modules/auth/models/user.model';
import { AuthService } from './../../modules/auth/services/auth.service';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class TokenInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private authService: AuthService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const accessToken = (this.authService.currentUserValue as UserModel).accessToken;
        console.log(accessToken);
        let authReq = req;

        if (accessToken) {
            authReq = this.addTokenHeader(req, accessToken);
        }

        return next.handle(authReq).pipe(error => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                return this.handle401Error(authReq, next);
            }

            return throwError(error);
        });
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            const refreshToken = (this.authService.currentUserValue as UserModel).refreshToken;

            if (refreshToken)
                return this.authService.refreshToken(refreshToken).pipe(
                    switchMap((token: any) => {
                        this.isRefreshing = false;
                        this.refreshTokenSubject.next(token.accessToken);

                        return next.handle(this.addTokenHeader(request, token.accessToken));
                    }),
                    catchError(err => {
                        this.isRefreshing = false;

                        this.authService.logout();
                        throw new Error(err);
                    })
                );
        }

        return this.refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(token => next.handle(this.addTokenHeader(request, token)))
        );
    }

    private addTokenHeader(request: HttpRequest<any>, token: string) {
        return request.clone({
            headers: request.headers.set('Authorization', `Bearer ${token}`)
        });
    }
}
