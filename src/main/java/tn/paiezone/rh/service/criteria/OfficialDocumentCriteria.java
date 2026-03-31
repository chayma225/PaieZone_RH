package tn.paiezone.rh.service.criteria;

import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;
import tn.paiezone.rh.domain.enumeration.OfficialDocType;

/**
 * Criteria class for the {@link tn.paiezone.rh.domain.OfficialDocument} entity. This class is used
 * in {@link tn.paiezone.rh.web.rest.OfficialDocumentResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /official-documents?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class OfficialDocumentCriteria implements Serializable, Criteria {

    /**
     * Class for filtering OfficialDocType
     */
    public static class OfficialDocTypeFilter extends Filter<OfficialDocType> {

        public OfficialDocTypeFilter() {}

        public OfficialDocTypeFilter(OfficialDocTypeFilter filter) {
            super(filter);
        }

        @Override
        public OfficialDocTypeFilter copy() {
            return new OfficialDocTypeFilter(this);
        }
    }

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private OfficialDocTypeFilter docType;

    private StringFilter title;

    private IntegerFilter month;

    private IntegerFilter year;

    private InstantFilter generatedAt;

    private StringFilter fileUrl;

    private StringFilter signedBy;

    private InstantFilter sentAt;

    private StringFilter notes;

    private LongFilter companyId;

    private LongFilter employeeId;

    private LongFilter generatedById;

    private Boolean distinct;

    public OfficialDocumentCriteria() {}

    public OfficialDocumentCriteria(OfficialDocumentCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.docType = other.optionalDocType().map(OfficialDocTypeFilter::copy).orElse(null);
        this.title = other.optionalTitle().map(StringFilter::copy).orElse(null);
        this.month = other.optionalMonth().map(IntegerFilter::copy).orElse(null);
        this.year = other.optionalYear().map(IntegerFilter::copy).orElse(null);
        this.generatedAt = other.optionalGeneratedAt().map(InstantFilter::copy).orElse(null);
        this.fileUrl = other.optionalFileUrl().map(StringFilter::copy).orElse(null);
        this.signedBy = other.optionalSignedBy().map(StringFilter::copy).orElse(null);
        this.sentAt = other.optionalSentAt().map(InstantFilter::copy).orElse(null);
        this.notes = other.optionalNotes().map(StringFilter::copy).orElse(null);
        this.companyId = other.optionalCompanyId().map(LongFilter::copy).orElse(null);
        this.employeeId = other.optionalEmployeeId().map(LongFilter::copy).orElse(null);
        this.generatedById = other.optionalGeneratedById().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public OfficialDocumentCriteria copy() {
        return new OfficialDocumentCriteria(this);
    }

    public LongFilter getId() {
        return id;
    }

    public Optional<LongFilter> optionalId() {
        return Optional.ofNullable(id);
    }

    public LongFilter id() {
        if (id == null) {
            setId(new LongFilter());
        }
        return id;
    }

    public void setId(LongFilter id) {
        this.id = id;
    }

    public OfficialDocTypeFilter getDocType() {
        return docType;
    }

    public Optional<OfficialDocTypeFilter> optionalDocType() {
        return Optional.ofNullable(docType);
    }

    public OfficialDocTypeFilter docType() {
        if (docType == null) {
            setDocType(new OfficialDocTypeFilter());
        }
        return docType;
    }

    public void setDocType(OfficialDocTypeFilter docType) {
        this.docType = docType;
    }

    public StringFilter getTitle() {
        return title;
    }

    public Optional<StringFilter> optionalTitle() {
        return Optional.ofNullable(title);
    }

    public StringFilter title() {
        if (title == null) {
            setTitle(new StringFilter());
        }
        return title;
    }

    public void setTitle(StringFilter title) {
        this.title = title;
    }

    public IntegerFilter getMonth() {
        return month;
    }

    public Optional<IntegerFilter> optionalMonth() {
        return Optional.ofNullable(month);
    }

    public IntegerFilter month() {
        if (month == null) {
            setMonth(new IntegerFilter());
        }
        return month;
    }

    public void setMonth(IntegerFilter month) {
        this.month = month;
    }

    public IntegerFilter getYear() {
        return year;
    }

    public Optional<IntegerFilter> optionalYear() {
        return Optional.ofNullable(year);
    }

    public IntegerFilter year() {
        if (year == null) {
            setYear(new IntegerFilter());
        }
        return year;
    }

    public void setYear(IntegerFilter year) {
        this.year = year;
    }

    public InstantFilter getGeneratedAt() {
        return generatedAt;
    }

    public Optional<InstantFilter> optionalGeneratedAt() {
        return Optional.ofNullable(generatedAt);
    }

    public InstantFilter generatedAt() {
        if (generatedAt == null) {
            setGeneratedAt(new InstantFilter());
        }
        return generatedAt;
    }

    public void setGeneratedAt(InstantFilter generatedAt) {
        this.generatedAt = generatedAt;
    }

    public StringFilter getFileUrl() {
        return fileUrl;
    }

    public Optional<StringFilter> optionalFileUrl() {
        return Optional.ofNullable(fileUrl);
    }

    public StringFilter fileUrl() {
        if (fileUrl == null) {
            setFileUrl(new StringFilter());
        }
        return fileUrl;
    }

    public void setFileUrl(StringFilter fileUrl) {
        this.fileUrl = fileUrl;
    }

    public StringFilter getSignedBy() {
        return signedBy;
    }

    public Optional<StringFilter> optionalSignedBy() {
        return Optional.ofNullable(signedBy);
    }

    public StringFilter signedBy() {
        if (signedBy == null) {
            setSignedBy(new StringFilter());
        }
        return signedBy;
    }

    public void setSignedBy(StringFilter signedBy) {
        this.signedBy = signedBy;
    }

    public InstantFilter getSentAt() {
        return sentAt;
    }

    public Optional<InstantFilter> optionalSentAt() {
        return Optional.ofNullable(sentAt);
    }

    public InstantFilter sentAt() {
        if (sentAt == null) {
            setSentAt(new InstantFilter());
        }
        return sentAt;
    }

    public void setSentAt(InstantFilter sentAt) {
        this.sentAt = sentAt;
    }

    public StringFilter getNotes() {
        return notes;
    }

    public Optional<StringFilter> optionalNotes() {
        return Optional.ofNullable(notes);
    }

    public StringFilter notes() {
        if (notes == null) {
            setNotes(new StringFilter());
        }
        return notes;
    }

    public void setNotes(StringFilter notes) {
        this.notes = notes;
    }

    public LongFilter getCompanyId() {
        return companyId;
    }

    public Optional<LongFilter> optionalCompanyId() {
        return Optional.ofNullable(companyId);
    }

    public LongFilter companyId() {
        if (companyId == null) {
            setCompanyId(new LongFilter());
        }
        return companyId;
    }

    public void setCompanyId(LongFilter companyId) {
        this.companyId = companyId;
    }

    public LongFilter getEmployeeId() {
        return employeeId;
    }

    public Optional<LongFilter> optionalEmployeeId() {
        return Optional.ofNullable(employeeId);
    }

    public LongFilter employeeId() {
        if (employeeId == null) {
            setEmployeeId(new LongFilter());
        }
        return employeeId;
    }

    public void setEmployeeId(LongFilter employeeId) {
        this.employeeId = employeeId;
    }

    public LongFilter getGeneratedById() {
        return generatedById;
    }

    public Optional<LongFilter> optionalGeneratedById() {
        return Optional.ofNullable(generatedById);
    }

    public LongFilter generatedById() {
        if (generatedById == null) {
            setGeneratedById(new LongFilter());
        }
        return generatedById;
    }

    public void setGeneratedById(LongFilter generatedById) {
        this.generatedById = generatedById;
    }

    public Boolean getDistinct() {
        return distinct;
    }

    public Optional<Boolean> optionalDistinct() {
        return Optional.ofNullable(distinct);
    }

    public Boolean distinct() {
        if (distinct == null) {
            setDistinct(true);
        }
        return distinct;
    }

    public void setDistinct(Boolean distinct) {
        this.distinct = distinct;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        final OfficialDocumentCriteria that = (OfficialDocumentCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(docType, that.docType) &&
            Objects.equals(title, that.title) &&
            Objects.equals(month, that.month) &&
            Objects.equals(year, that.year) &&
            Objects.equals(generatedAt, that.generatedAt) &&
            Objects.equals(fileUrl, that.fileUrl) &&
            Objects.equals(signedBy, that.signedBy) &&
            Objects.equals(sentAt, that.sentAt) &&
            Objects.equals(notes, that.notes) &&
            Objects.equals(companyId, that.companyId) &&
            Objects.equals(employeeId, that.employeeId) &&
            Objects.equals(generatedById, that.generatedById) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(
            id,
            docType,
            title,
            month,
            year,
            generatedAt,
            fileUrl,
            signedBy,
            sentAt,
            notes,
            companyId,
            employeeId,
            generatedById,
            distinct
        );
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "OfficialDocumentCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalDocType().map(f -> "docType=" + f + ", ").orElse("") +
            optionalTitle().map(f -> "title=" + f + ", ").orElse("") +
            optionalMonth().map(f -> "month=" + f + ", ").orElse("") +
            optionalYear().map(f -> "year=" + f + ", ").orElse("") +
            optionalGeneratedAt().map(f -> "generatedAt=" + f + ", ").orElse("") +
            optionalFileUrl().map(f -> "fileUrl=" + f + ", ").orElse("") +
            optionalSignedBy().map(f -> "signedBy=" + f + ", ").orElse("") +
            optionalSentAt().map(f -> "sentAt=" + f + ", ").orElse("") +
            optionalNotes().map(f -> "notes=" + f + ", ").orElse("") +
            optionalCompanyId().map(f -> "companyId=" + f + ", ").orElse("") +
            optionalEmployeeId().map(f -> "employeeId=" + f + ", ").orElse("") +
            optionalGeneratedById().map(f -> "generatedById=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
