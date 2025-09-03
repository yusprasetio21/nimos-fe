import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ErrorHandler } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { UserModel } from '../../auth/models/user.model';
import { BaseComponent } from 'src/app/base.component';
import { AuthModel } from '../../auth/models/auth.model';
import { Instansi } from '../../auth/models/instansi.model';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
    selector: 'app-password-edit',
    templateUrl: './change-password.component.html',
    providers: [MessageService, ConfirmationService]
})
export class ChangePasswordComponent extends BaseComponent implements OnInit, ErrorHandler {
    //Field
    previousPassword: string;
    newPassword: string;
    repeatPassword: string;

    auth: AuthService;

    user: UserModel;

    // variable - default false
    show = false;

    constructor(private route: ActivatedRoute, private fb: FormBuilder, private messageService: MessageService) {
        super();
    }

    handleError(error: any): void {
        console.log('Error => ' + error);
    }

    get f() {
        return this.dataForm.controls;
    }

    ngOnInit(): void {
        this.createDataForm(); //declare formgroup
        this.user = this.getUserFromLocalStorage() as UserModel;
    }

    createDataForm() {
        this.dataForm = this.fb.group({
            previousPassword: new FormControl(''),
            newPassword: new FormControl(''),
            repeatPassword: new FormControl('')
        });
    }

    async save() {
        if (this.f.newPassword.value === this.f.repeatPassword.value) {
            const data = [
                {
                    previousPassword: this.f.previousPassword.value,
                    newPassword: this.f.newPassword.value
                }
            ];
            this.ReuquestAPI('PUT', `${environment.app.apiUrl}/api/profiles/changePassword/` + this.user.id, data).then(
                response => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: response.message,
                        life: 3000
                    });
                }
            );
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Failed',
                detail: 'New password and repeat password not same',
                life: 3000
            });
        }
    }
}
