import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userId = localStorage.getItem('userId');
  
  if (userId) {
    const cloned = req.clone({
      setHeaders: {
        'x-user-id': userId
      }
    });
    return next(cloned);
  }
  
  return next(req);
};