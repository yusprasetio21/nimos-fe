import { environment } from 'src/environments/environment';
import { Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import {
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
    HttpEvent,
    HttpErrorResponse,
    HttpHeaders
} from '@angular/common/http';

import { Constant } from '../domain/constant';
import { Error } from '../domain/error';
import { LocaleService } from '../service/locale.service';
import { map, tap } from 'rxjs/operators';
import { AuthModel } from 'src/app/modules/auth/models/auth.model';

/**
 * `HeaderHttpInterceptor` which handle access_token when request and response
 */
@Injectable()
export class HeaderHttpInterceptor implements HttpInterceptor {
    authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;

    constructor(private localeService: LocaleService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        console.log('HeaderHttpInterceptor: ' + req);

        const auth: AuthModel = this.getAuthFromLocalStorage() as AuthModel;
        const locale = this.localeService.getLocale();

        req = this.cloneRequest(req, auth.accessToken, locale);

        return next.handle(req).pipe(
            tap({
                next: event => {
                    if (event instanceof HttpResponse) {
                        //this.setLocalStorage(event);
                    }
                },
                error: errAccess => {
                    if (errAccess.statusText === 'Unknown Error') {
                        errAccess = this.changeToUnKnownError(errAccess);
                    }
                    return throwError(() => errAccess);
                }
            })
        );
    }

    cloneRequest(req: HttpRequest<any>, token: string | null, locale: string) {
        // Be careful not to overwrite an existing header of the same name.
        //if (token !== null && !req.headers.has(Constant.AUTHORIZATION_HEADER)) {

        if (
            'POST' === req.method &&
            !req.url.endsWith('/documents') &&
            !req.url.endsWith('/ingest-metadata') &&
            !req.url.endsWith('/stations') &&
            !req.url.endsWith('/photo-galleries')
        ) {
            req = req.clone({
                headers: req.headers
                    .set(Constant.HEADER_AUTHORIZATION, 'Bearer ' + token)
                    .set(Constant.HEADER_ACCEPT_LANGUAGE, locale)
                    .set(Constant.HEADER_CONTENT_TYPE, Constant.MEDIA_TYPE_JSON),
                withCredentials: true //refer to https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
            });
        }
        if (
            'POST' === req.method &&
            (req.url.endsWith('/documents') ||
                req.url.endsWith('/ingest-metadata') ||
                req.url.endsWith('/stations') ||
                req.url.endsWith('/photo-galleries'))
        ) {
            req = req.clone({
                headers: req.headers
                    .set(Constant.HEADER_AUTHORIZATION, 'Bearer ' + token)
                    .set(Constant.HEADER_ACCEPT_LANGUAGE, locale),
                withCredentials: true //refer to https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
            });
        }
        if ('PUT' === req.method) {
            req = req.clone({
                headers: req.headers
                    .set(Constant.HEADER_AUTHORIZATION, 'Bearer ' + token)
                    .set(Constant.HEADER_ACCEPT_LANGUAGE, locale)
                    .set(Constant.HEADER_CONTENT_TYPE, Constant.MEDIA_TYPE_JSON),
                withCredentials: true //refer to https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
            });
        }
        if ('GET' === req.method || 'DELETE' === req.method || 'OPTIONS' === req.method) {
            req = req.clone({
                headers: req.headers
                    .set(Constant.HEADER_AUTHORIZATION, 'Bearer ' + token)
                    .set(Constant.HEADER_ACCEPT_LANGUAGE, locale),
                withCredentials: true //refer to https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
            });
        }

        //}
        return req;
    }

    changeToUnKnownError(err: any) {
        const error = new Error();
        error.key = 'Network';
        error.value = 'Connection Refused';
        err = new HttpErrorResponse({
            //error: JSON.stringify([error]),
            error: [error],
            headers: err.headers,
            status: err.status,
            statusText: err.statusText,
            url: err.url
        });
    }

    setLocalStorage(event: any) {
        //console.log("accessToken: "+event.headers.get(Constant.HEADER_ACCESS_TOKEN));
        //console.log("refreshToken: "+event.headers.get(Constant.HEADER_REFRESH_TOKEN));
        if (event.headers.get(Constant.HEADER_ACCESS_TOKEN)) {
            localStorage.setItem(Constant.HEADER_ACCESS_TOKEN, event.headers.get(Constant.HEADER_ACCESS_TOKEN));
        } else {
            //nop
        }
        if (event.headers.get(Constant.HEADER_REFRESH_TOKEN)) {
            localStorage.setItem(Constant.HEADER_REFRESH_TOKEN, event.headers.get(Constant.HEADER_REFRESH_TOKEN));
        } else {
            //nop
        }
    }

    getAuthFromLocalStorage(): AuthModel | undefined {
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
}
