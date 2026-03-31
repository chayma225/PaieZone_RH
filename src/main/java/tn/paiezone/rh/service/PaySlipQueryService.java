package tn.paiezone.rh.service;

import jakarta.persistence.criteria.JoinType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;
import tn.paiezone.rh.domain.*; // for static metamodels
import tn.paiezone.rh.domain.PaySlip;
import tn.paiezone.rh.repository.PaySlipRepository;
import tn.paiezone.rh.service.criteria.PaySlipCriteria;
import tn.paiezone.rh.service.dto.PaySlipDTO;
import tn.paiezone.rh.service.mapper.PaySlipMapper;

/**
 * Service for executing complex queries for {@link PaySlip} entities in the database.
 * The main input is a {@link PaySlipCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link PaySlipDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class PaySlipQueryService extends QueryService<PaySlip> {

    private static final Logger LOG = LoggerFactory.getLogger(PaySlipQueryService.class);

    private final PaySlipRepository paySlipRepository;

    private final PaySlipMapper paySlipMapper;

    public PaySlipQueryService(PaySlipRepository paySlipRepository, PaySlipMapper paySlipMapper) {
        this.paySlipRepository = paySlipRepository;
        this.paySlipMapper = paySlipMapper;
    }

    /**
     * Return a {@link Page} of {@link PaySlipDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<PaySlipDTO> findByCriteria(PaySlipCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<PaySlip> specification = createSpecification(criteria);
        return paySlipRepository.findAll(specification, page).map(paySlipMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(PaySlipCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<PaySlip> specification = createSpecification(criteria);
        return paySlipRepository.count(specification);
    }

    /**
     * Function to convert {@link PaySlipCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<PaySlip> createSpecification(PaySlipCriteria criteria) {
        Specification<PaySlip> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : null,
                buildRangeSpecification(criteria.getId(), PaySlip_.id),
                buildRangeSpecification(criteria.getMonth(), PaySlip_.month),
                buildRangeSpecification(criteria.getYear(), PaySlip_.year),
                buildRangeSpecification(criteria.getBaseSalary(), PaySlip_.baseSalary),
                buildRangeSpecification(criteria.getTotalGains(), PaySlip_.totalGains),
                buildRangeSpecification(criteria.getTotalDeductions(), PaySlip_.totalDeductions),
                buildRangeSpecification(criteria.getGrossSalary(), PaySlip_.grossSalary),
                buildRangeSpecification(criteria.getCnssSalaryAmount(), PaySlip_.cnssSalaryAmount),
                buildRangeSpecification(criteria.getCavisAmount(), PaySlip_.cavisAmount),
                buildRangeSpecification(criteria.getTaxableIncome(), PaySlip_.taxableIncome),
                buildRangeSpecification(criteria.getIrppAmount(), PaySlip_.irppAmount),
                buildRangeSpecification(criteria.getNetSalary(), PaySlip_.netSalary),
                buildRangeSpecification(criteria.getEmployerCnss(), PaySlip_.employerCnss),
                buildRangeSpecification(criteria.getEmployerCavis(), PaySlip_.employerCavis),
                buildRangeSpecification(criteria.getTotalEmployerCost(), PaySlip_.totalEmployerCost),
                buildRangeSpecification(criteria.getWorkedDays(), PaySlip_.workedDays),
                buildRangeSpecification(criteria.getPaidLeaveDays(), PaySlip_.paidLeaveDays),
                buildRangeSpecification(criteria.getUnpaidDays(), PaySlip_.unpaidDays),
                buildRangeSpecification(criteria.getOvertimeHours(), PaySlip_.overtimeHours),
                buildSpecification(criteria.getStatus(), PaySlip_.status),
                buildStringSpecification(criteria.getPdfUrl(), PaySlip_.pdfUrl),
                buildRangeSpecification(criteria.getGeneratedAt(), PaySlip_.generatedAt),
                buildRangeSpecification(criteria.getSentToEmployeeAt(), PaySlip_.sentToEmployeeAt),
                buildStringSpecification(criteria.getBankTransferRef(), PaySlip_.bankTransferRef),
                buildSpecification(criteria.getEmployeeId(), root -> root.join(PaySlip_.employee, JoinType.LEFT).get(Employee_.id)),
                buildSpecification(criteria.getPayrollPeriodId(), root ->
                    root.join(PaySlip_.payrollPeriod, JoinType.LEFT).get(PayrollPeriod_.id)
                ),
                buildSpecification(criteria.getContractId(), root -> root.join(PaySlip_.contract, JoinType.LEFT).get(Contract_.id))
            );
        }
        return specification;
    }
}
