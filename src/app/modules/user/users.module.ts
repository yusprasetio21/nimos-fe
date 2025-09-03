import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { UserComponent } from './user.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

// import { ProfileDetailsComponent} from './form/profile-details.component';
@NgModule({
    declarations: [UserComponent],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: UserComponent
            }
        ]),
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
export class UsersModule {}
