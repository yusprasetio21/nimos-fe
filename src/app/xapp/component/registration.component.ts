import { Organization } from './../domain/organization';
import { AuthModel } from 'src/app/modules/auth/models/auth.model';
import { Instansi } from './../../modules/auth/models/instansi.model';
import { PagedResponse } from './../../core/types';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Subscription, catchError } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MoreComponent } from './_more.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { User } from '../domain/user';

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html'
})
export class RegistrationComponent extends MoreComponent implements OnInit {
    model: any;

    categoryOrgOptions: SelectItem[];
    organizationOptions: SelectItem[];

    isMandiri = false;

    constructor(
        private fb: FormBuilder,
        //more
        confirmationService: ConfirmationService,
        http: HttpClient,
        //base
        router: Router,
        messageService: MessageService,
        spinnerService: NgxSpinnerService,
        private cdr: ChangeDetectorRef
    ) {
        super(confirmationService, http, router, messageService, spinnerService);
    }

    ngOnInit(): void {
        // this.model = this.layout.getConfig();
        // this.router.navigate(['/login']);
        this.createDataForm(new User());

        this.categoryOrgOptions = [];
        this.categoryOrgOptions.push({ label: '- pilih kategori? -', value: null });
        this.categoryOrgOptions.push({ label: 'Instansi Pemerintah', value: Organization.CAT_PEMERINTAH });
        this.categoryOrgOptions.push({ label: 'BUMN', value: Organization.CAT_BUMN });
        this.categoryOrgOptions.push({ label: 'Perusahaan Swasta', value: Organization.CAT_SWASTA });
        this.categoryOrgOptions.push({ label: 'Universitas', value: Organization.CAT_UNIV });
        this.categoryOrgOptions.push({ label: 'Non Government Organization (NGO)', value: Organization.CAT_NGO });
        this.categoryOrgOptions.push({ label: 'Pengamatan Mandiri', value: Organization.CAT_MANDIRI });
    }

    createDataForm(data: User) {
        if (data == null) data = new User();
        this.dataForm = this.fb.group({
            id: new FormControl(data.id),
            name: new FormControl(data.name, Validators.required),
            phone: new FormControl(data.phone, Validators.required),
            email: new FormControl(data.email, [Validators.required, Validators.email]),
            email_organization: new FormControl(data.email_organization, Validators.email),
            category: new FormControl(data.category),
            organization_id: new FormControl(data.organization_id),
            password: new FormControl(data.password, Validators.required),
            password_confirmation: new FormControl(data.password_confirmation, Validators.required),
            agree: new FormControl(data.agree, Validators.requiredTrue),
            document: new FormControl('', [Validators.required]),
            fileSource: new FormControl('', [Validators.required]),
            category_org: new FormControl(data.category_org, Validators.required)
        });
    }

    onChangeCategoryOrg() {
        this.spinnerService.show();
        this.organizationOptions = [];

        if (this.dataForm.controls.category_org.value !== Organization.CAT_MANDIRI) {
            this.isMandiri = false;
            this.dataForm.patchValue({ category: User.CAT_ORGANIZATION });
            this._createDropdownList(
                'api/lists/organizations',
                new HttpParams().append('filter[category]', this.dataForm.controls.category_org.value),
                'long_name',
                'id',
                '- pilih instansi -',
                this.organizationOptions
            );
        } else {
            this.isMandiri = true;
            this.dataForm.patchValue({ category: User.CAT_PERSONAL });
            this.dataForm.patchValue({ email_organization: null, organization_id: null });
            this.spinnerService.hide();
        }
        console.log('>>>>' + JSON.stringify(this.dataForm.value));
    }

    save() {
        console.log('[' + this.dataForm.controls.password.value + ']');
        console.log('[' + this.dataForm.controls.password_confirmation.value + ']');
        if (this.dataForm.controls.password.value !== this.dataForm.controls.password_confirmation.value) {
            this._generateMsg('error', 'Error', 'Password and Password Confirmation is not equal');
        } else if (
            this.dataForm.controls.category_org.value !== Organization.CAT_MANDIRI &&
            (this.dataForm.controls.organization_id.value === null ||
                this.dataForm.controls.email_organization.value === null)
        ) {
            this._generateMsg('error', 'Error', 'Instansi and Email Instansi should be not null');
        } else {
            const formData = new FormData();
            formData.append('document', this.dataForm.controls.fileSource.value);
            formData.append('name', this.dataForm.controls.name.value);
            formData.append('email', this.dataForm.controls.email.value);
            formData.append('email_organization', this.dataForm.controls.email_organization.value);
            formData.append('organization_id', this.dataForm.controls.organization_id.value);
            formData.append('phone', this.dataForm.controls.phone.value);
            formData.append('category', this.dataForm.controls.category.value);
            formData.append('password', this.dataForm.controls.password.value);
            formData.append('password_confirmation', this.dataForm.controls.password_confirmation.value);

            const httpUrl = `${environment.app.apiUrl}/api/register`;
            this.submitted = true;
            if (this.dataForm.valid) {
                this.spinnerService.show();
                //const datas = [...this.getDatas()];
                this.http.post(httpUrl, formData).subscribe({
                    next: (resp: PagedResponse<User>) => {
                        this.createDataForm(new User());
                        this.isMandiri = false;
                        this._generateMsg(
                            'success',
                            'Successful',
                            'Data is saved successfully. Please check your email for a verification link.'
                        );
                        this.spinnerService.hide();
                    },
                    error: err => {
                        this._errorHandler(err);
                    }
                });
            }
        }
    }

    onFileChange(event: any) {
        if (event.target.files.length > 0) {
            //const name = event.target.files[0].name;
            //const type = event.target.files[0].type;
            const size = event.target.files[0].size;
            //const modifiedDate = event.target.files[0].lastModifiedDate;
            //console.log(size);
            if (size > 500000) {
                event.target.value = '';
                this._generateMsg('error', 'Error', 'File upload size is more than 500kb');
            } else {
                const file = event.target.files[0];
                this.dataForm.patchValue({
                    fileSource: file
                });
            }
        }
    }

    protected getSelectedDatas(): any[] {
        throw new Error('Method not implemented.');
    }
    protected setSelectedDatas(datas: any) {
        throw new Error('Method not implemented.');
    }
    protected generateStr(event: any) {
        throw new Error('Method not implemented.');
    }
    protected getDatas(): any[] {
        throw new Error('Method not implemented.');
    }
    protected setDatas(datas: any[]): void {
        throw new Error('Method not implemented.');
    }

    protected updateTableDisplay(datas: any[], req: any, resp: any) {
        throw new Error('Method not implemented.');
    }
}
