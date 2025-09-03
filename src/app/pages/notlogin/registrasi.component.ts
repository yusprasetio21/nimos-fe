import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { LayoutService } from '../../_metronic/layout';

@Component({
    selector: 'app-registrasi',
    templateUrl: './registrasi.component.html'
})
export class RegistrasiComponent implements OnInit {
    model: any;
    constructor(private layout: LayoutService) {}

    ngOnInit(): void {
        // this.model = this.layout.getConfig();
        // this.router.navigate(['/login']);
    }
}
