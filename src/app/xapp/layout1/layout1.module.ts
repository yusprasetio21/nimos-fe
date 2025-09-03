import { AuditrailComponent } from './../component/auditrail.component';
import { DashboardUserComponent } from './../component/dashboard-user.component';
import { DashboardPicComponent } from './../component/dashboard-pic.component';
import { DashboardAdmComponent } from './../component/dashboard-adm.component';
import { IngestComponent } from './../component/ingests.component';
import { NewsComponent } from './../component/news.component';
import { StationAssignPicComponent } from './../component/station-assign-pic.component';
import { StationAssignAdmComponent } from './../component/station-assign-adm.component';
import { MyStationComponent } from './../component/my-station.component';
import { ParamComponent } from './../component/param.component';
import { ContactComponent } from './../component/contact.component';
import { DocumentComponent } from './../component/document.component';
import { WigosIdComponent } from './../component/wigos-id.component';
import { UserAdmComponent } from './../component/user-adm.component';
import { OrganizationComponent } from './../component/organization.component';
import { HeaderHttpInterceptor } from './../intercept/header.http.interceptor';
import { TranslationModule } from './../../modules/i18n/translation.module';
import { Layout1Component } from './layout1.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MenuItemComponent } from './components/aside/aside-menu/menu-item/menu-item.component';
import { IconsModule } from 'src/app/modules/icons/icons.module';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { RouterModule, Routes } from '@angular/router';
import { NgbDropdownModule, NgbProgressbarModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ExtrasModule } from '../partials/layout/extras/extras.module';
import { AsideComponent } from './components/aside/aside.component';
import { HeaderComponent } from './components/header/header.component';
import { ContentComponent } from './components/content/content.component';
import { FooterComponent } from './components/footer/footer.component';
import { ScriptsInitComponent } from './components/scripts-init/scripts-init.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { AsideMenuComponent } from './components/aside/aside-menu/aside-menu.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { PageTitleComponent } from './components/header/page-title/page-title.component';
import { HeaderMenuComponent } from './components/header/header-menu/header-menu.component';
import { DrawersModule, DropdownMenusModule, EngagesModule, ModalsModule } from '../partials';
import { EngagesComponent } from '../partials/layout/engages/engages.component';
import { ThemeModeModule } from '../partials/layout/theme-mode-switcher/theme-mode.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { ChipsModule } from 'primeng/chips';
import { CodeHighlighterModule } from 'primeng/codehighlighter';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { FieldsetModule } from 'primeng/fieldset';
import { FileUploadModule } from 'primeng/fileupload';
//import {FullCalendarModule} from 'primeng/fullcalendar';
//import {FullCalendarModule} from '@fullcalendar/angular';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';
import { InplaceModule } from 'primeng/inplace';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { KnobModule } from 'primeng/knob';
import { LightboxModule } from 'primeng/lightbox';
import { ListboxModule } from 'primeng/listbox';
import { MegaMenuModule } from 'primeng/megamenu';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { OrderListModule } from 'primeng/orderlist';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PaginatorModule } from 'primeng/paginator';
import { PanelModule } from 'primeng/panel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { PasswordModule } from 'primeng/password';
import { PickListModule } from 'primeng/picklist';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ScrollTopModule } from 'primeng/scrolltop';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SidebarModule } from 'primeng/sidebar';
import { SkeletonModule } from 'primeng/skeleton';
import { SlideMenuModule } from 'primeng/slidemenu';
import { SliderModule } from 'primeng/slider';
import { SplitButtonModule } from 'primeng/splitbutton';
import { SplitterModule } from 'primeng/splitter';
import { StepsModule } from 'primeng/steps';
import { TabMenuModule } from 'primeng/tabmenu';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { TerminalModule } from 'primeng/terminal';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TreeTableModule } from 'primeng/treetable';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { EditorModule } from 'primeng/editor';
import { KeyFilterModule } from 'primeng/keyfilter';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UserPicComponent } from '../component/user-pic.component';
import { ProfileComponent } from '../component/profile.component';
import { BibliographyComponent } from '../component/bibliography.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatCommonModule, MatNativeDateModule } from '@angular/material/core';
import { MaterialExampleModule } from 'src/app/material.module';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { TreeSelectModule } from 'primeng/treeselect';
import { NodeService } from '../component/nodeservice';
import { StationEditComponent } from '../component/station-edit.component';
import { StationNewComponent } from '../component/station-new.component';
import { MetadataComponent } from '../component/metadata.component';
import { DashboardComponent } from '../component/dashboard.component';
import { ScrollerModule } from 'primeng/scroller';

