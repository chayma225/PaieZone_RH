import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IJobPosition } from '../job-position.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../job-position.test-samples';

import { JobPositionService } from './job-position.service';

const requireRestSample: IJobPosition = {
  ...sampleWithRequiredData,
};

describe('JobPosition Service', () => {
  let service: JobPositionService;
  let httpMock: HttpTestingController;
  let expectedResult: IJobPosition | IJobPosition[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(JobPositionService);
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

    it('should create a JobPosition', () => {
      const jobPosition = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(jobPosition).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a JobPosition', () => {
      const jobPosition = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(jobPosition).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a JobPosition', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of JobPosition', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a JobPosition', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addJobPositionToCollectionIfMissing', () => {
      it('should add a JobPosition to an empty array', () => {
        const jobPosition: IJobPosition = sampleWithRequiredData;
        expectedResult = service.addJobPositionToCollectionIfMissing([], jobPosition);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(jobPosition);
      });

      it('should not add a JobPosition to an array that contains it', () => {
        const jobPosition: IJobPosition = sampleWithRequiredData;
        const jobPositionCollection: IJobPosition[] = [
          {
            ...jobPosition,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addJobPositionToCollectionIfMissing(jobPositionCollection, jobPosition);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a JobPosition to an array that doesn't contain it", () => {
        const jobPosition: IJobPosition = sampleWithRequiredData;
        const jobPositionCollection: IJobPosition[] = [sampleWithPartialData];
        expectedResult = service.addJobPositionToCollectionIfMissing(jobPositionCollection, jobPosition);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(jobPosition);
      });

      it('should add only unique JobPosition to an array', () => {
        const jobPositionArray: IJobPosition[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const jobPositionCollection: IJobPosition[] = [sampleWithRequiredData];
        expectedResult = service.addJobPositionToCollectionIfMissing(jobPositionCollection, ...jobPositionArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const jobPosition: IJobPosition = sampleWithRequiredData;
        const jobPosition2: IJobPosition = sampleWithPartialData;
        expectedResult = service.addJobPositionToCollectionIfMissing([], jobPosition, jobPosition2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(jobPosition);
        expect(expectedResult).toContain(jobPosition2);
      });

      it('should accept null and undefined values', () => {
        const jobPosition: IJobPosition = sampleWithRequiredData;
        expectedResult = service.addJobPositionToCollectionIfMissing([], null, jobPosition, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(jobPosition);
      });

      it('should return initial array if no JobPosition is added', () => {
        const jobPositionCollection: IJobPosition[] = [sampleWithRequiredData];
        expectedResult = service.addJobPositionToCollectionIfMissing(jobPositionCollection, undefined, null);
        expect(expectedResult).toEqual(jobPositionCollection);
      });
    });

    describe('compareJobPosition', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareJobPosition(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 27621 };
        const entity2 = null;

        const compareResult1 = service.compareJobPosition(entity1, entity2);
        const compareResult2 = service.compareJobPosition(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 27621 };
        const entity2 = { id: 16817 };

        const compareResult1 = service.compareJobPosition(entity1, entity2);
        const compareResult2 = service.compareJobPosition(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 27621 };
        const entity2 = { id: 27621 };

        const compareResult1 = service.compareJobPosition(entity1, entity2);
        const compareResult2 = service.compareJobPosition(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
