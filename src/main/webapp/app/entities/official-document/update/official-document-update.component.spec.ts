import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';
import { UserProfileService } from 'app/entities/user-profile/service/user-profile.service';
import { IOfficialDocument } from '../official-document.model';
import { OfficialDocumentService } from '../service/official-document.service';
import { OfficialDocumentFormService } from './official-document-form.service';

import { OfficialDocumentUpdateComponent } from './official-document-update.component';

describe('OfficialDocument Management Update Component', () => {
  let comp: OfficialDocumentUpdateComponent;
  let fixture: ComponentFixture<OfficialDocumentUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let officialDocumentFormService: OfficialDocumentFormService;
  let officialDocumentService: OfficialDocumentService;
  let companyService: CompanyService;
  let employeeService: EmployeeService;
  let userProfileService: UserProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OfficialDocumentUpdateComponent],
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
      .overrideTemplate(OfficialDocumentUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(OfficialDocumentUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    officialDocumentFormService = TestBed.inject(OfficialDocumentFormService);
    officialDocumentService = TestBed.inject(OfficialDocumentService);
    companyService = TestBed.inject(CompanyService);
    employeeService = TestBed.inject(EmployeeService);
    userProfileService = TestBed.inject(UserProfileService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Company query and add missing value', () => {
      const officialDocument: IOfficialDocument = { id: 8891 };
      const company: ICompany = { id: 29751 };
      officialDocument.company = company;

      const companyCollection: ICompany[] = [{ id: 29751 }];
      jest.spyOn(companyService, 'query').mockReturnValue(of(new HttpResponse({ body: companyCollection })));
      const additionalCompanies = [company];
      const expectedCollection: ICompany[] = [...additionalCompanies, ...companyCollection];
      jest.spyOn(companyService, 'addCompanyToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ officialDocument });
      comp.ngOnInit();

      expect(companyService.query).toHaveBeenCalled();
      expect(companyService.addCompanyToCollectionIfMissing).toHaveBeenCalledWith(
        companyCollection,
        ...additionalCompanies.map(expect.objectContaining),
      );
      expect(comp.companiesSharedCollection).toEqual(expectedCollection);
    });

    it('should call Employee query and add missing value', () => {
      const officialDocument: IOfficialDocument = { id: 8891 };
      const employee: IEmployee = { id: 1749 };
      officialDocument.employee = employee;

      const employeeCollection: IEmployee[] = [{ id: 1749 }];
      jest.spyOn(employeeService, 'query').mockReturnValue(of(new HttpResponse({ body: employeeCollection })));
      const additionalEmployees = [employee];
      const expectedCollection: IEmployee[] = [...additionalEmployees, ...employeeCollection];
      jest.spyOn(employeeService, 'addEmployeeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ officialDocument });
      comp.ngOnInit();

      expect(employeeService.query).toHaveBeenCalled();
      expect(employeeService.addEmployeeToCollectionIfMissing).toHaveBeenCalledWith(
        employeeCollection,
        ...additionalEmployees.map(expect.objectContaining),
      );
      expect(comp.employeesSharedCollection).toEqual(expectedCollection);
    });

    it('should call UserProfile query and add missing value', () => {
      const officialDocument: IOfficialDocument = { id: 8891 };
      const generatedBy: IUserProfile = { id: 22058 };
      officialDocument.generatedBy = generatedBy;

      const userProfileCollection: IUserProfile[] = [{ id: 22058 }];
      jest.spyOn(userProfileService, 'query').mockReturnValue(of(new HttpResponse({ body: userProfileCollection })));
      const additionalUserProfiles = [generatedBy];
      const expectedCollection: IUserProfile[] = [...additionalUserProfiles, ...userProfileCollection];
      jest.spyOn(userProfileService, 'addUserProfileToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ officialDocument });
      comp.ngOnInit();

      expect(userProfileService.query).toHaveBeenCalled();
      expect(userProfileService.addUserProfileToCollectionIfMissing).toHaveBeenCalledWith(
        userProfileCollection,
        ...additionalUserProfiles.map(expect.objectContaining),
      );
      expect(comp.userProfilesSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const officialDocument: IOfficialDocument = { id: 8891 };
      const company: ICompany = { id: 29751 };
      officialDocument.company = company;
      const employee: IEmployee = { id: 1749 };
      officialDocument.employee = employee;
      const generatedBy: IUserProfile = { id: 22058 };
      officialDocument.generatedBy = generatedBy;

      activatedRoute.data = of({ officialDocument });
      comp.ngOnInit();

      expect(comp.companiesSharedCollection).toContainEqual(company);
      expect(comp.employeesSharedCollection).toContainEqual(employee);
      expect(comp.userProfilesSharedCollection).toContainEqual(generatedBy);
      expect(comp.officialDocument).toEqual(officialDocument);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IOfficialDocument>>();
      const officialDocument = { id: 18816 };
      jest.spyOn(officialDocumentFormService, 'getOfficialDocument').mockReturnValue(officialDocument);
      jest.spyOn(officialDocumentService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ officialDocument });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: officialDocument }));
      saveSubject.complete();

      // THEN
      expect(officialDocumentFormService.getOfficialDocument).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(officialDocumentService.update).toHaveBeenCalledWith(expect.objectContaining(officialDocument));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IOfficialDocument>>();
      const officialDocument = { id: 18816 };
      jest.spyOn(officialDocumentFormService, 'getOfficialDocument').mockReturnValue({ id: null });
      jest.spyOn(officialDocumentService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ officialDocument: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: officialDocument }));
      saveSubject.complete();

      // THEN
      expect(officialDocumentFormService.getOfficialDocument).toHaveBeenCalled();
      expect(officialDocumentService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IOfficialDocument>>();
      const officialDocument = { id: 18816 };
      jest.spyOn(officialDocumentService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ officialDocument });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(officialDocumentService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareCompany', () => {
      it('should forward to companyService', () => {
        const entity = { id: 29751 };
        const entity2 = { id: 7586 };
        jest.spyOn(companyService, 'compareCompany');
        comp.compareCompany(entity, entity2);
        expect(companyService.compareCompany).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareEmployee', () => {
      it('should forward to employeeService', () => {
        const entity = { id: 1749 };
        const entity2 = { id: 1545 };
        jest.spyOn(employeeService, 'compareEmployee');
        comp.compareEmployee(entity, entity2);
        expect(employeeService.compareEmployee).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareUserProfile', () => {
      it('should forward to userProfileService', () => {
        const entity = { id: 22058 };
        const entity2 = { id: 9009 };
        jest.spyOn(userProfileService, 'compareUserProfile');
        comp.compareUserProfile(entity, entity2);
        expect(userProfileService.compareUserProfile).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
