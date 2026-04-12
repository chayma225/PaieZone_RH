package tn.paiezone.rh.service.impl;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.Advance;
import tn.paiezone.rh.repository.AdvanceRepository;
import tn.paiezone.rh.service.AdvanceService;
import tn.paiezone.rh.service.dto.AdvanceDTO;
import tn.paiezone.rh.service.mapper.AdvanceMapper;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.Advance}.
 */
@Service
@Transactional
public class AdvanceServiceImpl implements AdvanceService {

    private static final Logger LOG = LoggerFactory.getLogger(AdvanceServiceImpl.class);

    private final AdvanceRepository advanceRepository;

    private final AdvanceMapper advanceMapper;

    public AdvanceServiceImpl(AdvanceRepository advanceRepository, AdvanceMapper advanceMapper) {
        this.advanceRepository = advanceRepository;
        this.advanceMapper = advanceMapper;
    }

    @Override
    public AdvanceDTO save(AdvanceDTO advanceDTO) {
        LOG.debug("Request to save Advance : {}", advanceDTO);
        Advance advance = advanceMapper.toEntity(advanceDTO);
        advance = advanceRepository.save(advance);
        return advanceMapper.toDto(advance);
    }

    @Override
    public AdvanceDTO update(AdvanceDTO advanceDTO) {
        LOG.debug("Request to update Advance : {}", advanceDTO);
        Advance advance = advanceMapper.toEntity(advanceDTO);
        advance = advanceRepository.save(advance);
        return advanceMapper.toDto(advance);
    }

    @Override
    public Optional<AdvanceDTO> partialUpdate(AdvanceDTO advanceDTO) {
        LOG.debug("Request to partially update Advance : {}", advanceDTO);

        return advanceRepository
            .findById(advanceDTO.getId())
            .map(existingAdvance -> {
                advanceMapper.partialUpdate(existingAdvance, advanceDTO);

                return existingAdvance;
            })
            .map(advanceRepository::save)
            .map(advanceMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AdvanceDTO> findOne(Long id) {
        LOG.debug("Request to get Advance : {}", id);
        return advanceRepository.findById(id).map(advanceMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Advance : {}", id);
        advanceRepository.deleteById(id);
    }
}
