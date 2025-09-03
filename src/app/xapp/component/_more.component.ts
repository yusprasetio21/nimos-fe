import { BehaviorSubject, Subscription } from 'rxjs';
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/prefer-for-of */
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { BaseComponent } from './_base.component';
import { ConfirmationService, LazyLoadEvent, MessageService, SelectItem, FilterMatchMode } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';

export abstract class MoreComponent extends BaseComponent {
    dataForm: FormGroup;
    dialogForm: boolean;

    state$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    unsubscribe: Subscription[] = [];
    matchModeOptions: SelectItem[] = [{ label: 'Contains', value: FilterMatchMode.CONTAINS }];

    constructor(
        protected confirmationService: ConfirmationService,
        protected http: HttpClient,

        router: Router,
        messageService: MessageService,
        spinnerService: NgxSpinnerService
    ) {
        super(router, messageService, spinnerService);
        this.unsubscribe.push(this.state$.asObservable().subscribe());
    }

    _loadDatas(backendURL: string, event: LazyLoadEvent | null) {
        let query = '';
        if (event) {
            query = this.convertEventToQuery(event);
        }
        this.spinnerService.show();
        this.http.get(`${environment.app.apiUrl}/${backendURL + query}`).subscribe({
            next: response => {
                console.log('resp: ' + JSON.stringify(response));
                const page = <any>response;
                const datasNew = [];
                const _datas = <any[]>page.data;
                //const _datas = <any[]>page;
                for (let index = 0; index < _datas.length; index++) {
                    const _data = this.generateStr(_datas[index]);
                    datasNew.push(_data);
                }
                this.setDatas(datasNew);
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

    protected convertEventToQuery(event: LazyLoadEvent): string {
        let query = `?`;
        if (event.filters) {
            Object.entries(event.filters).forEach(val => {
                const obj = val[1] as any[];
                if (obj[0].value) {
                    query += `&`;
                    query += `filter[${val[0]}]=${obj[0].value}`;
                }
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

    _addData() {
        this.submitted = false;
        this.setSelectedDatas([]);
        this.newData = true;
        this.dialogForm = true;
        this.createDataForm(null);
    }

    _editData(backendURL: string, data: any) {
        this.createDataForm(null);
        this.dialogForm = true;
        this.spinnerService.show();
        this.submitted = false;
        this.setSelectedDatas([]);
        this.newData = false;
        this.http.get(`${environment.app.apiUrl}/${backendURL}/${data.id}`).subscribe({
            next: data => {
                this.createDataForm(<any>data);
                this.spinnerService.hide();
                this.state$.next(true);
            },
            error: err => {
                this._errorHandler(err);
            }
        });
    }

    _deleteMoreWithConfirm(backendURL: string) {
        this.submitted = false;
        //this.selectedDatas = null; selectedDatas must have value
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected datas?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this._deleteMore(backendURL);
            },
            reject: () => {
                this.spinnerService.hide();
            }
        });
    }

    _deleteMore(backendURL: string) {
        this.spinnerService.show();
        this.http
            .post(`${environment.app.apiUrl}/${backendURL}/destroy`, this.getIdsToDelete(this.getSelectedDatas()))
            //.delete(`${environment.app.apiUrl}/${backendURL}/${this.getIdsToDelete(this.getSelectedDatas())}`)
            .subscribe({
                next: () => {
                    this.setDatas(this.getDatas().filter(val => !this.getSelectedDatas().includes(val)));
                    //this.totalRecords -= 1;
                    this.setSelectedDatas([]);
                    this._generateMsg('success', 'Successful', 'Data are deleted successfully');
                    this.spinnerService.hide();
                    this.state$.next(true);
                },
                error: err => {
                    this._errorHandler(err);
                }
            });
    }

    _deleteWithConfirm(backendURL: string, data: any) {
        this.submitted = false;
        this.setSelectedDatas([]);
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + data.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this._delete(backendURL, data);
            },
            reject: () => {
                this.spinnerService.hide();
            }
        });
    }

    _delete(backendURL: string, data: any) {
        this.spinnerService.show();
        this.http
            //.delete(`${environment.app.apiUrl}/${backendURL}`, { params: new HttpParams().append('id', '' + data.id) })
            .delete(`${environment.app.apiUrl}/${backendURL}/${data.id}`)
            .subscribe({
                next: () => {
                    this.setDatas(this.getDatas().filter(val => val.id !== data.id));
                    //this.totalRecords -= 1;
                    this.createDataForm(null);
                    this._generateMsg('success', 'Successful', 'Data is deleted successfully');
                    this.spinnerService.hide();
                    this.state$.next(true);
                },
                error: err => {
                    this._errorHandler(err);
                }
            });
    }

    hideForm(event?: any) {
        this.createDataForm(null);
        this.submitted = false;
        this.spinnerService.hide();
    }

    _store(backendURL: string, req: any) {
        this.submitted = true;
        if (this.dataForm.valid) {
            this.spinnerService.show();
            const datas = [...this.getDatas()];
            this.http.post(`${environment.app.apiUrl}/${backendURL}`, req).subscribe({
                next: resp => {
                    this.setDatas(this.updateTableDisplay(datas, req, resp));
                    this.createDataForm(null);
                    this.dialogForm = false;
                    this._generateMsg('success', 'Successful', 'Data is saved successfully');
                    this.spinnerService.hide(); //aneh kalau sebelum _generateMsg, tetap loading
                    //window.location.reload();
                    this.state$.next(true);
                },
                error: err => {
                    this._errorHandler(err);
                }
            });
        }
    }

    _update(backendURL: string, req: any) {
        this.submitted = true;
        if (this.dataForm.valid) {
            this.spinnerService.show();
            const datas = [...this.getDatas()];
            this.http.put(`${environment.app.apiUrl}/${backendURL}`, req).subscribe({
                next: resp => {
                    this.setDatas(this.updateTableDisplay(datas, req, resp));
                    this.createDataForm(null);
                    this.dialogForm = false;
                    this._generateMsg('success', 'Successful', 'Data is saved successfully');
                    this.spinnerService.hide(); //aneh kalau sebelum _generateMsg, tetap loading
                    //window.location.reload();
                    this.state$.next(true);
                },
                error: err => {
                    this._errorHandler(err);
                }
            });
        }
    }

    _createDropdownList(
        backendURL: string,
        params: HttpParams,
        label: string,
        value: string,
        labelFirst: any,
        dataOptions: SelectItem[]
    ) {
        if (labelFirst !== null) {
            dataOptions.push({ label: labelFirst, value: null });
        }
        this.spinnerService.show();
        this.http.get(`${environment.app.apiUrl}/${backendURL}`, { params }).subscribe({
            next: data => {
                //console.log('options:' + JSON.stringify(data));
                const _dataOptions = <any[]>data;
                _dataOptions.forEach(dataOption => {
                    dataOptions.push({ label: dataOption[label], value: dataOption[value] });
                });
                this.spinnerService.hide();
                this.state$.next(true);
            },
            error: err => {
                this._errorHandler(err);
            }
        });
    }

    _createDropdownList2(
        backendURL: string,
        params: HttpParams,
        label: string,
        value: string,
        labelFirst: any,
        dataOptions: SelectItem[]
    ) {
        if (labelFirst !== null) {
            dataOptions.push({ label: labelFirst, value: null });
        }
        this.spinnerService.show();
        this.http.get(`${environment.app.apiUrl}/${backendURL}`, { params }).subscribe({
            next: data => {
                // console.log('options:' + JSON.stringify(data));
                const _dataOptions = <any[]>data;
                _dataOptions.forEach(dataOption => {
                    dataOptions.push({ label: dataOption[label], value: dataOption[value] });
                });
                this.state$.next(true);
            },
            error: err => {
                this._errorHandler(err);
            }
        });
    }

    _createMultiSelectList(
        backendURL: string,
        params: HttpParams,
        label: string,
        value: string,
        dataOptions: SelectItem[]
    ) {
        this.spinnerService.show();
        this.http.get(`${environment.app.apiUrl}/${backendURL}`, { params }).subscribe({
            next: data => {
                const _dataOptions = <any[]>data;
                _dataOptions.forEach(dataOption => {
                    dataOptions.push({ label: dataOption[label], value: dataOption[value] });
                });
                this.spinnerService.hide();
                this.state$.next(true);
            },
            error: err => {
                this._errorHandler(err);
            }
        });
    }

    _createAutoComplete(backendURL: string, params: HttpParams, filteredObjects: any[]) {
        this.spinnerService.show();
        this.http.get(`${environment.app.apiUrl}/${backendURL}`, { params }).subscribe({
            next: data => {
                const _filteredObjects = <any[]>data;
                _filteredObjects.forEach(object => {
                    filteredObjects.push(object);
                });
                console.log(filteredObjects);
                this.spinnerService.hide();
                this.state$.next(true);
            },
            error: err => {
                this._errorHandler(err);
            }
        });
    }

    _exportExcel(datas: any[], fileName: string) {
        import('xlsx').then(xlsx => {
            const worksheet = xlsx.utils.json_to_sheet(datas);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });
            import('file-saver').then(fileSaver => {
                const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
                const EXCEL_EXTENSION = '.xlsx';
                const data: Blob = new Blob([excelBuffer], {
                    type: EXCEL_TYPE
                });
                //FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
                FileSaver.saveAs(data, fileName + '_export_' + new Date().toISOString().slice(0, 10) + EXCEL_EXTENSION);
            });
        });
    }

