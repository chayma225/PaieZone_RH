import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { DataService } from './data.service';
import { ApiService } from './api.service';
import { AuthServerProvider } from 'app/core/auth/auth-jwt.service';

/**
 * Tests unitaires — DataService (Angular Signals)
 *
 * Couvre :
 * - Initialisation des signaux à leurs valeurs par défaut
 * - loadAll() sur token présent
 * - reset() — remise à zéro + rechargement
 * - companiesError signal sur erreur HTTP
 * - Signals réactifs : companies, stats, employees
 * - planLabel() helper
 */
describe('DataService', () => {
  let service: DataService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let authSpy: jasmine.SpyObj<AuthServerProvider>;

  const mockCompanies = [
    {
      id: 1,
      name: 'Atlas Tech',
      tradeName: '',
      taxId: '123',
      cnssId: '',
      city: 'Tunis',
      plan: 'PME',
      status: 'ACTIVE',
      mrr: 290,
      employees: 10,
      priceHT: 290,
      renewal: '',
      schema: 'atlas',
      createdAt: '2026-01-01',
      logoUrl: null,
      gouvernorat: '',
      address: '',
      postalCode: '',
      email: '',
      phone: '',
      website: '',
      legalForm: '',
      capitalSocial: null,
      mainActivity: '',
      maxEmployees: 30,
    },
  ];

  const mockStats: Record<string, number> = {
    totalCompanies: 5,
    totalEmployees: 42,
    activeEmployees: 40,
  };

  beforeEach(() => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'employees',
      'contracts',
      'leaveRequests',
      'advances',
      'payrollPeriods',
      'companies',
      'departments',
      'dashboardStats',
      'regulatoryParams',
      'myEmployee',
    ]);

    authSpy = jasmine.createSpyObj('AuthServerProvider', ['getToken']);
    authSpy.getToken.and.returnValue('fake-jwt-token');

    // Valeurs par défaut pour tous les appels API
    apiServiceSpy.employees.and.returnValue(of([]));
    apiServiceSpy.contracts.and.returnValue(of([]));
    apiServiceSpy.leaveRequests.and.returnValue(of([]));
    apiServiceSpy.advances.and.returnValue(of([]));
    apiServiceSpy.payrollPeriods.and.returnValue(of([]));
    apiServiceSpy.companies.and.returnValue(of(mockCompanies as any));
    apiServiceSpy.departments.and.returnValue(of([]));
    apiServiceSpy.dashboardStats.and.returnValue(of(mockStats));
    apiServiceSpy.regulatoryParams.and.returnValue(of([]));
    apiServiceSpy.myEmployee.and.returnValue(of(null));

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        DataService,
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: AuthServerProvider, useValue: authSpy },
      ],
    });

    service = TestBed.inject(DataService);
  });

  // ── Initialisation ─────────────────────────────────────────────

  describe('Initialisation des signaux', () => {
    it('companies() → tableau non vide après chargement', fakeAsync(() => {
      tick();
      expect(service.companies()).toHaveSize(1);
      expect(service.companies()[0].name).toBe('Atlas Tech');
    }));

    it('companiesLoaded() → true après chargement réussi', fakeAsync(() => {
      tick();
      expect(service.companiesLoaded()).toBeTrue();
    }));

    it('companiesError() → false après chargement réussi', fakeAsync(() => {
      tick();
      expect(service.companiesError()).toBeFalse();
    }));

    it('stats() → contient totalCompanies après chargement', fakeAsync(() => {
      tick();
      expect(service.stats()['totalCompanies']).toBe(5);
    }));

    it('employees() → initialisé vide', () => {
      expect(service.employees()).toEqual([]);
    });

    it('leaves() → initialisé vide', () => {
      expect(service.leaves()).toEqual([]);
    });
  });

  // ── loadAll() avec token ────────────────────────────────────────

  describe('loadAll() appelé sur token présent', () => {
    it("api.companies() est appelé à l'initialisation", () => {
      expect(apiServiceSpy.companies).toHaveBeenCalled();
    });

    it("api.dashboardStats() est appelé à l'initialisation", () => {
      expect(apiServiceSpy.dashboardStats).toHaveBeenCalled();
    });

    it("api.employees() est appelé à l'initialisation", () => {
      expect(apiServiceSpy.employees).toHaveBeenCalled();
    });
  });

  // ── reset() ────────────────────────────────────────────────────

  describe('reset()', () => {
    it('reset() remet companies à [] et companiesLoaded à false immédiatement', fakeAsync(() => {
      tick(); // laisse le premier chargement se terminer
      expect(service.companies()).toHaveSize(1);

      service.reset();
      // Juste après reset, avant le nouveau chargement
      expect(service.companiesLoaded()).toBeFalse();
      expect(service.companiesError()).toBeFalse();
    }));

    it('reset() déclenche un nouveau chargement', fakeAsync(() => {
      tick();
      const callsBefore = (apiServiceSpy.companies as jasmine.Spy).calls.count();

      service.reset();
      tick();

      const callsAfter = (apiServiceSpy.companies as jasmine.Spy).calls.count();
      expect(callsAfter).toBeGreaterThan(callsBefore);
    }));

    it('reset() recharge les stats', fakeAsync(() => {
      tick();
      const statsBefore = (apiServiceSpy.dashboardStats as jasmine.Spy).calls.count();

      service.reset();
      tick();

      expect((apiServiceSpy.dashboardStats as jasmine.Spy).calls.count()).toBeGreaterThan(statsBefore);
    }));
  });

  // ── companiesError signal ──────────────────────────────────────

  describe('companiesError signal', () => {
    beforeEach(() => {
      // Réinitialiser pour simuler une erreur
      TestBed.resetTestingModule();
      const errorApiSpy = jasmine.createSpyObj('ApiService', [
        'employees',
        'contracts',
        'leaveRequests',
        'advances',
        'payrollPeriods',
        'companies',
        'departments',
        'dashboardStats',
        'regulatoryParams',
        'myEmployee',
      ]);
      const errorAuthSpy = jasmine.createSpyObj('AuthServerProvider', ['getToken']);
      errorAuthSpy.getToken.and.returnValue('token');
      errorApiSpy.employees.and.returnValue(of([]));
      errorApiSpy.contracts.and.returnValue(of([]));
      errorApiSpy.leaveRequests.and.returnValue(of([]));
      errorApiSpy.advances.and.returnValue(of([]));
      errorApiSpy.payrollPeriods.and.returnValue(of([]));
      errorApiSpy.departments.and.returnValue(of([]));
      errorApiSpy.dashboardStats.and.returnValue(of({}));
      errorApiSpy.regulatoryParams.and.returnValue(of([]));
      errorApiSpy.myEmployee.and.returnValue(of(null));

      // companies → erreur 500
      const { throwError } = require('rxjs');
      errorApiSpy.companies.and.returnValue(throwError(() => ({ status: 500 })));

      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          DataService,
          { provide: ApiService, useValue: errorApiSpy },
          { provide: AuthServerProvider, useValue: errorAuthSpy },
        ],
      });
      service = TestBed.inject(DataService);
    });

    it('companiesError() → true après erreur HTTP', fakeAsync(() => {
      tick();
      expect(service.companiesError()).toBeTrue();
    }));

    it('companiesLoaded() → true même après erreur (ne bloque pas)', fakeAsync(() => {
      tick();
      expect(service.companiesLoaded()).toBeTrue();
    }));

    it('companies() → vide après erreur', fakeAsync(() => {
      tick();
      expect(service.companies()).toEqual([]);
    }));
  });

  // ── Helpers ────────────────────────────────────────────────────

  describe('Helpers', () => {
    it('planLabel("PME") → "PME"', () => {
      expect(service.planLabel('PME')).toContain('PME');
    });

    it('planLabel("STARTER") → contient "Starter"', () => {
      expect(service.planLabel('STARTER')).toContain('Starter');
    });

    it('planLabel("INCONNU") → retourne "INCONNU" (fallback)', () => {
      expect(service.planLabel('INCONNU')).toBe('INCONNU');
    });

    it('fmtTND(1500) → contient "TND"', () => {
      expect(service.fmtTND(1500)).toContain('TND');
    });

    it('fmtTNDdec(1543.685) → contient "1 543,685"', () => {
      const result = service.fmtTNDdec(1543.685);
      expect(result).toContain('TND');
    });
  });
});
