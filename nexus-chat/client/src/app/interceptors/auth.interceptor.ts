import { HttpInterceptorFn } from '@angular/common/http';

// הצינור החכם והמעודכן שמצמיד אוטומטית את מזהה המשתמש האמיתי לכל בקשה!
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userId = localStorage.getItem('userId');
  
  if (userId) {
    // 🚀 מצרפים את ה-ID האמיתי של סהר בתוך ה-Header שנקרא x-user-id
    const cloned = req.clone({
      setHeaders: {
        'x-user-id': userId
      }
    });
    return next(cloned);
  }
  
  return next(req);
};