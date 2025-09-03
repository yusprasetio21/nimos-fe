import { ConfirmationService, MessageService } from 'primeng/api';

import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/modules/auth';
import { Component, OnInit } from '@angular/core';
import { TranslationService } from 'src/app/modules/i18n';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subscription } from 'rxjs';
import { BaseComponent } from '../component/_base.component';

@Component({
    selector: 'app-layout0',
    templateUrl: './layout0.component.html',
    styleUrls: ['./layout0.component.scss']
})
export class Layout0Component extends BaseComponent implements OnInit {
    login: boolean;
    userLocalStorageKey = `${environment.appVersion}-currentUser`;
    language: LanguageFlag;
    langs = languages;

    constructor(
        private confirmationService: ConfirmationService,
        private http: HttpClient,

        router: Router,
        messageService: MessageService,
        spinnerService: NgxSpinnerService,
        private translationService: TranslationService
    ) {
        super(router, messageService, spinnerService);

        const lsValue = localStorage.getItem(this.userLocalStorageKey);
        if (lsValue) {
            console.log('LOGIIIIIIN TRUE');
            this.login = true;
        } else {
            console.log('LOGIIIIIIN FALSE');
            this.login = false;
        }
    }

    ngOnInit(): void {
        this.setLanguage(this.translationService.getSelectedLanguage());
    }

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
                this._errorHandler(err);
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
