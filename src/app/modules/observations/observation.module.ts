import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ObservationComponent } from './observation.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatNativeDateModule, MAT_DATE_LOCALE} from '@angular/material/core';
import {MaterialExampleModule} from '../../material.module';
import {MatCommonModule} from '@angular/material/core';
import { DialogModule } from 'primeng/dialog';

import { ToastModule } from 'primeng/toast';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HeaderHttpInterceptor } from 'src/app/xapp/intercept/header.http.interceptor';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { NodeService } from 'src/app/xapp/component/nodeservice';
import {ButtonModule} from 'primeng/button';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DialogService, DynamicDialogConfig, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RippleModule } from 'primeng/ripple';
import { SliderModule } from 'primeng/slider';
import { TableModule } from 'primeng/table';
import { DeploymentDialogComponent } from './deployment/deployment-dialog.component';
import { AplicationAreaDialogComponent } from './deployment/dialog/aplicationArea/aplication-area-dialog.component';
import { UrlDialogComponent } from './deployment/dialog/dataURL/url-dialog.component';
import { CoordinatesDialogComponent } from './deployment/dialog/coordinates/coordinates-dialog.component';
import { StatusDialogComponent } from './deployment/dialog/status/status-dialog.component';
import { FrequencyDialogComponent } from './deployment/dialog/frequency/frequency-dialog.component';
import { MaintenanceDialogComponent } from './deployment/dialog/maintenance/maintenance-dialog.component';
import { QualityAssuranceDialogComponent } from './deployment/dialog/qulity_assurance/quality-assurance-dialog.component';
import { DataGenerationDialogComponent } from './deployment/dialog/data_generation/data-generation-dialog.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import {ListboxModule} from 'primeng/listbox';
import { MethodDialogComponent } from './dialogs/dialog_method/method-dialog.component';
import { InsertObservationDialogComponent } from './observations/dialog/insert_observation/insert-observation-dialog.component';
import { ProgramDialogComponent } from './dialogs/dialog_program/program-dialog.component';
import { DataObservationDialogComponent } from './observations/data-observation-dialog.component';
import { ScrollerModule } from 'primeng/scroller';
import {TooltipModule} from 'primeng/tooltip';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: ObservationComponent
            }
        ]),
        // InsertObservationDialogModule,
        // FormDeploymentDialogModule,
     
        NgxSpinnerModule,

        //materialize
        MatNativeDateModule,
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCommonModule,
        MatFormFieldModule,
        MatInputModule,
        MaterialExampleModule,
        ReactiveFormsModule,
        HttpClientModule,


        //primeng
        ToastModule,
        DialogModule,
        ButtonModule,
        DynamicDialogModule,
        DropdownModule,
        InputTextModule,
        CalendarModule,
        CheckboxModule,
        RippleModule,
        TableModule,
		SliderModule,
		MultiSelectModule,
		ContextMenuModule,
        ProgressBarModule,
        RadioButtonModule,
        ListboxModule,
        ScrollerModule,
        TooltipModule,
        // form module
        FormsModule,
        ReactiveFormsModule,
        // DynamicDialogRef,
        // DynamicDialogConfig,

        ConfirmDialogModule
    ],
    declarations: [ ObservationComponent, AplicationAreaDialogComponent,DeploymentDialogComponent,
        UrlDialogComponent,MethodDialogComponent,CoordinatesDialogComponent,StatusDialogComponent,
        FrequencyDialogComponent,MaintenanceDialogComponent,QualityAssuranceDialogComponent,
        DataGenerationDialogComponent,DataObservationDialogComponent,InsertObservationDialogComponent,
        ProgramDialogComponent],
    providers: [ HeaderHttpInterceptor,
        { provide:MAT_DATE_LOCALE, useValue: 'en-ID' },
        { provide: HTTP_INTERCEPTORS, useExisting: HeaderHttpInterceptor, multi: true },
        ConfirmationService,
        MessageService,
        DatePipe,
        NodeService],
    bootstrap: [ObservationComponent],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
})
export class ObservationModule {}
