import { CommonModule } from '@angular/common';
import { NgModule ,CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCommonModule, MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialExampleModule } from 'src/app/material.module';
import { InsertObservationDialogComponent } from './insert-observation-dialog.component';
  
@NgModule({
  declarations: [InsertObservationDialogComponent],
  entryComponents: [InsertObservationDialogComponent],
  imports: [
    // BrowserAnimationsModule,
    // BrowserModule,
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MaterialExampleModule,
    ReactiveFormsModule,
  ],
  // providers: [
  //   BrowserAnimationsModule,
  //   BrowserModule,],
  bootstrap: [InsertObservationDialogComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA ]
})
export class InsertObservationDialogModule {}