// Localization is based on '@ngx-translate/core';
// Please be familiar with official documentations first => https://github.com/ngx-translate/core

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface Locale {
    lang: string;
    data: any;
}

const LOCALIZATION_LOCAL_STORAGE_KEY = 'language';
const LOCALIZATION_LABEL_STORAGE_KEY = 'label';
const LOCALIZATION_TOOLTIP_STORAGE_KEY = 'tooltip';

@Injectable({
    providedIn: 'root'
})
export class TranslationService {
    // Private properties
    private langIds: any = [];

    constructor(private translate: TranslateService) {
        // add new langIds to the list
        this.translate.addLangs(['en']);

        // this language will be used as a fallback when a translation isn't found in the current language
        this.translate.setDefaultLang('en');
    }

    loadTranslations(...args: Locale[]): void {
        const locales = [...args];

        locales.forEach(locale => {
            // use setTranslation() with the third argument set to true
            // to append translations instead of replacing them
            this.translate.setTranslation(locale.lang, locale.data, true);
            this.langIds.push(locale.lang);
        });

        // add new languages to the list
        this.translate.addLangs(this.langIds);
        this.translate.use(this.getSelectedLanguage());
    }

    /*setLanguage(lang: string) {
        const en = {
            contact: {
                name: 'Name'
            }
        };

        const id = {
            contact: {
                name: 'Nama'
            }
        };

        if (lang) {
            this.translate.use(this.translate.getDefaultLang());
            this.translate.use(lang);
            localStorage.setItem(LOCALIZATION_LOCAL_STORAGE_KEY, lang);

            if ('id' === lang) {
                localStorage.setItem(LOCALIZATION_LABEL_STORAGE_KEY, JSON.stringify(id));
            } else if ('en' === lang) {
                localStorage.setItem(LOCALIZATION_LABEL_STORAGE_KEY, JSON.stringify(en));
            }
        }
    }*/

    setLanguage(lang: string) {
        if (lang) {
            this.translate.use(this.translate.getDefaultLang());
            this.translate.use(lang);
        }
    }

    /**
     * Returns selected language
     */
    getSelectedLanguage(): any {
        return localStorage.getItem(LOCALIZATION_LOCAL_STORAGE_KEY) || this.translate.getDefaultLang();
    }

