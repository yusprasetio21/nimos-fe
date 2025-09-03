import { MoreComponent } from 'src/app/xapp/component/_more.component';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Tree } from 'primeng/tree';
import { DatePipe } from '@angular/common';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from 'src/app/base.component';
  
@Component({
  selector: 'glossary',
  templateUrl: './glossary.component.html',
  styles: [
    `
        #map {
            height: 100%;
        }
    `
]
})

export class GlossaryComponent extends BaseComponent implements OnInit {

  ngOnInit(): void {
  }
  
}