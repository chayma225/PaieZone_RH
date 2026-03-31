package tn.paiezone.rh.service.impl;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.Contract;
import tn.paiezone.rh.repository.ContractRepository;
import tn.paiezone.rh.service.ContractService;
import tn.paiezone.rh.service.dto.ContractDTO;
import tn.paiezone.rh.service.mapper.ContractMapper;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.Contract}.
 */
@Service
@Transactional
public class ContractServiceImpl implements ContractService {

    private static final Logger LOG = LoggerFactory.getLogger(ContractServiceImpl.class);

    private final ContractRepository contractRepository;

    private final ContractMapper contractMapper;

    public ContractServiceImpl(ContractRepository contractRepository, ContractMapper contractMapper) {
        this.contractRepository = contractRepository;
        this.contractMapper = contractMapper;
    }

    @Override
    public ContractDTO save(ContractDTO contractDTO) {
        LOG.debug("Request to save Contract : {}", contractDTO);
        Contract contract = contractMapper.toEntity(contractDTO);
        contract = contractRepository.save(contract);
        return contractMapper.toDto(contract);
    }

    @Override
    public ContractDTO update(ContractDTO contractDTO) {
        LOG.debug("Request to update Contract : {}", contractDTO);
        Contract contract = contractMapper.toEntity(contractDTO);
        contract = contractRepository.save(contract);
        return contractMapper.toDto(contract);
    }

    @Override
    public Optional<ContractDTO> partialUpdate(ContractDTO contractDTO) {
        LOG.debug("Request to partially update Contract : {}", contractDTO);

        return contractRepository
            .findById(contractDTO.getId())
            .map(existingContract -> {
                contractMapper.partialUpdate(existingContract, contractDTO);

                return existingContract;
            })
            .map(contractRepository::save)
            .map(contractMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ContractDTO> findOne(Long id) {
        LOG.debug("Request to get Contract : {}", id);
        return contractRepository.findById(id).map(contractMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Contract : {}", id);
        contractRepository.deleteById(id);
    }
}