    _generateParam(action: string) {
        this.spinnerService.show();
        this.http.get(`${environment.app.apiUrl}/api/lists/parameter-texts`).subscribe({
            next: response => {
                //console.log('resp visible: ' + JSON.stringify(response));
                const params = response as any[];

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

                const myJsonParam: any = {
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
                    myJsonParam.station[item.code] = {
                        is_visible: item.is_visible,
                        is_basic: item.is_basic,
                        is_geophysic: item.is_geophysic
                    };
                });
                observationLang.forEach(item => {
                    myJsonParam.observation[item.code] = {
                        is_visible: item.is_visible,
                        is_basic: item.is_basic,
                        is_geophysic: item.is_geophysic
                    };
                });
                generalInfoLang.forEach(item => {
                    myJsonParam.generalInfo[item.code] = {
                        is_visible: item.is_visible,
                        is_basic: item.is_basic,
                        is_geophysic: item.is_geophysic
                    };
                });
                instrumentLang.forEach(item => {
                    myJsonParam.instrument[item.code] = {
                        is_visible: item.is_visible,
                        is_basic: item.is_basic,
                        is_geophysic: item.is_geophysic
                    };
                });
                coordinateLang.forEach(item => {
                    myJsonParam.coordinate[item.code] = {
                        is_visible: item.is_visible,
                        is_basic: item.is_basic,
                        is_geophysic: item.is_geophysic
                    };
                });
                statusLang.forEach(item => {
                    myJsonParam.status[item.code] = {
                        is_visible: item.is_visible,
                        is_basic: item.is_basic,
                        is_geophysic: item.is_geophysic
                    };
                });
                frequencyLang.forEach(item => {
                    myJsonParam.frequency[item.code] = {
                        is_visible: item.is_visible,
                        is_basic: item.is_basic,
                        is_geophysic: item.is_geophysic
                    };
                });
                maintenanceLang.forEach(item => {
                    myJsonParam.maintenance[item.code] = {
                        is_visible: item.is_visible,
                        is_basic: item.is_basic,
                        is_geophysic: item.is_geophysic
                    };
                });
                assuranceLang.forEach(item => {
                    myJsonParam.assurance[item.code] = {
                        is_visible: item.is_visible,
                        is_basic: item.is_basic,
                        is_geophysic: item.is_geophysic
                    };
                });
                dataGenerationLang.forEach(item => {
                    myJsonParam.dataGeneration[item.code] = {
                        is_visible: item.is_visible,
                        is_basic: item.is_basic,
                        is_geophysic: item.is_geophysic
                    };
                });
                samplingLang.forEach(item => {
                    myJsonParam.sampling[item.code] = {
                        is_visible: item.is_visible,
                        is_basic: item.is_basic,
                        is_geophysic: item.is_geophysic
                    };
                });
                processingLang.forEach(item => {
                    myJsonParam.processing[item.code] = {
                        is_visible: item.is_visible,
                        is_basic: item.is_basic,
                        is_geophysic: item.is_geophysic
                    };
                });
                reportingLang.forEach(item => {
                    myJsonParam.reporting[item.code] = {
                        is_visible: item.is_visible,
                        is_basic: item.is_basic,
                        is_geophysic: item.is_geophysic
                    };
                });

                localStorage.setItem('param', JSON.stringify(myJsonParam));

                console.log('myJsonParam: ' + JSON.stringify(myJsonParam));

                this.state$.next(true);
                if ('add' === action) {
                    this.spinnerService.hide();
                }
            },
            error: err => {
                this._errorHandler(err);
            }
        });
    }

    _showField(isVisible: boolean, isBasic0: boolean, isBasic: boolean) {
        if (isVisible && ((isBasic0 && isBasic) || (isBasic0 && !isBasic) || (!isBasic0 && !isBasic))) {
            return true;
        } else {
            return false;
        }
    }

    protected abstract getSelectedDatas(): any[];

    protected abstract setSelectedDatas(datas: any): any;

    protected abstract generateStr(event: any): any;

    protected abstract getDatas(): any[];

    protected abstract setDatas(datas: any[]): void;

    protected abstract createDataForm(data: any): any;

    protected abstract updateTableDisplay(datas: any[], req: any, resp: any): any;
}
