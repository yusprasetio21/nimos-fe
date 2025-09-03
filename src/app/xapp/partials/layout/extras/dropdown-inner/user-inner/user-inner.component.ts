import { environment } from 'src/environments/environment';
import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { TranslationService } from '../../../../../../modules/i18n';
import { AuthService, UserType } from '../../../../../../modules/auth';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-user-inner',
    templateUrl: './user-inner.component.html'
})
export class UserInnerComponent implements OnInit, OnDestroy {
    @HostBinding('class')
    class = `menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px`;
    @HostBinding('attr.data-kt-menu') dataKtMenu = 'true';

    language: LanguageFlag;
    user$: Observable<UserType>;
    langs = languages;
    unsubscribe: Subscription[] = [];

    constructor(
        private auth: AuthService,
        private translationService: TranslationService,
        private spinnerService: NgxSpinnerService,
        private http: HttpClient
    ) {}

    ngOnInit(): void {
        this.user$ = this.auth.currentUserSubject.asObservable();
        this.setLanguage(this.translationService.getSelectedLanguage());
    }

    logout() {
        this.auth.logout();
        //document.location.reload();
    }

    /*selectLanguage(lang: string) {
        this.translationService.setLanguage(lang);
        this.setLanguage(lang);
        document.location.reload();
    }*/

    selectLanguage(lang: string) {
        this.spinnerService.show();
        this.http.get(`${environment.app.apiUrl}/api/lists/parameter-texts?filter[lang]=${lang}`).subscribe({
            next: response => {
                console.log('resp lang: ' + JSON.stringify(response));
                const params = response as any[];
                this.translationService.setLocalStorage(params, lang);
                this.spinnerService.hide();
                document.location.reload();
            },
            error: err => {
                //this._errorHandler(err);
            }
        });

        this.translationService.setLanguage(lang);
        this.setLanguage(lang);
    }

    setLanguage(lang: string) {
        this.langs.forEach((language: LanguageFlag) => {
            if (language.lang === lang) {
                language.active = true;
                this.language = language;
            } else {
                language.active = false;
            }
        });
    }

    ngOnDestroy() {
        this.unsubscribe.forEach(sb => sb.unsubscribe());
    }
}

interface LanguageFlag {
    lang: string;
    name: string;
    flag: string;
    active?: boolean;
}

const languages = [
    {
        lang: 'en',
        name: 'English',
        flag: './assets/media/flags/united-states.svg'
    },
    {
        lang: 'id',
        name: 'Indonesia',
        flag: './assets/media/flags/indonesia.svg'
    }
];
