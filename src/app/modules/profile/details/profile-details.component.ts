import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ErrorHandler } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { UserModel } from '../../auth/models/user.model';
import { BaseComponent } from 'src/app/base.component';
import { AuthModel } from '../../auth/models/auth.model';
import { Instansi } from '../../auth/models/instansi.model';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';

@Component({
    selector: 'app-profile-detail',
    templateUrl: './profile-details.component.html',
    providers: [MessageService, ConfirmationService]
})
export class ProfileDetailsComponent extends BaseComponent implements OnInit, ErrorHandler {
    //Field
    userId: number;
    name: string;
    notlp: number;
    kategoriId: number;
    instansiId: number;
    emailInstansi: string;
    email: string;

    user: UserModel;

    //Table
    cols: any[] = [];
    dataSource$: UserModel[];
    selectUser: UserModel[];

    isActive: SelectItem;
    isActiveOptions: SelectItem[];

    kategoriOptions:SelectItem[];

    instansiOptions:SelectItem[];
    instansitxt:string;

    disableInstansi:boolean = false;

  constructor(private route:ActivatedRoute,private fb: FormBuilder,private messageService: MessageService,){
    super();
  }

  get f() {
    return this.dataForm.controls;
  }

  handleError(error: any): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    this.user = <UserModel>this.getUserFromLocalStorage();
    this.setOptions();

    if(this.user.kategori_id == 6)this.disableInstansi = true;  

    this.createDataForm(this.user);
  }

  createDataForm(data: any) {
    if (data==null) data = new UserModel;
    this.dataForm = this.fb.group({
        id: new FormControl(data.id),
        name: new FormControl(data.name,Validators.required),
        isActive: new FormControl(data.is_active,Validators.required),
        notlp: new FormControl(data.notlp),
        email: new FormControl(data.email,[Validators.required, 
          Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]),
        emailInstansi: new FormControl(data.email_instansi,
          Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")),
        kategori: new FormControl(data.kategori_id,Validators.required),
        instansi: new FormControl(data.instansi_id)
    });
  }
  
  async validate(){
    var dataUpdate = {
      "name": this.f.name.value,
      "notlp":this.f.notlp.value==null?this.f.notlp.value:''+this.f.notlp.value,
      "kategori_id": this.f.kategori.value,
      "instansi_id": this.f.instansi.value == null? null:this.f.instansi.value,
      "email_instansi":this.f.emailInstansi.value == null?null:this.f.emailInstansi.value,
      "email": this.f.email.value,
      "is_active":this.f.isActive.value
    };
    console.log(JSON.stringify(dataUpdate));
    if(this.dataForm.status == 'VALID'){
      if(this.f.kategori.value != 6 ){
        if(this.f.instansi.value != '' && this.f.emailInstansi.value != ''){
          this.save(dataUpdate);
        }else{
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Instansi is still empty',
            life: 3000
          });
        }
      }else{
        this.save(dataUpdate);
      }
    }else{
        this.messageService.add({
        severity: 'error',
        summary: 'Failed',
        detail: 'Input Data Yang Diperlukan',
        life: 3000
      });
    }
  }

  async save(dataUpdate:any){
    try{
      console.log(JSON.stringify(dataUpdate));
      this.ReuquestAPI("PUT",`${environment.app.apiUrl}/api/users/`+this.f.id.value,dataUpdate)
      .then((data)=>{
        // this.dataSource$ = data;
        this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Data User Has Updated',
            life: 3000
        });
      });
    }catch(e :any){
      this.messageService.add({
        severity: 'error',
        summary: 'Failed',
        detail: e,
        life: 3000
      });
    }
  }

  onSelectKategori(){
    if(this.f.kategori.value != 6){
      this.disableInstansi = false;
      this.getInstansiOptions(this.f.kategori.value);
    }
    else{
      this.disableInstansi = true;
      this.dataForm.patchValue({'instansi':1});
      this.dataForm.patchValue({'emailInstansi':null});
      this.dataForm.get('emailInstansi')?.disable();
    }
  }

  getInstansiOptions(id:any){
    console.log(id);
    if(id!= 6){
      this.disableInstansi = false;
    
      this.ReuquestAPI("GET",`${environment.app.apiUrl}/api/instansies/kategori/`+id,[])
      .then((data)=>{
        const datas = <Instansi[]> data;
        this.instansiOptions = [];
        this.instansiOptions.push({label:'- Instansi? -', value:null});
        if(datas.length > 0){
          for(var position:number=0;position<datas.length;position++){
            this.instansiOptions.push({label:datas[position].name, value:datas[position].id});
          }
          if(this.user.instansi_id != null){
            console.log(this.user.instansi_id);
            console.log(JSON.stringify(this.instansiOptions));
            this.dataForm.patchValue({'instansi':this.user.instansi_id});
          }
        }else{
          const dataInstansi = <Instansi> data;
          if(JSON.stringify(dataInstansi)!='[]'){
            this.instansiOptions.push({label:dataInstansi.name, value:dataInstansi.id});
          }
        }
      });
    }
  }

  setOptions(){
    this.instansiOptions = [];
    this.instansiOptions.push({label:'- Instansi? -', value:null});
    this.getInstansiOptions(this.user.kategori_id);

    this.isActiveOptions = [];
    this.isActiveOptions.push({label:'- Active? -', value:null});
    this.isActiveOptions.push({label: "Need Approval", value: 0});
    this.isActiveOptions.push({label: "Approved And Active", value: 1});
    this.isActiveOptions.push({label: "Approved And NotActive", value: 2});

    this.kategoriOptions = [];
    this.kategoriOptions.push({label:'- Kategori? -', value:null});
    this.kategoriOptions.push({label:'Instansi Pemerintah', value:1});
    this.kategoriOptions.push({label:'BUMN', value:2});
    this.kategoriOptions.push({label:'Perusahaan Swasta', value:3});
    this.kategoriOptions.push({label:'Universitas', value:4});
    this.kategoriOptions.push({label:'Non Gevernment Organization (NGO)', value:5});
    this.kategoriOptions.push({label:'Pengamatan Mandiri', value:6});
  }
}
