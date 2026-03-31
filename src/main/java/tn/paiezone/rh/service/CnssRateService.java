package tn.paiezone.rh.service;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.CnssRate;
import tn.paiezone.rh.repository.CnssRateRepository;
import tn.paiezone.rh.service.dto.CnssRateDTO;
import tn.paiezone.rh.service.mapper.CnssRateMapper;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.CnssRate}.
 */
@Service
@Transactional
public class CnssRateService {

    private static final Logger LOG = LoggerFactory.getLogger(CnssRateService.class);

    private final CnssRateRepository cnssRateRepository;

    private final CnssRateMapper cnssRateMapper;

    public CnssRateService(CnssRateRepository cnssRateRepository, CnssRateMapper cnssRateMapper) {
        this.cnssRateRepository = cnssRateRepository;
        this.cnssRateMapper = cnssRateMapper;
    }

    /**
     * Save a cnssRate.
     *
     * @param cnssRateDTO the entity to save.
     * @return the persisted entity.
     */
    public CnssRateDTO save(CnssRateDTO cnssRateDTO) {
        LOG.debug("Request to save CnssRate : {}", cnssRateDTO);
        CnssRate cnssRate = cnssRateMapper.toEntity(cnssRateDTO);
        cnssRate = cnssRateRepository.save(cnssRate);
        return cnssRateMapper.toDto(cnssRate);
    }

    /**
     * Update a cnssRate.
     *
     * @param cnssRateDTO the entity to save.
     * @return the persisted entity.
     */
    public CnssRateDTO update(CnssRateDTO cnssRateDTO) {
        LOG.debug("Request to update CnssRate : {}", cnssRateDTO);
        CnssRate cnssRate = cnssRateMapper.toEntity(cnssRateDTO);
        cnssRate = cnssRateRepository.save(cnssRate);
        return cnssRateMapper.toDto(cnssRate);
    }

    /**
     * Partially update a cnssRate.
     *
     * @param cnssRateDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<CnssRateDTO> partialUpdate(CnssRateDTO cnssRateDTO) {
        LOG.debug("Request to partially update CnssRate : {}", cnssRateDTO);

        return cnssRateRepository
            .findById(cnssRateDTO.getId())
            .map(existingCnssRate -> {
                cnssRateMapper.partialUpdate(existingCnssRate, cnssRateDTO);

                return existingCnssRate;
            })
            .map(cnssRateRepository::save)
            .map(cnssRateMapper::toDto);
    }

    /**
     * Get all the cnssRates.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<CnssRateDTO> findAll() {
        LOG.debug("Request to get all CnssRates");
        return cnssRateRepository.findAll().stream().map(cnssRateMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one cnssRate by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<CnssRateDTO> findOne(Long id) {
        LOG.debug("Request to get CnssRate : {}", id);
        return cnssRateRepository.findById(id).map(cnssRateMapper::toDto);
    }

    /**
     * Delete the cnssRate by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete CnssRate : {}", id);
        cnssRateRepository.deleteById(id);
    }
}
