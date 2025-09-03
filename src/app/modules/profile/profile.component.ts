import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { UserModel } from '../auth/models/user.model';
import { BaseComponent } from 'src/app/base.component';
@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html'
})
export class ProfileComponent extends BaseComponent implements OnInit {
    constructor(private http: HttpClient, private router: Router) {
        super();
    }
    user: UserModel;

    ngOnInit(): void {
        this.user = this.getUserFromLocalStorage() as UserModel;
    }

    editProfile() {
        console.log(this.user.email);
        this.router.navigate(['crafted/pages/profile/profildetail']);
    }

    getRouter(): Router {
        return this.router;
    }
}
