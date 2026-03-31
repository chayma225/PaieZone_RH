package tn.paiezone.rh.service;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.Rubrique;
import tn.paiezone.rh.repository.RubriqueRepository;
import tn.paiezone.rh.service.dto.RubriqueDTO;
import tn.paiezone.rh.service.mapper.RubriqueMapper;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.Rubrique}.
 */
@Service
@Transactional
public class RubriqueService {

    private static final Logger LOG = LoggerFactory.getLogger(RubriqueService.class);

    private final RubriqueRepository rubriqueRepository;

    private final RubriqueMapper rubriqueMapper;

    public RubriqueService(RubriqueRepository rubriqueRepository, RubriqueMapper rubriqueMapper) {
        this.rubriqueRepository = rubriqueRepository;
        this.rubriqueMapper = rubriqueMapper;
    }

    /**
     * Save a rubrique.
     *
     * @param rubriqueDTO the entity to save.
     * @return the persisted entity.
     */
    public RubriqueDTO save(RubriqueDTO rubriqueDTO) {
        LOG.debug("Request to save Rubrique : {}", rubriqueDTO);
        Rubrique rubrique = rubriqueMapper.toEntity(rubriqueDTO);
        rubrique = rubriqueRepository.save(rubrique);
        return rubriqueMapper.toDto(rubrique);
    }

    /**
     * Update a rubrique.
     *
     * @param rubriqueDTO the entity to save.
     * @return the persisted entity.
     */
    public RubriqueDTO update(RubriqueDTO rubriqueDTO) {
        LOG.debug("Request to update Rubrique : {}", rubriqueDTO);
        Rubrique rubrique = rubriqueMapper.toEntity(rubriqueDTO);
        rubrique = rubriqueRepository.save(rubrique);
        return rubriqueMapper.toDto(rubrique);
    }

    /**
     * Partially update a rubrique.
     *
     * @param rubriqueDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<RubriqueDTO> partialUpdate(RubriqueDTO rubriqueDTO) {
        LOG.debug("Request to partially update Rubrique : {}", rubriqueDTO);

        return rubriqueRepository
            .findById(rubriqueDTO.getId())
            .map(existingRubrique -> {
                rubriqueMapper.partialUpdate(existingRubrique, rubriqueDTO);

                return existingRubrique;
            })
            .map(rubriqueRepository::save)
            .map(rubriqueMapper::toDto);
    }

    /**
     * Get all the rubriques.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<RubriqueDTO> findAll() {
        LOG.debug("Request to get all Rubriques");
        return rubriqueRepository.findAll().stream().map(rubriqueMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one rubrique by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<RubriqueDTO> findOne(Long id) {
        LOG.debug("Request to get Rubrique : {}", id);
        return rubriqueRepository.findById(id).map(rubriqueMapper::toDto);
    }

    /**
     * Delete the rubrique by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Rubrique : {}", id);
        rubriqueRepository.deleteById(id);
    }
}
