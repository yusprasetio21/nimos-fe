import { MetadataErrorComponent } from './../component/metadata-error.component';
import { FaqComponent } from './../component/faq.component';
import { News2Component } from './../component/news2.component';
import { Layout0Component } from './layout0.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { IconsModule } from 'src/app/modules/icons/icons.module';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { RouterModule, Routes } from '@angular/router';
import { NgbDropdownModule, NgbProgressbarModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationModule } from '../../modules/i18n';
import { ExtrasModule } from '../partials/layout/extras/extras.module';
import { DrawersModule, DropdownMenusModule, ModalsModule, EngagesModule } from '../partials';
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
//import {ChartModule} from 'primeng/chart';
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
import { TreeModule } from 'primeng/tree';
import { TreeTableModule } from 'primeng/treetable';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { RegistrationComponent } from '../component/registration.component';
import { IndexComponent } from '../component/index.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MetadataComponent } from '../component/metadata.component';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule, MatCommonModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTreeModule } from '@angular/material/tree';
import { MaterialExampleModule } from 'src/app/material.module';
import { KeyFilterModule } from 'primeng/keyfilter';
import { AboutComponent } from '../component/about.component';
import { GlossaryComponent } from '../component/glossary.component';

const routes: Routes = [
    {
        path: '',
        component: Layout0Component,
        children: [
            { path: 'index', component: IndexComponent },
            { path: 'news2', component: News2Component },
            { path: 'registration2', component: RegistrationComponent },
            { path: 'metadata', component: MetadataComponent },
            { path: 'metadata/:id', component: MetadataComponent },
            { path: 'faq', component: FaqComponent },
            { path: 'about', component: AboutComponent },
            { path: 'glossary', component: GlossaryComponent },
            { path: 'metadata-error', component: MetadataErrorComponent }
        ]
    }
];

@NgModule({
    declarations: [
        Layout0Component,
        IndexComponent,
        News2Component,
        RegistrationComponent,
        MetadataComponent,
        MetadataErrorComponent,
        FaqComponent,
        AboutComponent,
        GlossaryComponent
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
        //ChartModule,
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
        TreeModule,
        TreeTableModule,
        VirtualScrollerModule,
        KeyFilterModule,

        //materialize
        MatNativeDateModule,
        MaterialExampleModule,
        MatButtonModule,
        MatCommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatTreeModule
    ],

    providers: [
        ConfirmationService,
        MessageService,
        DatePipe
        /*
         {provide: LocationStrategy, useClass: HashLocationStrategy},
         EventService, IconService, NodeService,
         PhotoService, MenuService, BreadcrumbService,
         MessageService, ConfirmationService, 
        */
    ],
    bootstrap: [MetadataComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    exports: [RouterModule]
})
export class Layout0Module {}
