import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'home',
        loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'gallery',
        loadComponent: () => import('./components/gallery/gallery.component').then(m => m.GalleryComponent) 
    },
    {
        path: 'users',
        loadComponent: () => import('./components/users-listing/users-listing.component').then(m => m.UsersListingComponent)
    },
    { 
        path: '', 
        redirectTo: '/home', pathMatch: 'full' 
    }
];
