package tn.paiezone.rh.service.impl;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.AccountingEntry;
import tn.paiezone.rh.repository.AccountingEntryRepository;
import tn.paiezone.rh.service.AccountingEntryService;
import tn.paiezone.rh.service.dto.AccountingEntryDTO;
import tn.paiezone.rh.service.mapper.AccountingEntryMapper;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.AccountingEntry}.
 */
@Service
@Transactional
public class AccountingEntryServiceImpl implements AccountingEntryService {

    private static final Logger LOG = LoggerFactory.getLogger(AccountingEntryServiceImpl.class);

    private final AccountingEntryRepository accountingEntryRepository;

    private final AccountingEntryMapper accountingEntryMapper;

    public AccountingEntryServiceImpl(AccountingEntryRepository accountingEntryRepository, AccountingEntryMapper accountingEntryMapper) {
        this.accountingEntryRepository = accountingEntryRepository;
        this.accountingEntryMapper = accountingEntryMapper;
    }

    @Override
    public AccountingEntryDTO save(AccountingEntryDTO accountingEntryDTO) {
        LOG.debug("Request to save AccountingEntry : {}", accountingEntryDTO);
        AccountingEntry accountingEntry = accountingEntryMapper.toEntity(accountingEntryDTO);
        accountingEntry = accountingEntryRepository.save(accountingEntry);
        return accountingEntryMapper.toDto(accountingEntry);
    }

    @Override
    public AccountingEntryDTO update(AccountingEntryDTO accountingEntryDTO) {
        LOG.debug("Request to update AccountingEntry : {}", accountingEntryDTO);
        AccountingEntry accountingEntry = accountingEntryMapper.toEntity(accountingEntryDTO);
        accountingEntry = accountingEntryRepository.save(accountingEntry);
        return accountingEntryMapper.toDto(accountingEntry);
    }

    @Override
    public Optional<AccountingEntryDTO> partialUpdate(AccountingEntryDTO accountingEntryDTO) {
        LOG.debug("Request to partially update AccountingEntry : {}", accountingEntryDTO);

        return accountingEntryRepository
            .findById(accountingEntryDTO.getId())
            .map(existingAccountingEntry -> {
                accountingEntryMapper.partialUpdate(existingAccountingEntry, accountingEntryDTO);

                return existingAccountingEntry;
            })
            .map(accountingEntryRepository::save)
            .map(accountingEntryMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AccountingEntryDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all AccountingEntries");
        return accountingEntryRepository.findAll(pageable).map(accountingEntryMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AccountingEntryDTO> findOne(Long id) {
        LOG.debug("Request to get AccountingEntry : {}", id);
        return accountingEntryRepository.findById(id).map(accountingEntryMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete AccountingEntry : {}", id);
        accountingEntryRepository.deleteById(id);
    }
}
