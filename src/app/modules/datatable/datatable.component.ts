import { PagedResponse } from './../../core/types';
import { LazyLoadEvent } from 'primeng/api';
import {
    Component,
    OnInit,
    OnChanges,
    Input,
    SimpleChanges,
    Output,
    EventEmitter,
    ContentChild,
    TemplateRef
} from '@angular/core';
import * as _ from 'lodash';
import { Table } from 'primeng/table';

@Component({
    selector: 'app-datatable',
    templateUrl: './datatable.component.html'
})
export class DatatableComponent<T> implements OnInit, OnChanges {
    @Input() data: T[];
    @Input() columns: any[];
    @Input() total: number;
    @Input() totalRow = 10;
    @Input() rowsOptions = [10, 20, 50];
    @Output() createClicked = new EventEmitter();
    @Output() editClicked = new EventEmitter<T>();
    @Output() removeClicked = new EventEmitter<T>();
    @Output() removeSelectedClicked = new EventEmitter<T[]>();
    @Output() sorterClicked = new EventEmitter<any>();
    @Output() filterClicked = new EventEmitter<any>();
    @ContentChild(TemplateRef) parentTemplate: any;

    datasource: PagedResponse<T>;
    collection: T[] = [];
    model: T;
    totalRecords: number;
    cols: any[] = [];
    rows: number;
    rowsPerPageOptions: any[] = [];
    loading: boolean;
    selectedModel: T[] = [];
    filename: string;

    ngOnInit(): void {
        this.cols = this.columns;
        this.rows = this.totalRow;
        this.rowsPerPageOptions = this.rowsOptions;
        this.totalRecords = this.total;
        this.loading = true;
        this.filename = _.lowerCase(this.model as unknown as string);
    }

    ngOnChanges(change: SimpleChanges): void {
        if (change.data) {
            if (change.data.currentValue) {
                this.datasource = change.data.currentValue;
                this.collection = this.datasource.slice(0, 10);
                this.loading = false;
            }

            if (change.total) {
                this.totalRecords = change.total.currentValue;
                this.loading = false;
            }

            if (change.columns) {
                this.cols = change.columns.currentValue;
                this.loading = false;
            }
        }
    }

    lazyLoadCollection(event: LazyLoadEvent) {
        this.loading = true;

        setTimeout(() => {
            if (this.datasource) {
                this.collection = this.datasource.slice(event.first, (event.first as number) + (event.rows as number));
                this.loading = false;
            }

            if (this.total) {
                this.totalRecords = this.total;
                this.loading = false;
            }

            if (this.columns) {
                this.cols = this.columns;
                this.loading = false;
            }
        });
    }

    create() {
        this.createClicked.emit();
    }

    edit(model: T) {
        this.editClicked.emit(model);
    }

    remove(model: T) {
        this.removeClicked.emit(model);
    }

    removeSelected() {
        this.removeSelectedClicked.emit(this.selectedModel);
    }

    handleSort(event: any[]) {
        this.sorterClicked.emit(event);
    }

    handleFilter(event: any[]) {
        this.filterClicked.emit(event);
    }

    private convertEventToQuery(event: LazyLoadEvent): string {
        let query = `?include=roles`;
        if (!_.isEmpty(event.filters)) {
            Object.entries(event.filters).forEach(val => {
                query += `&`;
                query += `filter[${val[0]}]=${val[1].value}`;
            });
        }

        if (event.sortField && event.sortOrder) {
            const order = event.sortOrder === 1 ? '' : '-';
            query += `&`;
            query += `sort=${order}${event.sortField}`;
        }

        if (event.rows) {
            query += `&`;
            query += `page[size]=${event.rows}`;

            if (event.first !== undefined) {
                const pageNumber = event.first / event.rows + 1;
                query += `&`;
                query += `page[number]=${pageNumber}`;
            }
        }

        return query;
    }
}