    setLocalStorage(params: any[], lang: string) {
        const stationLang = params.filter(val => val.module === 'station');
        const observationLang = params.filter(val => val.module === 'observation');
        const generalInfoLang = params.filter(val => val.module === 'generalInfo');
        const instrumentLang = params.filter(val => val.module === 'instrument');
        const coordinateLang = params.filter(val => val.module === 'coordinate');
        const statusLang = params.filter(val => val.module === 'status');
        const frequencyLang = params.filter(val => val.module === 'frequency');
        const maintenanceLang = params.filter(val => val.module === 'maintenance');
        const assuranceLang = params.filter(val => val.module === 'assurance');
        const dataGenerationLang = params.filter(val => val.module === 'dataGeneration');
        const samplingLang = params.filter(val => val.module === 'sampling');
        const processingLang = params.filter(val => val.module === 'processing');
        const reportingLang = params.filter(val => val.module === 'reporting');

        const myJsonLabel: any = {
            station: {},
            observation: {},
            generalInfo: {},
            instrument: {},
            coordinate: {},
            status: {},
            frequency: {},
            maintenance: {},
            assurance: {},
            dataGeneration: {},
            sampling: {},
            processing: {},
            reporting: {}
        };
        const myJsonTooltip: any = {
            station: {},
            observation: {},
            generalInfo: {},
            instrument: {},
            coordinate: {},
            status: {},
            frequency: {},
            maintenance: {},
            assurance: {},
            dataGeneration: {},
            sampling: {},
            processing: {},
            reporting: {}
        };

        stationLang.forEach(item => {
            myJsonLabel.station[item.code] = item.name;
            myJsonTooltip.station[item.code] = item.tooltip;
        });
        observationLang.forEach(item => {
            myJsonLabel.observation[item.code] = item.name;
            myJsonTooltip.observation[item.code] = item.tooltip;
        });
        generalInfoLang.forEach(item => {
            myJsonLabel.generalInfo[item.code] = item.name;
            myJsonTooltip.generalInfo[item.code] = item.tooltip;
        });
        coordinateLang.forEach(item => {
            myJsonLabel.coordinate[item.code] = item.name;
            myJsonTooltip.coordinate[item.code] = item.tooltip;
        });
        instrumentLang.forEach(item => {
            myJsonLabel.instrument[item.code] = item.name;
            myJsonTooltip.instrument[item.code] = item.tooltip;
        });
        coordinateLang.forEach(item => {
            myJsonLabel.coordinate[item.code] = item.name;
            myJsonTooltip.coordinate[item.code] = item.tooltip;
        });
        statusLang.forEach(item => {
            myJsonLabel.status[item.code] = item.name;
            myJsonTooltip.status[item.code] = item.tooltip;
        });
        frequencyLang.forEach(item => {
            myJsonLabel.frequency[item.code] = item.name;
            myJsonTooltip.frequency[item.code] = item.tooltip;
        });
        maintenanceLang.forEach(item => {
            myJsonLabel.maintenance[item.code] = item.name;
            myJsonTooltip.maintenance[item.code] = item.tooltip;
        });
        assuranceLang.forEach(item => {
            myJsonLabel.assurance[item.code] = item.name;
            myJsonTooltip.assurance[item.code] = item.tooltip;
        });
        dataGenerationLang.forEach(item => {
            myJsonLabel.dataGeneration[item.code] = item.name;
            myJsonTooltip.dataGeneration[item.code] = item.tooltip;
        });
        samplingLang.forEach(item => {
            myJsonLabel.sampling[item.code] = item.name;
            myJsonTooltip.sampling[item.code] = item.tooltip;
        });
        processingLang.forEach(item => {
            myJsonLabel.processing[item.code] = item.name;
            myJsonTooltip.processing[item.code] = item.tooltip;
        });
        reportingLang.forEach(item => {
            myJsonLabel.reporting[item.code] = item.name;
            myJsonTooltip.reporting[item.code] = item.tooltip;
        });

        if ('id' === lang) {
            myJsonLabel.contact = {
                NAME: 'Nama'
            };
            myJsonTooltip.contact = {
                NAME: 'Nama Tooltip'
            };

            myJsonLabel.home = {
                NEWS: 'Berita',
                ABOUT: 'Tentang Kami',
                CONTACT: 'Kontak',
                Register: 'Daftar',
                LATEST_NEWS: 'Berita Terakhir'
            };

            myJsonLabel.profile = {
                ORG_LONG_NAME: 'Nama Panjang',
                ORG_SHORT_NAME: 'Nama Pendek',
                ORG_CATEGORY: 'Kategori',
                ORG_COUNTRY: 'Negara',
                ORG_TYPE: 'Tipe',
                USER_NAME: 'Nama',
                USER_HP_NO: 'No HP',
                USER_EMAIL: 'Email',
                USER_EMAIL_INS: 'Email Institusi',

                PSW_OLD: 'Password Lama',
                PSW_NEW: 'Password Baru',
                PSW_CONF: 'Konfirmasi Password Baru'
            };
        } else if ('en' === lang) {
            myJsonLabel.contact = {
                NAME: 'Name'
            };
            myJsonTooltip.contact = {
                NAME: 'Name Tooltip'
            };

            myJsonLabel.home = {
                NEWS: 'News',
                ABOUT: 'About',
                CONTACT: 'Contact',
                Register: 'Register',
                LATEST_NEWS: 'Latest News'
            };

            myJsonLabel.profile = {
                ORG_LONG_NAME: 'Long Name',
                ORG_SHORT_NAME: 'Short Name',
                ORG_CATEGORY: 'Category',
                ORG_COUNTRY: 'Country',
                ORG_TYPE: 'Type',
                USER_NAME: 'Name',
                USER_HP_NO: 'HP No',
                USER_EMAIL: 'Email',
                USER_EMAIL_INS: 'Email Institution',
                PSW_OLD: 'Password Old',
                PSW_NEW: 'Password New',
                PSW_CONF: 'Password New Confirm'
            };
        }

        if (lang) {
            localStorage.setItem(LOCALIZATION_LOCAL_STORAGE_KEY, lang);
            localStorage.setItem(LOCALIZATION_LABEL_STORAGE_KEY, JSON.stringify(myJsonLabel));
            localStorage.setItem(LOCALIZATION_TOOLTIP_STORAGE_KEY, JSON.stringify(myJsonTooltip));
        }

        console.log('myJsonLabel: ' + JSON.stringify(myJsonLabel));
        console.log('myJsonTooltip: ' + JSON.stringify(myJsonTooltip));
    }
}
