import { Routes } from '@angular/router';
import { UserComponent } from '../modules/user/user.component';

const Routing: Routes = [
    {
        path: 'dashboard/old',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
    },
    {
        path: 'master/auth/users',
        loadChildren: () => import('../modules/user/users.module').then(m => m.UsersModule)
    },
    {
        path: 'master/auth/roles',
        loadChildren: () => import('./master/auth/roles/roles.module').then(m => m.RolesModule)
    },
    {
        path: 'observation',
        loadChildren: () => import('../modules/observations/observation.module').then(m => m.ObservationModule)
    },
    {
        path: 'master/auth/permissions',
        loadChildren: () => import('./master/auth/permission/permission.module').then(m => m.PermissionModule)
    },
    {
        path: 'master/auth/instansi',
        loadChildren: () => import('../modules/instansi/instansi.module').then(m => m.InstansiModule)
    },
    {
        path: 'builder',
        loadChildren: () => import('./builder/builder.module').then(m => m.BuilderModule)
    },
    {
        path: 'pages/profile',
        loadChildren: () => import('../modules/profile/profile.module').then(m => m.ProfileModule)
    },
    {
        path: 'crafted/account',
        loadChildren: () => import('../modules/account/account.module').then(m => m.AccountModule)
    },
    {
        path: 'crafted/pages/wizards',
        loadChildren: () => import('../modules/wizards/wizards.module').then(m => m.WizardsModule)
    },
    {
        path: 'crafted/widgets',
        loadChildren: () =>
            import('../modules/widgets-examples/widgets-examples.module').then(m => m.WidgetsExamplesModule)
    },
    {
        path: 'apps/chat',
        loadChildren: () => import('../modules/apps/chat/chat.module').then(m => m.ChatModule)
    },
    /*{
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
    },*/
    {
        path: '',
        redirectTo: '/index',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'error/404'
    }
];

export { Routing };
