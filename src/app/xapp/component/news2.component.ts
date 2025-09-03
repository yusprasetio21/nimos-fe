import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService, LazyLoadEvent } from 'primeng/api';
import { FormBuilder } from '@angular/forms';
import { MoreComponent } from 'src/app/xapp/component/_more.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-news',
    templateUrl: './news2.component.html'
})
export class News2Component extends MoreComponent implements OnInit {
    news: any[] = [];

    constructor(
        private fb: FormBuilder,
        //more
        confirmationService: ConfirmationService,
        http: HttpClient,
        //base
        router: Router,
        messageService: MessageService,
        spinnerService: NgxSpinnerService
    ) {
        super(confirmationService, http, router, messageService, spinnerService);
    }

    ngOnInit(): void {
        this.http
            .get(`${environment.app.apiUrl}/api/news?sort=-id&page[size]=10&page[number]=1&filter[is_active]=true`)
            .subscribe({
                next: response => {
                    //console.log('resp: ' + JSON.stringify(response));
                    const page = response as any;
                    this.news = page.data as any[];
                    this.totalRecords = page.total as number;
                    this.rows = page.per_page;
                    this.spinnerService.hide();
                    this.state$.next(true);
                },
                error: err => {
                    this._errorHandler(err);
                }
            });
    }

    paginate(event: any) {
        //event.first = Index of the first record
        //event.rows = Number of rows to display in new page
        //event.page = Index of the new page
        //event.pageCount = Total number of pages
        this.http
            .get(
                `${environment.app.apiUrl}/api/news?sort=created_at&page[size]=${event.rows}&page[number]=${event.page}`
            )
            .subscribe({
                next: response => {
                    //console.log('resp: ' + JSON.stringify(response));
                    const page = response as any;
                    this.news = page.data as any[];
                    this.totalRecords = page.total as number;
                    this.rows = page.per_page;
                    this.spinnerService.hide();
                    this.state$.next(true);
                },
                error: err => {
                    this._errorHandler(err);
                }
            });
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
    protected createDataForm(data: any) {
        throw new Error('Method not implemented.');
    }
    protected updateTableDisplay(datas: any[], req: any, resp: any) {
        throw new Error('Method not implemented.');
    }
}
