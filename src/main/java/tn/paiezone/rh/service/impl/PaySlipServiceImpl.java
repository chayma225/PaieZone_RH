package tn.paiezone.rh.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.PaySlip;
import tn.paiezone.rh.repository.PaySlipRepository;
import tn.paiezone.rh.service.PaySlipService;
import tn.paiezone.rh.service.PayrollCalculationService;
import tn.paiezone.rh.service.dto.PaySlipDTO;
import tn.paiezone.rh.service.mapper.PaySlipMapper;

import java.util.Optional;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.PaySlip}.
 */
@Service
@Transactional
public class PaySlipServiceImpl implements PaySlipService {

    private static final Logger LOG = LoggerFactory.getLogger(PaySlipServiceImpl.class);

    private final PaySlipRepository paySlipRepository;
    private final PaySlipMapper paySlipMapper;
    private final PayrollCalculationService payrollCalculationService;

    public PaySlipServiceImpl(
        PaySlipRepository paySlipRepository,
        PaySlipMapper paySlipMapper,
        PayrollCalculationService payrollCalculationService) {

        this.paySlipRepository = paySlipRepository;
        this.paySlipMapper = paySlipMapper;
        this.payrollCalculationService = payrollCalculationService;
    }

    @Override
    public PaySlipDTO save(PaySlipDTO paySlipDTO) {
        LOG.debug("Request to save PaySlip : {}", paySlipDTO);
        PaySlip paySlip = paySlipMapper.toEntity(paySlipDTO);
        paySlip = paySlipRepository.save(paySlip);
        return paySlipMapper.toDto(paySlip);
    }

    @Override
    public PaySlipDTO update(PaySlipDTO paySlipDTO) {
        LOG.debug("Request to update PaySlip : {}", paySlipDTO);
        PaySlip paySlip = paySlipMapper.toEntity(paySlipDTO);
        paySlip = paySlipRepository.save(paySlip);
        return paySlipMapper.toDto(paySlip);
    }

    @Override
    public Optional<PaySlipDTO> partialUpdate(PaySlipDTO paySlipDTO) {
        LOG.debug("Request to partially update PaySlip : {}", paySlipDTO);

        return paySlipRepository
            .findById(paySlipDTO.getId())
            .map(existingPaySlip -> {
                paySlipMapper.partialUpdate(existingPaySlip, paySlipDTO);
                return existingPaySlip;
            })
            .map(paySlipRepository::save)
            .map(paySlipMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaySlipDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all PaySlips");
        return paySlipRepository.findAll(pageable).map(paySlipMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PaySlipDTO> findOne(Long id) {
        LOG.debug("Request to get PaySlip : {}", id);
        return paySlipRepository.findById(id).map(paySlipMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete PaySlip : {}", id);
        paySlipRepository.deleteById(id);
    }

    @Override
    @Transactional
    public PaySlipDTO recalculate(Long paySlipId) {
        LOG.debug("Request to recalculate PaySlip : {}", paySlipId);
        PaySlip recalculated = payrollCalculationService.recalculatePaySlip(paySlipId);
        return paySlipMapper.toDto(recalculated);
    }

    @Override
    @Transactional
    public PaySlipDTO calculateOne(Long periodId, Long employeeId) {
        LOG.debug("Request to calculate PaySlip for employee {} on period {}", employeeId, periodId);
        PaySlip calculated = payrollCalculationService.calculatePaySlip(employeeId, periodId);
        return paySlipMapper.toDto(calculated);
    }
}
