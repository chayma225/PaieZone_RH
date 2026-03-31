import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ICompanySubscription } from '../company-subscription.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../company-subscription.test-samples';

import { CompanySubscriptionService, RestCompanySubscription } from './company-subscription.service';

const requireRestSample: RestCompanySubscription = {
  ...sampleWithRequiredData,
  startDate: sampleWithRequiredData.startDate?.format(DATE_FORMAT),
  endDate: sampleWithRequiredData.endDate?.format(DATE_FORMAT),
  renewalDate: sampleWithRequiredData.renewalDate?.format(DATE_FORMAT),
};

describe('CompanySubscription Service', () => {
  let service: CompanySubscriptionService;
  let httpMock: HttpTestingController;
  let expectedResult: ICompanySubscription | ICompanySubscription[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(CompanySubscriptionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a CompanySubscription', () => {
      const companySubscription = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(companySubscription).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a CompanySubscription', () => {
      const companySubscription = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(companySubscription).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a CompanySubscription', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of CompanySubscription', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a CompanySubscription', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addCompanySubscriptionToCollectionIfMissing', () => {
      it('should add a CompanySubscription to an empty array', () => {
        const companySubscription: ICompanySubscription = sampleWithRequiredData;
        expectedResult = service.addCompanySubscriptionToCollectionIfMissing([], companySubscription);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(companySubscription);
      });

      it('should not add a CompanySubscription to an array that contains it', () => {
        const companySubscription: ICompanySubscription = sampleWithRequiredData;
        const companySubscriptionCollection: ICompanySubscription[] = [
          {
            ...companySubscription,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addCompanySubscriptionToCollectionIfMissing(companySubscriptionCollection, companySubscription);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a CompanySubscription to an array that doesn't contain it", () => {
        const companySubscription: ICompanySubscription = sampleWithRequiredData;
        const companySubscriptionCollection: ICompanySubscription[] = [sampleWithPartialData];
        expectedResult = service.addCompanySubscriptionToCollectionIfMissing(companySubscriptionCollection, companySubscription);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(companySubscription);
      });

      it('should add only unique CompanySubscription to an array', () => {
        const companySubscriptionArray: ICompanySubscription[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const companySubscriptionCollection: ICompanySubscription[] = [sampleWithRequiredData];
        expectedResult = service.addCompanySubscriptionToCollectionIfMissing(companySubscriptionCollection, ...companySubscriptionArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const companySubscription: ICompanySubscription = sampleWithRequiredData;
        const companySubscription2: ICompanySubscription = sampleWithPartialData;
        expectedResult = service.addCompanySubscriptionToCollectionIfMissing([], companySubscription, companySubscription2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(companySubscription);
        expect(expectedResult).toContain(companySubscription2);
      });

      it('should accept null and undefined values', () => {
        const companySubscription: ICompanySubscription = sampleWithRequiredData;
        expectedResult = service.addCompanySubscriptionToCollectionIfMissing([], null, companySubscription, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(companySubscription);
      });

      it('should return initial array if no CompanySubscription is added', () => {
        const companySubscriptionCollection: ICompanySubscription[] = [sampleWithRequiredData];
        expectedResult = service.addCompanySubscriptionToCollectionIfMissing(companySubscriptionCollection, undefined, null);
        expect(expectedResult).toEqual(companySubscriptionCollection);
      });
    });

    describe('compareCompanySubscription', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareCompanySubscription(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 20273 };
        const entity2 = null;

        const compareResult1 = service.compareCompanySubscription(entity1, entity2);
        const compareResult2 = service.compareCompanySubscription(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 20273 };
        const entity2 = { id: 3576 };

        const compareResult1 = service.compareCompanySubscription(entity1, entity2);
        const compareResult2 = service.compareCompanySubscription(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 20273 };
        const entity2 = { id: 20273 };

        const compareResult1 = service.compareCompanySubscription(entity1, entity2);
        const compareResult2 = service.compareCompanySubscription(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
