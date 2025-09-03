import { environment } from '../../../../environments/environment.prod';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CrudOperations } from './crud-operations.interface';

export abstract class CrudHTTPService<T, ID> implements CrudOperations<T, ID> {
    private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;
    private accessToken = JSON.parse(localStorage.getItem(this.authLocalStorageToken) as string).accessToken;
    private httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.accessToken}`
    });
    constructor(protected _http: HttpClient, protected _base: string) {}

    save(t: T): Observable<T> {
        return this._http.post<T>(this._base, t, { headers: this.httpHeaders });
    }

    update(id: ID, t: T): Observable<T> {
        return this._http.put<T>(this._base + '/' + id, t, { headers: this.httpHeaders });
    }

    findOne(id: ID): Observable<T> {
        return this._http.get<T>(this._base + '/' + id, { headers: this.httpHeaders });
    }

    findAll(query?: string): Observable<T> {
        return this._http.get<T>(`${this._base}${query === undefined ? '' : query}`, { headers: this.httpHeaders });
    }

    delete(id: ID): Observable<T> {
        return this._http.delete<T>(this._base + '/' + id, { headers: this.httpHeaders });
    }
}
