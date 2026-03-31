package tn.paiezone.rh.service;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.AccountPlan;
import tn.paiezone.rh.repository.AccountPlanRepository;
import tn.paiezone.rh.service.dto.AccountPlanDTO;
import tn.paiezone.rh.service.mapper.AccountPlanMapper;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.AccountPlan}.
 */
@Service
@Transactional
public class AccountPlanService {

    private static final Logger LOG = LoggerFactory.getLogger(AccountPlanService.class);

    private final AccountPlanRepository accountPlanRepository;

    private final AccountPlanMapper accountPlanMapper;

    public AccountPlanService(AccountPlanRepository accountPlanRepository, AccountPlanMapper accountPlanMapper) {
        this.accountPlanRepository = accountPlanRepository;
        this.accountPlanMapper = accountPlanMapper;
    }

    /**
     * Save a accountPlan.
     *
     * @param accountPlanDTO the entity to save.
     * @return the persisted entity.
     */
    public AccountPlanDTO save(AccountPlanDTO accountPlanDTO) {
        LOG.debug("Request to save AccountPlan : {}", accountPlanDTO);
        AccountPlan accountPlan = accountPlanMapper.toEntity(accountPlanDTO);
        accountPlan = accountPlanRepository.save(accountPlan);
        return accountPlanMapper.toDto(accountPlan);
    }

    /**
     * Update a accountPlan.
     *
     * @param accountPlanDTO the entity to save.
     * @return the persisted entity.
     */
    public AccountPlanDTO update(AccountPlanDTO accountPlanDTO) {
        LOG.debug("Request to update AccountPlan : {}", accountPlanDTO);
        AccountPlan accountPlan = accountPlanMapper.toEntity(accountPlanDTO);
        accountPlan = accountPlanRepository.save(accountPlan);
        return accountPlanMapper.toDto(accountPlan);
    }

    /**
     * Partially update a accountPlan.
     *
     * @param accountPlanDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<AccountPlanDTO> partialUpdate(AccountPlanDTO accountPlanDTO) {
        LOG.debug("Request to partially update AccountPlan : {}", accountPlanDTO);

        return accountPlanRepository
            .findById(accountPlanDTO.getId())
            .map(existingAccountPlan -> {
                accountPlanMapper.partialUpdate(existingAccountPlan, accountPlanDTO);

                return existingAccountPlan;
            })
            .map(accountPlanRepository::save)
            .map(accountPlanMapper::toDto);
    }

    /**
     * Get all the accountPlans.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<AccountPlanDTO> findAll() {
        LOG.debug("Request to get all AccountPlans");
        return accountPlanRepository.findAll().stream().map(accountPlanMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one accountPlan by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<AccountPlanDTO> findOne(Long id) {
        LOG.debug("Request to get AccountPlan : {}", id);
        return accountPlanRepository.findById(id).map(accountPlanMapper::toDto);
    }

    /**
     * Delete the accountPlan by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete AccountPlan : {}", id);
        accountPlanRepository.deleteById(id);
    }
}
