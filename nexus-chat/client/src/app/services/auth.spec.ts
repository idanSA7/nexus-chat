import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

// הצהרת משתנים כדי למנוע מהקומפיילר לצעוק על סביבת הבדיקות
declare var describe: any;
declare var beforeEach: any;
declare var it: any;
declare var expect: any;

describe('AuthService Static Verification', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created and compiled cleanly', () => {
    expect(service).toBeTruthy();
  });
});