package tn.paiezone.rh.service.impl;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.PaySlip;
import tn.paiezone.rh.repository.PaySlipRepository;
import tn.paiezone.rh.service.PaySlipService;
import tn.paiezone.rh.service.dto.PaySlipDTO;
import tn.paiezone.rh.service.mapper.PaySlipMapper;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.PaySlip}.
 */
@Service
@Transactional
public class PaySlipServiceImpl implements PaySlipService {

    private static final Logger LOG = LoggerFactory.getLogger(PaySlipServiceImpl.class);

    private final PaySlipRepository paySlipRepository;

    private final PaySlipMapper paySlipMapper;

    public PaySlipServiceImpl(PaySlipRepository paySlipRepository, PaySlipMapper paySlipMapper) {
        this.paySlipRepository = paySlipRepository;
        this.paySlipMapper = paySlipMapper;
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
    public Optional<PaySlipDTO> findOne(Long id) {
        LOG.debug("Request to get PaySlip : {}", id);
        return paySlipRepository.findById(id).map(paySlipMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete PaySlip : {}", id);
        paySlipRepository.deleteById(id);
    }
}
