import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const user = sessionStorage.getItem('auth-user');

    if (user) {
        return true;
    }

    // Not logged in so redirect to login page with the return url
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
