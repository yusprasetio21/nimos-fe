import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { AuthModel } from './modules/auth/models/auth.model';
import { UserModel } from './modules/auth/models/user.model';

export abstract class BaseComponent {
    authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;
    userLocalStorageKey = `${environment.appVersion}-currentUser`;

    dataForm: FormGroup;
    showForm = false;

    async ReuquestAPI(method: string, url: string, body: any) {
        const auth: AuthModel = this.getAuthFromLocalStorage() as AuthModel;
        let response: any;
        if (method === 'GET') {
            response = await fetch(url, {
                method,
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + auth.accessToken },
                redirect: 'follow',
                referrerPolicy: 'no-referrer'
            });
        } else {
            response = await fetch(url, {
                method,
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + auth.accessToken },
                redirect: 'follow',
                referrerPolicy: 'no-referrer',
                body: JSON.stringify(body)
            });
        }
        return response.json();
    }

    getUserFromLocalStorage(): UserModel | undefined {
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

/**
 * Food data with nested structure.
 * Each node has a name and an optional list of children.
 */
 interface Observation {
    id:number;
    text: string;
    children?: Observation[];
  }

  /** Flat node with expandable and level information */
  interface ExampleFlatNode {
    expandable: boolean;
    text: string;
    level: number;
  }