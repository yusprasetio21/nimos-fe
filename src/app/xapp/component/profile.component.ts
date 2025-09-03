import { BehaviorSubject, Subscription } from 'rxjs';
import { Organization } from './../domain/organization';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { BaseComponent } from '../component/_base.component';

import { environment } from 'src/environments/environment';
import { MessageService, ConfirmationService, SelectItem } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { User } from '../domain/user';

@Component({
    templateUrl: './profile.component.html',
    encapsulation: ViewEncapsulation.None
})
export class ProfileComponent extends BaseComponent implements OnInit {
    dataFormPassword: FormGroup;
    dataFormProfile: FormGroup;
    uploadedFiles: any[] = [];
    uploadUrl: string;
    photoUrl: string;

    user: User = new User();
    organization: Organization = new Organization();
    state$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    unsubscribe: Subscription[] = [];

    org_internal: string;
    org_country = 'Indonesia';
    org_category: string;

    private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;
    access: any;

    constructor(
        protected confirmationService: ConfirmationService,
        protected http: HttpClient,
        private fb: FormBuilder,
        router: Router,
        messageService: MessageService,
        spinnerService: NgxSpinnerService
    ) {
        super(router, messageService, spinnerService);
        this.unsubscribe.push(this.state$.asObservable().subscribe());

        //this.uploadUrl = `${environment.DOMAIN_BACKEND_FILE}/users/photo/upload`;
        //this.photoUrl = `${environment.DOMAIN_BACKEND_ASSETS}/photoProfile/0/profile-male.jpg`;
    }

    ngOnInit() {
        const lsValue = localStorage.getItem(this.authLocalStorageToken);
        if (!lsValue) {
            return undefined;
        }
        this.access = JSON.parse(lsValue);
        console.log(JSON.parse(lsValue));

        this.createDataPasswordForm();
        this.http.get(`${environment.app.apiUrl}/api/profile`).subscribe({
            next: data => {
                console.log(JSON.stringify(data));
                this.user = data as User;
                //if (user.photoUrl) this.photoUrl = `${environment.app.apiUrl}/${user.photoUrl}`;

                let org = new Organization();
                if (this.user.organization) {
                    org = this.user.organization;
                    this.user.organization_id = org.id;
                    org.country_id = 'Indonesia';
                    this.org_internal =
                        org.is_oscar === true ? 'Oscar Supervising organization' : 'Local Supervising organization';
                    switch (org.category) {
                        case Organization.CAT_PEMERINTAH: {
                            this.org_category = 'Instansi Pemerintah';
                            break;
                        }
                        case Organization.CAT_BUMN: {
                            this.org_category = 'BUMN';
                            break;
                        }
                        case Organization.CAT_SWASTA: {
                            this.org_category = 'Perusahaan Swasta';
                            break;
                        }
                        case Organization.CAT_UNIV: {
                            this.org_category = 'Universitas';
                            break;
                        }
                        case Organization.CAT_NGO: {
                            this.org_category = 'Non Government Organization (NGO)';
                            break;
                        }
                        case Organization.CAT_MANDIRI: {
                            this.org_category = 'Pengamatan Mandiri';
                            break;
                        }
                    }
                } else {
                    org.long_name = '-';
                    org.short_name = '-';
                    this.org_internal = '-';
                    this.org_country = '-';
                    this.org_category = '-';
                }
                console.log('this.user' + JSON.stringify(this.user));
                this.organization = org;
                this.createDataProfileForm(this.user);
                this.spinnerService.hide();
                this.state$.next(true);
            },
            error: err => {
                this._errorHandler(err);
            }
        });
    }

    saveProfile() {
        this.spinnerService.show();
        this.http
            .put(`${environment.app.apiUrl}/api/users/${this.user.id}`, JSON.stringify(this.dataFormProfile.value))
            .subscribe({
                next: data => {
                    const user = data as any;
                    user.phone = user.phone?.number;
                    this.createDataProfileForm(user);
                    this._generateMsg('success', 'Success Message', 'Data is saved successfully');
                    this.spinnerService.hide();
                },
                error: err => {
                    this._errorHandler(err);
                }
            });
    }

    changePassword() {
        this.spinnerService.show();
        if (this.dataFormPassword.controls.newPassword.value === this.dataFormPassword.controls.repeatPassword.value) {
            this.http
                .put(
                    `${environment.app.apiUrl}/api/profiles/changePassword/${this.user.id}`,
                    JSON.stringify(this.dataFormPassword.value)
                )
                .subscribe({
                    next: data => {
                        this.createDataPasswordForm();
                        this._generateMsg('success', 'Success Message', 'Password is changed successfully');
                        this.spinnerService.hide();
                    },
                    error: err => {
                        this._errorHandler(err);
                    }
                });
        } else {
            this._generateMsg('error', 'Error Message', 'New password and confirm do not match');
            this.spinnerService.hide();
        }
    }

    createDataPasswordForm() {
        const dataPassword = new ChangePassword();
        this.dataFormPassword = this.fb.group({
            previousPassword: new FormControl(dataPassword.previousPassword, Validators.required),
            newPassword: new FormControl(dataPassword.newPassword, Validators.required),
            repeatPassword: new FormControl(dataPassword.repeatPassword, Validators.required)
        });
    }

    createDataProfileForm(data: User) {
        this.dataFormProfile = this.fb.group({
            id: new FormControl(data.id, Validators.required),
            name: new FormControl(data.name, Validators.required),
            phone: new FormControl(data.phone, Validators.required),
            email: new FormControl(data.email, Validators.required),
            email_organization: new FormControl(data.email_organization),
            is_active: new FormControl(data.is_active, Validators.required),
            category: new FormControl(data.category, Validators.required),
            organization_id: new FormControl(data.organization_id, Validators.required)
        });
        console.log('dataFormProfile: ' + JSON.stringify(this.dataFormProfile.value));
    }

    public validateFileSize($event: any, maxFileSize: number): void {
        if ($event.files[0].size > maxFileSize) {
            this._generateMsg('error', 'Error Message', 'Max filesize is 1 MB');
            this.spinnerService.hide();
        }
    }

    /*onUpload(event) {
        this.spinnerService.show();
        this.photoUrl = `${environment.DOMAIN_BACKEND_ASSETS}/${event.originalEvent.body.photoUrl}`;
        this._generateMsg('success', 'Success Message', 'File uploaded successfully');
        this.spinnerService.hide();
    }

    onError(event) {
        const err = new HttpErrorResponse({
            error: event.error.error,
            status: event.error.status,
            statusText: event.error.statusText
        });

        this._errorHandler(err);
    }*/
}

export class ChangePassword {
    previousPassword: string;
    newPassword: string;
    repeatPassword: string;
}
