package tn.paiezone.rh.service;

import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.Rubrique;
import tn.paiezone.rh.repository.RubriqueRepository;
import tn.paiezone.rh.service.dto.RubriqueDTO;
import tn.paiezone.rh.service.mapper.RubriqueMapper;

import java.time.Instant;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
     * NOUVELLE MÉTHODE : Création avec validation d'unicité pour le PFE.
     */
    public RubriqueDTO create(RubriqueDTO dto) {
        LOG.debug("Request to create Rubrique with validation: {}", dto);
        if (dto.getCompany() != null && rubriqueRepository.existsByCodeAndCompanyId(dto.getCode(), dto.getCompany().getId())) {
            throw new IllegalArgumentException("Code rubrique '" + dto.getCode() + "' déjà utilisé dans cette entreprise.");
        }
        return save(dto);
    }

    /**
     * NOUVELLE MÉTHODE : Désactive une rubrique (soft delete).
     */
    public RubriqueDTO deactivate(Long id) {
        LOG.debug("Request to deactivate Rubrique : {}", id);
        Rubrique r = rubriqueRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Rubrique introuvable : " + id));

        r.setActive(false);
        return rubriqueMapper.toDto(rubriqueRepository.save(r));
    }

    /**
     * Save a rubrique.
     */
    public RubriqueDTO save(RubriqueDTO rubriqueDTO) {
        LOG.debug("Request to save Rubrique : {}", rubriqueDTO);

        Rubrique rubrique = rubriqueMapper.toEntity(rubriqueDTO);

        // Remplissage automatique des champs d'audit
        if (rubrique.getCreatedBy() == null) {
            rubrique.setCreatedBy("admin");
            rubrique.setCreatedDate(Instant.now());
        }

        rubrique = rubriqueRepository.save(rubrique);

        return rubriqueMapper.toDto(rubrique);
    }
    /**
     * Update a rubrique (NÉCESSAIRE POUR LA COMPILATION).
     */
    public RubriqueDTO update(RubriqueDTO rubriqueDTO) {
        LOG.debug("Request to update Rubrique : {}", rubriqueDTO);
        Rubrique rubrique = rubriqueMapper.toEntity(rubriqueDTO);
        rubrique = rubriqueRepository.save(rubrique);
        return rubriqueMapper.toDto(rubrique);
    }

    /**
     * Partially update a rubrique (NÉCESSAIRE POUR LA COMPILATION).
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
     */
    @Transactional(readOnly = true)
    public List<RubriqueDTO> findAll() {
        LOG.debug("Request to get all Rubriques");
        return rubriqueRepository.findAll().stream()
            .map(rubriqueMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one rubrique by id.
     */
    @Transactional(readOnly = true)
    public Optional<RubriqueDTO> findOne(Long id) {
        LOG.debug("Request to get Rubrique : {}", id);
        return rubriqueRepository.findById(id).map(rubriqueMapper::toDto);
    }

    /**
     * Delete the rubrique by id.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Rubrique : {}", id);
        rubriqueRepository.deleteById(id);
    }
}
