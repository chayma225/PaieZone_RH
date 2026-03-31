package tn.paiezone.rh.service.impl;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.PaySlipLine;
import tn.paiezone.rh.repository.PaySlipLineRepository;
import tn.paiezone.rh.service.PaySlipLineService;
import tn.paiezone.rh.service.dto.PaySlipLineDTO;
import tn.paiezone.rh.service.mapper.PaySlipLineMapper;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.PaySlipLine}.
 */
@Service
@Transactional
public class PaySlipLineServiceImpl implements PaySlipLineService {

    private static final Logger LOG = LoggerFactory.getLogger(PaySlipLineServiceImpl.class);

    private final PaySlipLineRepository paySlipLineRepository;

    private final PaySlipLineMapper paySlipLineMapper;

    public PaySlipLineServiceImpl(PaySlipLineRepository paySlipLineRepository, PaySlipLineMapper paySlipLineMapper) {
        this.paySlipLineRepository = paySlipLineRepository;
        this.paySlipLineMapper = paySlipLineMapper;
    }

    @Override
    public PaySlipLineDTO save(PaySlipLineDTO paySlipLineDTO) {
        LOG.debug("Request to save PaySlipLine : {}", paySlipLineDTO);
        PaySlipLine paySlipLine = paySlipLineMapper.toEntity(paySlipLineDTO);
        paySlipLine = paySlipLineRepository.save(paySlipLine);
        return paySlipLineMapper.toDto(paySlipLine);
    }

    @Override
    public PaySlipLineDTO update(PaySlipLineDTO paySlipLineDTO) {
        LOG.debug("Request to update PaySlipLine : {}", paySlipLineDTO);
        PaySlipLine paySlipLine = paySlipLineMapper.toEntity(paySlipLineDTO);
        paySlipLine = paySlipLineRepository.save(paySlipLine);
        return paySlipLineMapper.toDto(paySlipLine);
    }

    @Override
    public Optional<PaySlipLineDTO> partialUpdate(PaySlipLineDTO paySlipLineDTO) {
        LOG.debug("Request to partially update PaySlipLine : {}", paySlipLineDTO);

        return paySlipLineRepository
            .findById(paySlipLineDTO.getId())
            .map(existingPaySlipLine -> {
                paySlipLineMapper.partialUpdate(existingPaySlipLine, paySlipLineDTO);

                return existingPaySlipLine;
            })
            .map(paySlipLineRepository::save)
            .map(paySlipLineMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaySlipLineDTO> findAll() {
        LOG.debug("Request to get all PaySlipLines");
        return paySlipLineRepository.findAll().stream().map(paySlipLineMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PaySlipLineDTO> findOne(Long id) {
        LOG.debug("Request to get PaySlipLine : {}", id);
        return paySlipLineRepository.findById(id).map(paySlipLineMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete PaySlipLine : {}", id);
        paySlipLineRepository.deleteById(id);
    }
}
