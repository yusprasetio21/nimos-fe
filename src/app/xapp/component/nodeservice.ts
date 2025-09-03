import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { TreeNode } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { MoreComponent } from './_more.component';

@Injectable()
export class NodeService {

    constructor(private http: HttpClient) { }

    getFilesTreeEvent() {
      return this.http.get<any>('assets/json/treeEvent.json')
    // return this.http.get<any>(`${environment.app.apiUrl}/api/lists/tree/platform-events`)
      .toPromise()
      .then(res => <TreeNode[]>res.data);
    }

    getFilesTreeProgram() {
      return this.http.get<any>('assets/json/treeProgram.json')
    // return this.http.get<any>(`${environment.app.apiUrl}/api/lists/tree/platform-events`)
      .toPromise()
      .then(res => <TreeNode[]>res.data);
    }

    getLazyFiles() {
      return this.http.get<any>('assets/files.json')
      .toPromise()
      .then(res => <TreeNode[]>res.data);
    }
}