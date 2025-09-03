import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/base.component';
import { UserModel } from '../auth/models/user.model';
import { environment } from 'src/environments/environment';
import { AuthModel } from '../auth/models/auth.model';
import { ActivatedRoute } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Instansi } from '../auth/models/instansi.model';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
// import {NgbdSortableHeader, SortEvent} from './sortable.directive';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
    providers: [MessageService, ConfirmationService]
})
export class UserComponent extends BaseComponent implements OnInit {
    user: UserModel;

    //Table
    cols: any[] = [];
    dataSource$: UserModel[];
    dataSource: UserModel[];
    userSelected:UserModel;

    isActive: SelectItem;
    isActiveOptions: SelectItem[];

    kategoriOptions: SelectItem[];

    instansi: Instansi;
    instansiOptions: SelectItem[];
    instansiTable:Instansi[];

    showPassword:boolean = false;
    disableInstansi:boolean = false;

    constructor(
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        super();
    }

    get f() {
        return this.dataForm.controls;
    }

    ngOnInit(): void {
        this.cols = [
            { field: 'name', header: 'Nama' },
            { field: 'notlp', header: 'No HP' },
            { field: 'kategori', header: 'Kategori' },
            { field: 'instansi', header: 'Instansi' },
            { field: 'email_instansi', header: 'Email Instansi' },
            { field: 'email', header: 'Email Pribadi' },
            { field: 'isActive', header: 'Is Active' }
        ];
        this.loadDatas();
    }

    loadDatas(){
      this.setOptions();
      this.ReuquestAPI("GET",`${environment.app.apiUrl}/api/users/withoutdelete`,[])
        .then((data)=>{
          this.dataSource = data;
          this.ReuquestAPI("GET",`${environment.app.apiUrl}/api/instansies`,[])
            .then((dataInstansi)=>{
              this.instansiTable = dataInstansi;
              // this.instansiOptions = [];
              // this.instansiOptions.push({label:'- Instansi? -', value:null});
              // for(let instansi of this.instansiTable){
              //   this.instansiOptions.push({label:instansi.name, value:instansi.id});
              // }
              this.selectOptions();
            });
        });
    }

    selectOptions(){
      var position:number =0;
      for (let data of this.dataSource){
        var kategoriName = this.selectKategori(data.kategori_id);
        var instansiName :any = this.instansiTable.find(o => o.id === data.instansi_id);
        console.log(instansiName.name);
        var activeDec = this.selectIsActive(data.is_active);
        this.dataSource[position]["kategori_nama"]=kategoriName;
        this.dataSource[position]["instansi_nama"]=instansiName.name;
        this.dataSource[position]["active_des"]=activeDec;
        position++;
      }
      this.dataSource$ = this.dataSource;
    }

    createDataForm(data: any) {
        if (data == null) data = new UserModel();
        // this.getInstansiOptions(data.id)
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
            instansi: new FormControl(data.instansi_id),
            password: new FormControl(data.password),
            repeatPassword: new FormControl(data.password)
        });
        this.getInstansiOptions(data.kategori_id);
    }

    addData() {
      this.disableInstansi=false;
      this.showPassword = true;
      this.createDataForm(null);
    }

    editData(data: any) {
      this.userSelected=data;
      this.disableInstansi=false;
      this.showPassword = false;
      this.createDataForm(data);
    }

    async validate(){
      if(this.dataForm.status == 'VALID'){
        if(this.f.kategori.value != 6 ){
          if(this.f.instansi.value != '' && this.f.emailInstansi.value != ''){
            this.save();
          }else{
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Instansi is still empty',
              life: 3000
            });
          }
        }else{
          this.save();
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

    async save(){
      try{
        if(this.showPassword){
          if(this.f.password.value == this.f.repeatPassword.value){  
            var dataCreate = {
              "name": this.f.name.value,"notlp":this.f.notlp.value,
              "kategori_id": this.f.kategori.value,"instansi_id": this.f.instansi.value,
              "email_instansi":this.f.emailInstansi.value,"email": this.f.email.value,
              "password":this.f.password.value,"is_active":this.f.isActive.value
            };
            this.ReuquestAPI("POST",`${environment.app.apiUrl}/api/users`,dataCreate)
            .then((data)=>{
              this.dataSource$.push(data);
              this.messageService.add({
                  severity: 'success',
                  summary: 'Successful',
                  detail: 'Data User Has Created',
                  life: 3000
              });
            }); 
          }else{
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: "New password and repeat password not same",
              life: 3000
            });
          }
        }else{
          var dataUpdate = {
            "name": this.f.name.value,"notlp":this.f.notlp.value,
            "kategori_id": this.f.kategori.value,"instansi_id": this.f.instansi.value,
            "email_instansi":this.f.emailInstansi.value,"email": this.f.email.value,
            "is_active":this.f.isActive.value
          };
          console.log("Update "+ JSON.stringify(dataUpdate));
          this.ReuquestAPI("PUT",`${environment.app.apiUrl}/api/users/`+this.f.id.value,dataUpdate)
          .then((data)=>{
            // this.dataSource$ = data;
            console.log(data);
            this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Data User Has Updated',
                life: 3000
            });
            // this.selectOptions();
          });
        }
      }catch(e:any){
        console.log(e);
        this.messageService.add({
          severity: 'error',
          summary: 'Failed',
          detail: 'Data User Fail Update / Created',
          life: 3000
        });
      }
    }

    async delete(data:any){
      this.confirmationService.confirm({
        message: 'Are you sure you want to delete ' + data.name + '?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            // this.permission = new Permission();
            try{
              this.ReuquestAPI("PUT",`${environment.app.apiUrl}/api/users/`+data.id,'{is_active:3}')
                .then((data)=>{
                  this.messageService.add({
                      severity: 'success',
                      summary: 'Successful',
                      detail: 'Data User Has Deleted',
                      life: 3000
                  });
                });
              // console.log(this.dataSource$.filter(element => element == data.id));
              this.dataSource$ = this.dataSource$.filter((u) => u.id !== data.id);
             }catch(e){
                this.messageService.add({
                  severity: 'error',
                  summary: 'Failed',
                  detail: 'Data User Fail Deleted',
                  life: 3000
              });
             } 
        }
      });
     
    }

    selectKategori(id:number):any{
      for(let kategori of this.kategoriOptions){
        if(kategori.value == id){
          return kategori.label;
        }
      }
      return '';
    }
    
    selectIsActive(value:number):any{
      // this.detailForm.get(isActive).setValue(3);
      for(let active of this.isActiveOptions){
        if(active.value == value){
          return active.label;
        }
      }
      return "";
    }

    onSelectKategori(){
      if(this.f.kategori.value != 6){
        this.disableInstansi = false;
        this.getInstansiOptions(this.f.kategori.value); 
      }
      else{
        this.disableInstansi = true;
        this.dataForm.patchValue({'instansi':null});
        this.dataForm.patchValue({'emailInstansi':null});
        this.dataForm.get('emailInstansi')?.disable();
      }
    }

    getInstansiOptions(id:any){
      console.log(id);
      if(id!= 6 && id != null && id!=undefined){
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
            if(this.userSelected.instansi_id != null){
              this.dataForm.patchValue({'instansi':this.userSelected.instansi_id});
            }
            this.dataForm.patchValue({'instansi':3});
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

