import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { PaymentComponent } from './features/payment/payment.component';
import { SuccessComponent } from './features/payment/success/success.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
    { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },

    // Password Recovery
    { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
    { path: 'reset-password/:token', loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },

    // Protected Routes
    {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'dashboard/super-admin',
        loadComponent: () => import('./features/dashboard/super-admin/super-admin.component').then(m => m.SuperAdminComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['superadmin'] }
    },
    {
        path: 'profile',
        loadComponent: () => import('./features/profile-settings/profile-settings.component').then(m => m.ProfileSettingsComponent),
        canActivate: [authGuard]
    },

    // Marketplace
    { path: 'marketplace', loadComponent: () => import('./features/marketplace/marketplace.component').then(m => m.MarketplaceComponent) },
    {
        path: 'service/:id',
        loadComponent: () => import('./features/service-detail/service-detail.component').then(m => m.ServiceDetailComponent)
    },
    {
        path: 'create-service',
        loadComponent: () => import('./features/create-service/create-service.component').then(m => m.CreateServiceComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['host', 'admin', 'superadmin'] }
    },
    // Edit Service (NEW P2 Feature)
    {
        path: 'edit-service/:id',
        loadComponent: () => import('./features/edit-service/edit-service.component').then(m => m.EditServiceComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['host', 'admin', 'superadmin'] }
    },

    // Admin
    {
        path: 'admin',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['admin', 'superadmin'] }
    },

    // Payment
    {
        path: 'payment',
        component: PaymentComponent,
        canActivate: [authGuard]
    },
    { path: 'success', component: SuccessComponent },

    // Error Page Route
    {
        path: 'error',
        loadComponent: () => import('./layout/error/error.component').then(m => m.ErrorComponent)
    },

    // Footer Pages
    {
        path: 'help',
        loadComponent: () => import('./features/help-center/help-center.component').then(m => m.HelpCenterComponent)
    },
    {
        path: 'trust-safety',
        loadComponent: () => import('./features/trust-safety/trust-safety.component').then(m => m.TrustSafetyComponent)
    },
    {
        path: 'contact',
        loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent)
    },

    // Wildcard - Must be LAST (catches all unknown routes)
    { path: '**', redirectTo: '/error?type=404' }
];
