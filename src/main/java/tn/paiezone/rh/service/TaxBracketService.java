package tn.paiezone.rh.service;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.TaxBracket;
import tn.paiezone.rh.repository.TaxBracketRepository;
import tn.paiezone.rh.service.dto.TaxBracketDTO;
import tn.paiezone.rh.service.mapper.TaxBracketMapper;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.TaxBracket}.
 */
@Service
@Transactional
public class TaxBracketService {

    private static final Logger LOG = LoggerFactory.getLogger(TaxBracketService.class);

    private final TaxBracketRepository taxBracketRepository;

    private final TaxBracketMapper taxBracketMapper;

    public TaxBracketService(TaxBracketRepository taxBracketRepository, TaxBracketMapper taxBracketMapper) {
        this.taxBracketRepository = taxBracketRepository;
        this.taxBracketMapper = taxBracketMapper;
    }

    /**
     * Save a taxBracket.
     *
     * @param taxBracketDTO the entity to save.
     * @return the persisted entity.
     */
    public TaxBracketDTO save(TaxBracketDTO taxBracketDTO) {
        LOG.debug("Request to save TaxBracket : {}", taxBracketDTO);
        TaxBracket taxBracket = taxBracketMapper.toEntity(taxBracketDTO);
        taxBracket = taxBracketRepository.save(taxBracket);
        return taxBracketMapper.toDto(taxBracket);
    }

    /**
     * Update a taxBracket.
     *
     * @param taxBracketDTO the entity to save.
     * @return the persisted entity.
     */
    public TaxBracketDTO update(TaxBracketDTO taxBracketDTO) {
        LOG.debug("Request to update TaxBracket : {}", taxBracketDTO);
        TaxBracket taxBracket = taxBracketMapper.toEntity(taxBracketDTO);
        taxBracket = taxBracketRepository.save(taxBracket);
        return taxBracketMapper.toDto(taxBracket);
    }

    /**
     * Partially update a taxBracket.
     *
     * @param taxBracketDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<TaxBracketDTO> partialUpdate(TaxBracketDTO taxBracketDTO) {
        LOG.debug("Request to partially update TaxBracket : {}", taxBracketDTO);

        return taxBracketRepository
            .findById(taxBracketDTO.getId())
            .map(existingTaxBracket -> {
                taxBracketMapper.partialUpdate(existingTaxBracket, taxBracketDTO);

                return existingTaxBracket;
            })
            .map(taxBracketRepository::save)
            .map(taxBracketMapper::toDto);
    }

    /**
     * Get all the taxBrackets.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<TaxBracketDTO> findAll() {
        LOG.debug("Request to get all TaxBrackets");
        return taxBracketRepository.findAll().stream().map(taxBracketMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one taxBracket by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<TaxBracketDTO> findOne(Long id) {
        LOG.debug("Request to get TaxBracket : {}", id);
        return taxBracketRepository.findById(id).map(taxBracketMapper::toDto);
    }

    /**
     * Delete the taxBracket by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete TaxBracket : {}", id);
        taxBracketRepository.deleteById(id);
    }
}
