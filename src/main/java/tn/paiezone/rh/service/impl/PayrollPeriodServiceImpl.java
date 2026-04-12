package tn.paiezone.rh.service.impl;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.PayrollPeriod;
import tn.paiezone.rh.repository.PayrollPeriodRepository;
import tn.paiezone.rh.service.PayrollPeriodService;
import tn.paiezone.rh.service.dto.PayrollPeriodDTO;
import tn.paiezone.rh.service.mapper.PayrollPeriodMapper;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.PayrollPeriod}.
 */
@Service
@Transactional
public class PayrollPeriodServiceImpl implements PayrollPeriodService {

    private static final Logger LOG = LoggerFactory.getLogger(PayrollPeriodServiceImpl.class);

    private final PayrollPeriodRepository payrollPeriodRepository;

    private final PayrollPeriodMapper payrollPeriodMapper;

    public PayrollPeriodServiceImpl(PayrollPeriodRepository payrollPeriodRepository, PayrollPeriodMapper payrollPeriodMapper) {
        this.payrollPeriodRepository = payrollPeriodRepository;
        this.payrollPeriodMapper = payrollPeriodMapper;
    }

    @Override
    public PayrollPeriodDTO save(PayrollPeriodDTO payrollPeriodDTO) {
        LOG.debug("Request to save PayrollPeriod : {}", payrollPeriodDTO);
        PayrollPeriod payrollPeriod = payrollPeriodMapper.toEntity(payrollPeriodDTO);
        payrollPeriod = payrollPeriodRepository.save(payrollPeriod);
        return payrollPeriodMapper.toDto(payrollPeriod);
    }

    @Override
    public PayrollPeriodDTO update(PayrollPeriodDTO payrollPeriodDTO) {
        LOG.debug("Request to update PayrollPeriod : {}", payrollPeriodDTO);
        PayrollPeriod payrollPeriod = payrollPeriodMapper.toEntity(payrollPeriodDTO);
        payrollPeriod = payrollPeriodRepository.save(payrollPeriod);
        return payrollPeriodMapper.toDto(payrollPeriod);
    }

    @Override
    public Optional<PayrollPeriodDTO> partialUpdate(PayrollPeriodDTO payrollPeriodDTO) {
        LOG.debug("Request to partially update PayrollPeriod : {}", payrollPeriodDTO);

        return payrollPeriodRepository
            .findById(payrollPeriodDTO.getId())
            .map(existingPayrollPeriod -> {
                payrollPeriodMapper.partialUpdate(existingPayrollPeriod, payrollPeriodDTO);

                return existingPayrollPeriod;
            })
            .map(payrollPeriodRepository::save)
            .map(payrollPeriodMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PayrollPeriodDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all PayrollPeriods");
        return payrollPeriodRepository.findAll(pageable).map(payrollPeriodMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PayrollPeriodDTO> findOne(Long id) {
        LOG.debug("Request to get PayrollPeriod : {}", id);
        return payrollPeriodRepository.findById(id).map(payrollPeriodMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete PayrollPeriod : {}", id);
        payrollPeriodRepository.deleteById(id);
    }
}
