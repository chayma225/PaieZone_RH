import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IUserProfile } from 'app/entities/user-profile/user-profile.model';
import { UserProfileService } from 'app/entities/user-profile/service/user-profile.service';
import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { IAuditLog } from '../audit-log.model';
import { AuditLogService } from '../service/audit-log.service';
import { AuditLogFormService } from './audit-log-form.service';

import { AuditLogUpdateComponent } from './audit-log-update.component';

describe('AuditLog Management Update Component', () => {
  let comp: AuditLogUpdateComponent;
  let fixture: ComponentFixture<AuditLogUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let auditLogFormService: AuditLogFormService;
  let auditLogService: AuditLogService;
  let userProfileService: UserProfileService;
  let companyService: CompanyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AuditLogUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(AuditLogUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(AuditLogUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    auditLogFormService = TestBed.inject(AuditLogFormService);
    auditLogService = TestBed.inject(AuditLogService);
    userProfileService = TestBed.inject(UserProfileService);
    companyService = TestBed.inject(CompanyService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call UserProfile query and add missing value', () => {
      const auditLog: IAuditLog = { id: 25691 };
      const user: IUserProfile = { id: 22058 };
      auditLog.user = user;

      const userProfileCollection: IUserProfile[] = [{ id: 22058 }];
      jest.spyOn(userProfileService, 'query').mockReturnValue(of(new HttpResponse({ body: userProfileCollection })));
      const additionalUserProfiles = [user];
      const expectedCollection: IUserProfile[] = [...additionalUserProfiles, ...userProfileCollection];
      jest.spyOn(userProfileService, 'addUserProfileToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ auditLog });
      comp.ngOnInit();

      expect(userProfileService.query).toHaveBeenCalled();
      expect(userProfileService.addUserProfileToCollectionIfMissing).toHaveBeenCalledWith(
        userProfileCollection,
        ...additionalUserProfiles.map(expect.objectContaining),
      );
      expect(comp.userProfilesSharedCollection).toEqual(expectedCollection);
    });

    it('should call Company query and add missing value', () => {
      const auditLog: IAuditLog = { id: 25691 };
      const company: ICompany = { id: 29751 };
      auditLog.company = company;

      const companyCollection: ICompany[] = [{ id: 29751 }];
      jest.spyOn(companyService, 'query').mockReturnValue(of(new HttpResponse({ body: companyCollection })));
      const additionalCompanies = [company];
      const expectedCollection: ICompany[] = [...additionalCompanies, ...companyCollection];
      jest.spyOn(companyService, 'addCompanyToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ auditLog });
      comp.ngOnInit();

      expect(companyService.query).toHaveBeenCalled();
      expect(companyService.addCompanyToCollectionIfMissing).toHaveBeenCalledWith(
        companyCollection,
        ...additionalCompanies.map(expect.objectContaining),
      );
      expect(comp.companiesSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const auditLog: IAuditLog = { id: 25691 };
      const user: IUserProfile = { id: 22058 };
      auditLog.user = user;
      const company: ICompany = { id: 29751 };
      auditLog.company = company;

      activatedRoute.data = of({ auditLog });
      comp.ngOnInit();

      expect(comp.userProfilesSharedCollection).toContainEqual(user);
      expect(comp.companiesSharedCollection).toContainEqual(company);
      expect(comp.auditLog).toEqual(auditLog);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAuditLog>>();
      const auditLog = { id: 25090 };
      jest.spyOn(auditLogFormService, 'getAuditLog').mockReturnValue(auditLog);
      jest.spyOn(auditLogService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ auditLog });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: auditLog }));
      saveSubject.complete();

      // THEN
      expect(auditLogFormService.getAuditLog).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(auditLogService.update).toHaveBeenCalledWith(expect.objectContaining(auditLog));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAuditLog>>();
      const auditLog = { id: 25090 };
      jest.spyOn(auditLogFormService, 'getAuditLog').mockReturnValue({ id: null });
      jest.spyOn(auditLogService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ auditLog: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: auditLog }));
      saveSubject.complete();

      // THEN
      expect(auditLogFormService.getAuditLog).toHaveBeenCalled();
      expect(auditLogService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAuditLog>>();
      const auditLog = { id: 25090 };
      jest.spyOn(auditLogService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ auditLog });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(auditLogService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareUserProfile', () => {
      it('should forward to userProfileService', () => {
        const entity = { id: 22058 };
        const entity2 = { id: 9009 };
        jest.spyOn(userProfileService, 'compareUserProfile');
        comp.compareUserProfile(entity, entity2);
        expect(userProfileService.compareUserProfile).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareCompany', () => {
      it('should forward to companyService', () => {
        const entity = { id: 29751 };
        const entity2 = { id: 7586 };
        jest.spyOn(companyService, 'compareCompany');
        comp.compareCompany(entity, entity2);
        expect(companyService.compareCompany).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
