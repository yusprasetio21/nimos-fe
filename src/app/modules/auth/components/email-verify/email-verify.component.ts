import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-email-verify',
    templateUrl: './email-verify.component.html',
    styleUrls: ['./email-verify.component.scss']
})
export class EmailVerifyComponent implements OnInit, OnDestroy {
    message: string;
    hasError: boolean;
    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    private unsubscribe: Subscription[] = [];

    constructor(
        messageService: MessageService,
        private route: ActivatedRoute,
        private router: Router,
        protected http: HttpClient
    ) {
        this.unsubscribe.push(this.isLoading$.asObservable().subscribe());
    }

    ngOnInit(): void {
        const userId = this.route.snapshot.paramMap.get('userId');
        const expires = this.route.snapshot.queryParamMap.get('expires');
        const signature = this.route.snapshot.queryParamMap.get('signature');

        this.http
            .get(`${environment.app.apiUrl}/api/verify-email/${userId}/expires=${expires}?signature=${signature}`)
            .subscribe({
                next: () => {
                    this.message = 'Data is saved successfully';
                    this.hasError = false;
                    this.isLoading$.next(true);
                },
                error: err => {
                    this.message = err?.error?.message;
                    this.hasError = true;
                    this.isLoading$.next(true);
                }
            });
    }

    ngOnDestroy() {
        this.unsubscribe.forEach(sb => sb.unsubscribe());
    }
}
