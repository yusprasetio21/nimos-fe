import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
    userLocalStorageKey = `${environment.appVersion}-currentUser`;

    constructor(private router: Router) {}

    ngOnInit(): void {
        const lsValue = localStorage.getItem(this.userLocalStorageKey);
        //console.log(lsValue);
        if (lsValue) {
            const currentUser = JSON.parse(lsValue);
            if (currentUser.roles[0] === 'admin') {
                this.router.navigate(['dashboard-adm']);
            } else if (currentUser.roles[0] === 'pic') {
                this.router.navigate(['dashboard-pic']);
            } else if (currentUser.roles[0] === 'station') {
                this.router.navigate(['dashboard-user']);
            }
        }
    }
}
