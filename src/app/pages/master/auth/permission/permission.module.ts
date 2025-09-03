import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TokenInterceptor } from '../../../../core/interceptors/token.interceptor';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PermissionComponent } from './permission.component';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { InlineSVGModule } from 'ng-inline-svg-2';

@NgModule({
    declarations: [PermissionComponent],
    imports: [
        CommonModule,
        RouterModule.forChild([{ path: '', component: PermissionComponent }]),
        FormsModule,
        ReactiveFormsModule,
        ConfirmDialogModule,
        DialogModule,
        DropdownModule,
        TableModule,
        ToastModule,
        ToolbarModule,
        TooltipModule,
        SkeletonModule,
        InlineSVGModule
    ]
    // providers: [TokenInterceptor, { provide: HTTP_INTERCEPTORS, useExisting: TokenInterceptor, multi: true }]
})
export class PermissionModule {}
