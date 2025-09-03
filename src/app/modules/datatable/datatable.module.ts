import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule as PrimeTableModule } from 'primeng/table';
import { DatatableComponent } from './datatable.component';
import { ToolbarModule } from 'primeng/toolbar';

@NgModule({
    imports: [CommonModule, PrimeTableModule, ToolbarModule],
    declarations: [DatatableComponent],
    exports: [DatatableComponent]
})
export class DatatableModule {}