const routes: Routes = [
    {
        path: '',
        component: Layout1Component,
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'dashboard-adm', component: DashboardAdmComponent },
            { path: 'dashboard-pic', component: DashboardPicComponent },
            { path: 'dashboard-user', component: DashboardUserComponent },
            { path: 'profiles', component: ProfileComponent },
            { path: 'organizations', component: OrganizationComponent },
            { path: 'user-pics', component: UserPicComponent },
            { path: 'user-adms', component: UserAdmComponent },
            { path: 'station-assign-adms', component: StationAssignAdmComponent },
            { path: 'station-assign-pics', component: StationAssignPicComponent },
            { path: 'station-news', component: StationNewComponent },
            { path: 'wigos-ids', component: WigosIdComponent },
            { path: 'bibliographies', component: BibliographyComponent },
            { path: 'documents', component: DocumentComponent },
            { path: 'contacts', component: ContactComponent },
            { path: 'portals', component: ParamComponent },
            { path: 'station-edits', component: StationEditComponent },
            { path: 'station-edits/:id', component: StationEditComponent },
            { path: 'my-stations', component: MyStationComponent },
            { path: 'news', component: NewsComponent },
            { path: 'ingests', component: IngestComponent },
            { path: 'auditrails', component: AuditrailComponent }
        ]
    }
];

@NgModule({
    declarations: [
        Layout1Component,
        AsideComponent,
        HeaderComponent,
        ContentComponent,
        FooterComponent,
        ScriptsInitComponent,
        ToolbarComponent,
        AsideMenuComponent,
        TopbarComponent,
        PageTitleComponent,
        HeaderMenuComponent,
        EngagesComponent,
        MenuItemComponent,

        DashboardAdmComponent,
        DashboardPicComponent,
        DashboardUserComponent,
        DashboardComponent,
        ProfileComponent,
        OrganizationComponent,
        UserPicComponent,
        UserAdmComponent,
        StationAssignAdmComponent,
        StationAssignPicComponent,

        StationNewComponent,
        WigosIdComponent,
        BibliographyComponent,
        DocumentComponent,
        ContactComponent,
        ParamComponent,
        StationEditComponent,
        MyStationComponent,
        NewsComponent,
        IngestComponent,
        AuditrailComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TranslationModule,
        InlineSVGModule,
        NgbDropdownModule,
        NgbProgressbarModule,
        ExtrasModule,
        ModalsModule,
        DrawersModule,
        EngagesModule,
        DropdownMenusModule,
        NgbTooltipModule,
        TranslateModule,
        ThemeModeModule,
        IconsModule,
        /* PrimeNG Module */
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        AccordionModule,
        AutoCompleteModule,
        AvatarModule,
        AvatarGroupModule,
        BadgeModule,
        BreadcrumbModule,
        ButtonModule,
        CalendarModule,
        CardModule,
        CarouselModule,
        CascadeSelectModule,
        ChartModule,
        CheckboxModule,
        ChipModule,
        ChipsModule,
        CodeHighlighterModule,
        ConfirmDialogModule,
        ConfirmPopupModule,
        ColorPickerModule,
        ContextMenuModule,
        DataViewModule,
        DialogModule,
        DividerModule,
        DropdownModule,
        FieldsetModule,
        FileUploadModule,
        //FullCalendarModule,
        GalleriaModule,
        ImageModule,
        InplaceModule,
        InputNumberModule,
        InputMaskModule,
        InputSwitchModule,
        InputTextModule,
        InputTextareaModule,
        KnobModule,
        LightboxModule,
        ListboxModule,
        MegaMenuModule,
        MenuModule,
        MenubarModule,
        MessageModule,
        MessagesModule,
        MultiSelectModule,
        OrderListModule,
        OrganizationChartModule,
        OverlayPanelModule,
        PaginatorModule,
        PanelModule,
        PanelMenuModule,
        PasswordModule,
        PickListModule,
        ProgressBarModule,
        NgxSpinnerModule,
        RadioButtonModule,
        RatingModule,
        RippleModule,
        ScrollPanelModule,
        ScrollTopModule,
        SelectButtonModule,
        SidebarModule,
        SkeletonModule,
        SlideMenuModule,
        SliderModule,
        SplitButtonModule,
        SplitterModule,
        StepsModule,
        TableModule,
        TabMenuModule,
        TabViewModule,
        TagModule,
        TerminalModule,
        TimelineModule,
        TieredMenuModule,
        ToastModule,
        ToggleButtonModule,
        ToolbarModule,
        TooltipModule,
        TreeTableModule,
        VirtualScrollerModule,
        TreeSelectModule,
        KeyFilterModule,
        ScrollerModule,

        //materialize
        MatNativeDateModule,
        MaterialExampleModule,
        MatButtonModule,
        MatCommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatTreeModule,

        PdfViewerModule,
        GalleriaModule,
        EditorModule
    ],

    providers: [
        /* Xapp Interceptor */
        HeaderHttpInterceptor,
        { provide: HTTP_INTERCEPTORS, useExisting: HeaderHttpInterceptor, multi: true },
        ConfirmationService,
        MessageService,
        DatePipe,
        NodeService
        /*
         {provide: LocationStrategy, useClass: HashLocationStrategy},
         EventService, IconService, NodeService,
         PhotoService, MenuService, BreadcrumbService,
         MessageService, ConfirmationService,
        */
    ],
    exports: [RouterModule],
    bootstrap: [MetadataComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class Layout1Module {}
