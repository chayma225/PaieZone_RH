package tn.paiezone.rh.service;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import tn.paiezone.rh.service.dto.PayrollPeriodDTO;

/**
 * Service Interface for managing {@link tn.paiezone.rh.domain.PayrollPeriod}.
 */
public interface PayrollPeriodService {
    /**
     * Save a payrollPeriod.
     *
     * @param payrollPeriodDTO the entity to save.
     * @return the persisted entity.
     */
    PayrollPeriodDTO save(PayrollPeriodDTO payrollPeriodDTO);

    /**
     * Updates a payrollPeriod.
     *
     * @param payrollPeriodDTO the entity to update.
     * @return the persisted entity.
     */
    PayrollPeriodDTO update(PayrollPeriodDTO payrollPeriodDTO);

    /**
     * Partially updates a payrollPeriod.
     *
     * @param payrollPeriodDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<PayrollPeriodDTO> partialUpdate(PayrollPeriodDTO payrollPeriodDTO);

    /**
     * Get all the payrollPeriods.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<PayrollPeriodDTO> findAll(Pageable pageable);

    /**
     * Get the "id" payrollPeriod.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<PayrollPeriodDTO> findOne(Long id);

    /**
     * Delete the "id" payrollPeriod.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
