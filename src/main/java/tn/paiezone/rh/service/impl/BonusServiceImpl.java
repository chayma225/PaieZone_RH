package tn.paiezone.rh.service.impl;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.Bonus;
import tn.paiezone.rh.repository.BonusRepository;
import tn.paiezone.rh.service.BonusService;
import tn.paiezone.rh.service.dto.BonusDTO;
import tn.paiezone.rh.service.mapper.BonusMapper;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.Bonus}.
 */
@Service
@Transactional
public class BonusServiceImpl implements BonusService {

    private static final Logger LOG = LoggerFactory.getLogger(BonusServiceImpl.class);

    private final BonusRepository bonusRepository;

    private final BonusMapper bonusMapper;

    public BonusServiceImpl(BonusRepository bonusRepository, BonusMapper bonusMapper) {
        this.bonusRepository = bonusRepository;
        this.bonusMapper = bonusMapper;
    }

    @Override
    public BonusDTO save(BonusDTO bonusDTO) {
        LOG.debug("Request to save Bonus : {}", bonusDTO);
        Bonus bonus = bonusMapper.toEntity(bonusDTO);
        bonus = bonusRepository.save(bonus);
        return bonusMapper.toDto(bonus);
    }

    @Override
    public BonusDTO update(BonusDTO bonusDTO) {
        LOG.debug("Request to update Bonus : {}", bonusDTO);
        Bonus bonus = bonusMapper.toEntity(bonusDTO);
        bonus = bonusRepository.save(bonus);
        return bonusMapper.toDto(bonus);
    }

    @Override
    public Optional<BonusDTO> partialUpdate(BonusDTO bonusDTO) {
        LOG.debug("Request to partially update Bonus : {}", bonusDTO);

        return bonusRepository
            .findById(bonusDTO.getId())
            .map(existingBonus -> {
                bonusMapper.partialUpdate(existingBonus, bonusDTO);

                return existingBonus;
            })
            .map(bonusRepository::save)
            .map(bonusMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<BonusDTO> findOne(Long id) {
        LOG.debug("Request to get Bonus : {}", id);
        return bonusRepository.findById(id).map(bonusMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Bonus : {}", id);
        bonusRepository.deleteById(id);
    }
}
