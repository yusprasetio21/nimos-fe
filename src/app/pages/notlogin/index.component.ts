import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';

@Component({
    selector: 'app-index',
    templateUrl: './index.component.html'
})
export class IndexComponent implements OnInit {
    model: any;
    constructor(private renderer: Renderer2) {}

    ngOnInit(): void {
        // this.model = this.layout.getConfig();
        // this.router.navigate(['/login']);
    }
}
