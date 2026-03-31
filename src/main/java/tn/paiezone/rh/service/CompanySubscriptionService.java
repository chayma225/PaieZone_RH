package tn.paiezone.rh.service;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.CompanySubscription;
import tn.paiezone.rh.repository.CompanySubscriptionRepository;
import tn.paiezone.rh.service.dto.CompanySubscriptionDTO;
import tn.paiezone.rh.service.mapper.CompanySubscriptionMapper;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.CompanySubscription}.
 */
@Service
@Transactional
public class CompanySubscriptionService {

    private static final Logger LOG = LoggerFactory.getLogger(CompanySubscriptionService.class);

    private final CompanySubscriptionRepository companySubscriptionRepository;

    private final CompanySubscriptionMapper companySubscriptionMapper;

    public CompanySubscriptionService(
        CompanySubscriptionRepository companySubscriptionRepository,
        CompanySubscriptionMapper companySubscriptionMapper
    ) {
        this.companySubscriptionRepository = companySubscriptionRepository;
        this.companySubscriptionMapper = companySubscriptionMapper;
    }

    /**
     * Save a companySubscription.
     *
     * @param companySubscriptionDTO the entity to save.
     * @return the persisted entity.
     */
    public CompanySubscriptionDTO save(CompanySubscriptionDTO companySubscriptionDTO) {
        LOG.debug("Request to save CompanySubscription : {}", companySubscriptionDTO);
        CompanySubscription companySubscription = companySubscriptionMapper.toEntity(companySubscriptionDTO);
        companySubscription = companySubscriptionRepository.save(companySubscription);
        return companySubscriptionMapper.toDto(companySubscription);
    }

    /**
     * Update a companySubscription.
     *
     * @param companySubscriptionDTO the entity to save.
     * @return the persisted entity.
     */
    public CompanySubscriptionDTO update(CompanySubscriptionDTO companySubscriptionDTO) {
        LOG.debug("Request to update CompanySubscription : {}", companySubscriptionDTO);
        CompanySubscription companySubscription = companySubscriptionMapper.toEntity(companySubscriptionDTO);
        companySubscription = companySubscriptionRepository.save(companySubscription);
        return companySubscriptionMapper.toDto(companySubscription);
    }

    /**
     * Partially update a companySubscription.
     *
     * @param companySubscriptionDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<CompanySubscriptionDTO> partialUpdate(CompanySubscriptionDTO companySubscriptionDTO) {
        LOG.debug("Request to partially update CompanySubscription : {}", companySubscriptionDTO);

        return companySubscriptionRepository
            .findById(companySubscriptionDTO.getId())
            .map(existingCompanySubscription -> {
                companySubscriptionMapper.partialUpdate(existingCompanySubscription, companySubscriptionDTO);

                return existingCompanySubscription;
            })
            .map(companySubscriptionRepository::save)
            .map(companySubscriptionMapper::toDto);
    }

    /**
     * Get all the companySubscriptions.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<CompanySubscriptionDTO> findAll() {
        LOG.debug("Request to get all CompanySubscriptions");
        return companySubscriptionRepository
            .findAll()
            .stream()
            .map(companySubscriptionMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     *  Get all the companySubscriptions where Company is {@code null}.
     *  @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<CompanySubscriptionDTO> findAllWhereCompanyIsNull() {
        LOG.debug("Request to get all companySubscriptions where Company is null");
        return StreamSupport.stream(companySubscriptionRepository.findAll().spliterator(), false)
            .filter(companySubscription -> companySubscription.getCompany() == null)
            .map(companySubscriptionMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one companySubscription by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<CompanySubscriptionDTO> findOne(Long id) {
        LOG.debug("Request to get CompanySubscription : {}", id);
        return companySubscriptionRepository.findById(id).map(companySubscriptionMapper::toDto);
    }

    /**
     * Delete the companySubscription by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete CompanySubscription : {}", id);
        companySubscriptionRepository.deleteById(id);
    }
}
