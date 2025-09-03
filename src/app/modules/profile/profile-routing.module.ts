import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OverviewComponent } from './overview/overview.component';
import { CampaignsComponent } from './campaigns/campaigns.component';
import { DocumentsComponent } from './documents/documents.component';
import { ProjectsComponent } from './projects/projects.component';
import { ProfileComponent } from './profile.component';
import { ConnectionsComponent } from './connections/connections.component';
import { ProfileDetailsComponent } from './details/profile-details.component';
import { ChangePasswordComponent } from './change_password/change-password.component';

const routes: Routes = [
    {
        path: '',
        component: ProfileComponent,
        children: [
            {
                path: 'overview',
                component: OverviewComponent
            },
            {
                path: 'projects',
                component: ProjectsComponent
            },
            {
                path: 'campaigns',
                component: CampaignsComponent
            },
            {
                path: 'documents',
                component: DocumentsComponent
            },
            {
                path: 'connections',
                component: ConnectionsComponent
            },
            {
                path: 'profildetail',
                component: ProfileDetailsComponent
            },
            {
                path: 'changepassword',
                component: ChangePasswordComponent
            },
            { path: '', redirectTo: 'profildetail', pathMatch: 'full' },
            { path: '**', redirectTo: 'profildetail', pathMatch: 'full' }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProfileRoutingModule {}
