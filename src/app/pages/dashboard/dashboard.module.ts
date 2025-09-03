import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { ModalsModule, WidgetsModule } from '../../_metronic/partials';
import { IconsModule } from 'src/app/modules/icons/icons.module';

@NgModule({
    declarations: [DashboardComponent],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: DashboardComponent
            }
        ]),
        WidgetsModule,
        ModalsModule,
        IconsModule
    ]
})
export class DashboardModule {}
