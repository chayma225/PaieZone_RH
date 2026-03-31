package tn.paiezone.rh.service;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.RegulatoryParam;
import tn.paiezone.rh.repository.RegulatoryParamRepository;
import tn.paiezone.rh.service.dto.RegulatoryParamDTO;
import tn.paiezone.rh.service.mapper.RegulatoryParamMapper;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.RegulatoryParam}.
 */
@Service
@Transactional
public class RegulatoryParamService {

    private static final Logger LOG = LoggerFactory.getLogger(RegulatoryParamService.class);

    private final RegulatoryParamRepository regulatoryParamRepository;

    private final RegulatoryParamMapper regulatoryParamMapper;

    public RegulatoryParamService(RegulatoryParamRepository regulatoryParamRepository, RegulatoryParamMapper regulatoryParamMapper) {
        this.regulatoryParamRepository = regulatoryParamRepository;
        this.regulatoryParamMapper = regulatoryParamMapper;
    }

    /**
     * Save a regulatoryParam.
     *
     * @param regulatoryParamDTO the entity to save.
     * @return the persisted entity.
     */
    public RegulatoryParamDTO save(RegulatoryParamDTO regulatoryParamDTO) {
        LOG.debug("Request to save RegulatoryParam : {}", regulatoryParamDTO);
        RegulatoryParam regulatoryParam = regulatoryParamMapper.toEntity(regulatoryParamDTO);
        regulatoryParam = regulatoryParamRepository.save(regulatoryParam);
        return regulatoryParamMapper.toDto(regulatoryParam);
    }

    /**
     * Update a regulatoryParam.
     *
     * @param regulatoryParamDTO the entity to save.
     * @return the persisted entity.
     */
    public RegulatoryParamDTO update(RegulatoryParamDTO regulatoryParamDTO) {
        LOG.debug("Request to update RegulatoryParam : {}", regulatoryParamDTO);
        RegulatoryParam regulatoryParam = regulatoryParamMapper.toEntity(regulatoryParamDTO);
        regulatoryParam = regulatoryParamRepository.save(regulatoryParam);
        return regulatoryParamMapper.toDto(regulatoryParam);
    }

    /**
     * Partially update a regulatoryParam.
     *
     * @param regulatoryParamDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<RegulatoryParamDTO> partialUpdate(RegulatoryParamDTO regulatoryParamDTO) {
        LOG.debug("Request to partially update RegulatoryParam : {}", regulatoryParamDTO);

        return regulatoryParamRepository
            .findById(regulatoryParamDTO.getId())
            .map(existingRegulatoryParam -> {
                regulatoryParamMapper.partialUpdate(existingRegulatoryParam, regulatoryParamDTO);

                return existingRegulatoryParam;
            })
            .map(regulatoryParamRepository::save)
            .map(regulatoryParamMapper::toDto);
    }

    /**
     * Get all the regulatoryParams.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<RegulatoryParamDTO> findAll() {
        LOG.debug("Request to get all RegulatoryParams");
        return regulatoryParamRepository
            .findAll()
            .stream()
            .map(regulatoryParamMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one regulatoryParam by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<RegulatoryParamDTO> findOne(Long id) {
        LOG.debug("Request to get RegulatoryParam : {}", id);
        return regulatoryParamRepository.findById(id).map(regulatoryParamMapper::toDto);
    }

    /**
     * Delete the regulatoryParam by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete RegulatoryParam : {}", id);
        regulatoryParamRepository.deleteById(id);
    }
}
