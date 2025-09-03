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
    templateUrl: './instansi.component.html',
    styleUrls: ['./instansi.component.scss'],
    providers: [MessageService, ConfirmationService]
})
export class InstansiComponent extends BaseComponent implements OnInit {
    isActive: SelectItem;
    isActiveOptions: SelectItem[];

    kategoriOptions: SelectItem[];

    instansi:Instansi;

    //Table
    cols: any[] = [];
    dataSource$: Instansi[];
    selectInstansi :Instansi[];

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
        { field: 'alamat', header: 'Alamat' },
        { field: 'email', header: 'Email' },
        { field: 'isActive', header: 'Is Active' }
      ];
        this.loadDatas();
    }

    loadDatas(){
      this.setOptions();
      this.ReuquestAPI("GET",`${environment.app.apiUrl}/api/instansies/withoutdelete`,[])
        .then((data)=>{
          this.dataSource$ = data;
          this.selectOptions();
        });
      
    }

    selectOptions(){
      var position:number =0;
          for (let data of this.dataSource$){
            var kategoriName = this.selectKategori(data.kategori_id);
            var activeDec = this.selectIsActive(data.is_active);
            this.dataSource$[position]["kategori_nama"]=kategoriName;
            this.dataSource$[position]["active_des"]=activeDec;
            position++;
          }
    }

    createDataForm(data: any) {
       if (data == null) data = new UserModel();
        this.dataForm = this.fb.group({
            id: new FormControl(data.id),
            code:new FormControl(data.code),
            name: new FormControl(data.name,Validators.required),
            sort_name: new FormControl(data.sort_name),
            address: new FormControl(data.address),
            pic_contact: new FormControl(data.pic_contact),
            isActive: new FormControl(data.is_active,Validators.required),
            notlp: new FormControl(data.notlp),
            email: new FormControl(data.email,[Validators.required, 
              Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]),
            kategori: new FormControl(data.kategori_id,Validators.required),
        });
      // console.log("ID = "+this.f.id.value);
    }

    addData() {
      this.createDataForm(null);
    }

    editData(data: any) {
      this.createDataForm(data);
    }

    async validate(){
      if(this.dataForm.status == 'VALID'){
        this.save();
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
        var paramsData = {
          "name": this.f.name.value,
          "sort_name": this.f.sort_name.value,
          "code":this.f.code.value,
          "address":this.f.address.value,
          "pic_contact":this.f.pic_contact.value,
          "notlp":this.f.notlp.value==null?this.f.notlp.value:''+this.f.notlp.value,
          "kategori_id": this.f.kategori.value,
          "email": this.f.email.value,
          "is_active":this.f.isActive.value
        };
        console.log(JSON.stringify(paramsData));
        if(this.f.id.value == null){
          this.ReuquestAPI("POST",`${environment.app.apiUrl}/api/instansies`,paramsData)
            .then((data)=>{
              this.dataSource$.push(data);
              this.messageService.add({
                  severity: 'success',
                  summary: 'Successful',
                  detail: 'Data Instansi Has Created',
                  life: 3000
              });
              this.selectOptions();
          });
        } else{
          console.log("Update ="+this.f.id.value);
          this.ReuquestAPI("PUT",`${environment.app.apiUrl}/api/instansies/`+this.f.id.value,paramsData)
            .then((data)=>{
              this.dataSource$.forEach((element,index)=>{
                if(element.code==this.f.code.value){
                  this.dataSource$.splice(index,1,data);
                } 
              });
              this.messageService.add({
                  severity: 'success',
                  summary: 'Successful',
                  detail: 'Data Instansi Has Created',
                  life: 3000
              });
              this.selectOptions();
        });
        }
      }catch(e:any){
        console.log(e);
        this.messageService.add({
          severity: 'error',
          summary: 'Failed',
          detail: 'Data Instansi Fail Update / Created',
          life: 3000
        });
      }
    }

    async delete(instansi:any){
      this.confirmationService.confirm({
        message: 'Are you sure you want to delete ' + instansi.name + '?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            try{
              console.log(instansi.id);
              var paramsData = {
                "name": instansi.name,
                "code": instansi.code,
                "is_active":3
              };
              console.log(JSON.stringify(paramsData));
              this.ReuquestAPI("PUT",`${environment.app.apiUrl}/api/instansies/`+instansi.id,paramsData)
                .then((data)=>{
                  this.dataSource$.forEach((element,index)=>{
                    if(element.code==instansi.code){
                      this.dataSource$.splice(index,1);
                    } 
                  });
                  this.messageService.add({
                      severity: 'success',
                      summary: 'Successful',
                      detail: 'Data Instansi Has Deleted',
                      life: 3000
                  });
                });
              // this.dataSource$ = this.dataSource$.filter((u) => u.id !== data.id);
             }catch(e){
                this.messageService.add({
                  severity: 'error',
                  summary: 'Failed',
                  detail: 'Data Instansi Fail Deleted',
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

    setOptions(){
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
      // this.kategoriOptions.push({label:'Pengamatan Mandiri', value:6});

    }
}
