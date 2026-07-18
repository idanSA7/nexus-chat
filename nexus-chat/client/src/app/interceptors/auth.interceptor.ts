import { HttpInterceptorFn } from '@angular/common/http';

// הצינור החכם שמצמיד אוטומטית את מזהה המשתמש המחובר לכל בקשה שיוצאת לשרת!
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userId = localStorage.getItem('userId');
  
  if (userId) {
    // 🔓 מדביקים את ה-userId האמיתי של מי שמחובר כרגע בתוך ה-Header!
    const cloned = req.clone({
      setHeaders: {
        'x-user-id': userId
      }
    });
    return next(cloned);
  }
  
  return next(req);
};