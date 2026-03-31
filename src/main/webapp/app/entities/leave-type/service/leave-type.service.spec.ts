import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ILeaveType } from '../leave-type.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../leave-type.test-samples';

import { LeaveTypeService } from './leave-type.service';

const requireRestSample: ILeaveType = {
  ...sampleWithRequiredData,
};

describe('LeaveType Service', () => {
  let service: LeaveTypeService;
  let httpMock: HttpTestingController;
  let expectedResult: ILeaveType | ILeaveType[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(LeaveTypeService);
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

    it('should create a LeaveType', () => {
      const leaveType = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(leaveType).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a LeaveType', () => {
      const leaveType = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(leaveType).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a LeaveType', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of LeaveType', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a LeaveType', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addLeaveTypeToCollectionIfMissing', () => {
      it('should add a LeaveType to an empty array', () => {
        const leaveType: ILeaveType = sampleWithRequiredData;
        expectedResult = service.addLeaveTypeToCollectionIfMissing([], leaveType);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(leaveType);
      });

      it('should not add a LeaveType to an array that contains it', () => {
        const leaveType: ILeaveType = sampleWithRequiredData;
        const leaveTypeCollection: ILeaveType[] = [
          {
            ...leaveType,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addLeaveTypeToCollectionIfMissing(leaveTypeCollection, leaveType);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a LeaveType to an array that doesn't contain it", () => {
        const leaveType: ILeaveType = sampleWithRequiredData;
        const leaveTypeCollection: ILeaveType[] = [sampleWithPartialData];
        expectedResult = service.addLeaveTypeToCollectionIfMissing(leaveTypeCollection, leaveType);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(leaveType);
      });

      it('should add only unique LeaveType to an array', () => {
        const leaveTypeArray: ILeaveType[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const leaveTypeCollection: ILeaveType[] = [sampleWithRequiredData];
        expectedResult = service.addLeaveTypeToCollectionIfMissing(leaveTypeCollection, ...leaveTypeArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const leaveType: ILeaveType = sampleWithRequiredData;
        const leaveType2: ILeaveType = sampleWithPartialData;
        expectedResult = service.addLeaveTypeToCollectionIfMissing([], leaveType, leaveType2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(leaveType);
        expect(expectedResult).toContain(leaveType2);
      });

      it('should accept null and undefined values', () => {
        const leaveType: ILeaveType = sampleWithRequiredData;
        expectedResult = service.addLeaveTypeToCollectionIfMissing([], null, leaveType, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(leaveType);
      });

      it('should return initial array if no LeaveType is added', () => {
        const leaveTypeCollection: ILeaveType[] = [sampleWithRequiredData];
        expectedResult = service.addLeaveTypeToCollectionIfMissing(leaveTypeCollection, undefined, null);
        expect(expectedResult).toEqual(leaveTypeCollection);
      });
    });

    describe('compareLeaveType', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareLeaveType(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 22862 };
        const entity2 = null;

        const compareResult1 = service.compareLeaveType(entity1, entity2);
        const compareResult2 = service.compareLeaveType(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 22862 };
        const entity2 = { id: 27866 };

        const compareResult1 = service.compareLeaveType(entity1, entity2);
        const compareResult2 = service.compareLeaveType(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 22862 };
        const entity2 = { id: 22862 };

        const compareResult1 = service.compareLeaveType(entity1, entity2);
        const compareResult2 = service.compareLeaveType(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
