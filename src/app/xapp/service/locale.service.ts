import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocaleService {

    public static readonly LOCALE_en_US = "en-US";
    public static readonly LOCALE_id_ID = "id-ID";

    private locale: string;

    //Chosse Locale From This Link
    //https://github.com/angular/angular/tree/master/packages/common/locales
    constructor() { }

    getLocale(){
        //return this.locale || LocaleService.LOCALE_id_ID; //default bahasa
        return this.locale || LocaleService.LOCALE_en_US; //default english
    }

    public register(locale: string) {
        //debugger;
        if (!locale) {
            return;
        }
        switch (locale) {
            case 'en-uk': {
                this.locale = 'en-UK';
                console.log('Application Culture Set to English');
                break;
            }
            case 'zh-hk': {
                this.locale = 'zh-Hant';
                console.log('Application Culture Set to Traditional Chinese');
                break;
            }
            case 'zh-cn': {
                this.locale = 'zh-Hans';
                console.log('Application Culture Set to Simplified Chinese');
                break;
            }
            case 'ar-sa': {
                this.locale = 'ar-SA';
                console.log('Application Culture Set to Arabic');
                break;
            }
            case LocaleService.LOCALE_id_ID: {
                this.locale = LocaleService.LOCALE_id_ID;
                console.log('Application Culture Set to Bahasa');
                break;
            }
            default: {
                this.locale = LocaleService.LOCALE_en_US;
                console.log('Application Culture Set to English');
                break;
            }
        }
    }
}