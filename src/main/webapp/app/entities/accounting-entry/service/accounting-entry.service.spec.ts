import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { DATE_FORMAT } from 'app/config/input.constants';
import { IAccountingEntry } from '../accounting-entry.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../accounting-entry.test-samples';

import { AccountingEntryService, RestAccountingEntry } from './accounting-entry.service';

const requireRestSample: RestAccountingEntry = {
  ...sampleWithRequiredData,
  entryDate: sampleWithRequiredData.entryDate?.format(DATE_FORMAT),
  exportedAt: sampleWithRequiredData.exportedAt?.toJSON(),
};

describe('AccountingEntry Service', () => {
  let service: AccountingEntryService;
  let httpMock: HttpTestingController;
  let expectedResult: IAccountingEntry | IAccountingEntry[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(AccountingEntryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a AccountingEntry', () => {
      const accountingEntry = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(accountingEntry).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a AccountingEntry', () => {
      const accountingEntry = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(accountingEntry).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a AccountingEntry', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of AccountingEntry', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a AccountingEntry', () => {
      service.delete(123).subscribe();

      const requests = httpMock.match({ method: 'DELETE' });
      expect(requests.length).toBe(1);
    });

    describe('addAccountingEntryToCollectionIfMissing', () => {
      it('should add a AccountingEntry to an empty array', () => {
        const accountingEntry: IAccountingEntry = sampleWithRequiredData;
        expectedResult = service.addAccountingEntryToCollectionIfMissing([], accountingEntry);
        expect(expectedResult).toEqual([accountingEntry]);
      });

      it('should not add a AccountingEntry to an array that contains it', () => {
        const accountingEntry: IAccountingEntry = sampleWithRequiredData;
        const accountingEntryCollection: IAccountingEntry[] = [
          {
            ...accountingEntry,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addAccountingEntryToCollectionIfMissing(accountingEntryCollection, accountingEntry);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a AccountingEntry to an array that doesn't contain it", () => {
        const accountingEntry: IAccountingEntry = sampleWithRequiredData;
        const accountingEntryCollection: IAccountingEntry[] = [sampleWithPartialData];
        expectedResult = service.addAccountingEntryToCollectionIfMissing(accountingEntryCollection, accountingEntry);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(accountingEntry);
      });

      it('should add only unique AccountingEntry to an array', () => {
        const accountingEntryArray: IAccountingEntry[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const accountingEntryCollection: IAccountingEntry[] = [sampleWithRequiredData];
        expectedResult = service.addAccountingEntryToCollectionIfMissing(accountingEntryCollection, ...accountingEntryArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const accountingEntry: IAccountingEntry = sampleWithRequiredData;
        const accountingEntry2: IAccountingEntry = sampleWithPartialData;
        expectedResult = service.addAccountingEntryToCollectionIfMissing([], accountingEntry, accountingEntry2);
        expect(expectedResult).toEqual([accountingEntry, accountingEntry2]);
      });

      it('should accept null and undefined values', () => {
        const accountingEntry: IAccountingEntry = sampleWithRequiredData;
        expectedResult = service.addAccountingEntryToCollectionIfMissing([], null, accountingEntry, undefined);
        expect(expectedResult).toEqual([accountingEntry]);
      });

      it('should return initial array if no AccountingEntry is added', () => {
        const accountingEntryCollection: IAccountingEntry[] = [sampleWithRequiredData];
        expectedResult = service.addAccountingEntryToCollectionIfMissing(accountingEntryCollection, undefined, null);
        expect(expectedResult).toEqual(accountingEntryCollection);
      });
    });

    describe('compareAccountingEntry', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareAccountingEntry(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 1531 };
        const entity2 = null;

        const compareResult1 = service.compareAccountingEntry(entity1, entity2);
        const compareResult2 = service.compareAccountingEntry(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 1531 };
        const entity2 = { id: 21196 };

        const compareResult1 = service.compareAccountingEntry(entity1, entity2);
        const compareResult2 = service.compareAccountingEntry(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 1531 };
        const entity2 = { id: 1531 };

        const compareResult1 = service.compareAccountingEntry(entity1, entity2);
        const compareResult2 = service.compareAccountingEntry(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
