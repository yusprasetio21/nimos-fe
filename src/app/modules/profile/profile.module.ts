import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { OverviewComponent } from './overview/overview.component';
import { ProjectsComponent } from './projects/projects.component';
import { CampaignsComponent } from './campaigns/campaigns.component';
import { DocumentsComponent } from './documents/documents.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { ConnectionsComponent } from './connections/connections.component';
import { CardsModule, DropdownMenusModule, WidgetsModule } from '../../_metronic/partials';
import { ChangePasswordComponent } from './change_password/change-password.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileDetailsComponent } from './details/profile-details.component';
import { RouterModule } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { DropdownModule } from 'primeng/dropdown';
@NgModule({
    declarations: [
        ChangePasswordComponent,
        ProfileDetailsComponent,
        ProfileComponent,
        OverviewComponent,
        ProjectsComponent,
        CampaignsComponent,
        DocumentsComponent,
        ConnectionsComponent
    ],
    imports: [
        CommonModule,
        ProfileRoutingModule,
        InlineSVGModule,
        DropdownMenusModule,
        WidgetsModule,
        CardsModule,

        // primeng modules
        ConfirmDialogModule,
        DialogModule,
        TableModule,
        ToastModule,
        ToolbarModule,
        DropdownModule,
        // form module
        FormsModule,
        ReactiveFormsModule
    ]
})
export class ProfileModule {}
