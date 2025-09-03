import { AsPipe } from './../../../../core/pipes/as-pipe';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { RoleCardComponent } from './components/role-card.component';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RolesComponent } from './roles.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
    declarations: [RolesComponent, RoleCardComponent, AsPipe],
    imports: [
        NgbModule,
        CommonModule,
        InlineSVGModule,
        RouterModule.forChild([{ path: '', component: RolesComponent }]),
        FormsModule,
        ReactiveFormsModule,
        ConfirmDialogModule,
        DialogModule,
        DropdownModule,
        ToastModule,
        ToolbarModule,
        TooltipModule,
        SkeletonModule
    ],
    exports: [AsPipe]
})
export class RolesModule {}
