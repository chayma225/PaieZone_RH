package tn.paiezone.rh.service.impl;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.LeaveBalance;
import tn.paiezone.rh.repository.LeaveBalanceRepository;
import tn.paiezone.rh.service.LeaveBalanceService;
import tn.paiezone.rh.service.dto.LeaveBalanceDTO;
import tn.paiezone.rh.service.mapper.LeaveBalanceMapper;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.LeaveBalance}.
 */
@Service
@Transactional
public class LeaveBalanceServiceImpl implements LeaveBalanceService {

    private static final Logger LOG = LoggerFactory.getLogger(LeaveBalanceServiceImpl.class);

    private final LeaveBalanceRepository leaveBalanceRepository;

    private final LeaveBalanceMapper leaveBalanceMapper;

    public LeaveBalanceServiceImpl(LeaveBalanceRepository leaveBalanceRepository, LeaveBalanceMapper leaveBalanceMapper) {
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.leaveBalanceMapper = leaveBalanceMapper;
    }

    @Override
    public LeaveBalanceDTO save(LeaveBalanceDTO leaveBalanceDTO) {
        LOG.debug("Request to save LeaveBalance : {}", leaveBalanceDTO);
        LeaveBalance leaveBalance = leaveBalanceMapper.toEntity(leaveBalanceDTO);
        leaveBalance = leaveBalanceRepository.save(leaveBalance);
        return leaveBalanceMapper.toDto(leaveBalance);
    }

    @Override
    public LeaveBalanceDTO update(LeaveBalanceDTO leaveBalanceDTO) {
        LOG.debug("Request to update LeaveBalance : {}", leaveBalanceDTO);
        LeaveBalance leaveBalance = leaveBalanceMapper.toEntity(leaveBalanceDTO);
        leaveBalance = leaveBalanceRepository.save(leaveBalance);
        return leaveBalanceMapper.toDto(leaveBalance);
    }

    @Override
    public Optional<LeaveBalanceDTO> partialUpdate(LeaveBalanceDTO leaveBalanceDTO) {
        LOG.debug("Request to partially update LeaveBalance : {}", leaveBalanceDTO);

        return leaveBalanceRepository
            .findById(leaveBalanceDTO.getId())
            .map(existingLeaveBalance -> {
                leaveBalanceMapper.partialUpdate(existingLeaveBalance, leaveBalanceDTO);

                return existingLeaveBalance;
            })
            .map(leaveBalanceRepository::save)
            .map(leaveBalanceMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveBalanceDTO> findAll() {
        LOG.debug("Request to get all LeaveBalances");
        return leaveBalanceRepository.findAll().stream().map(leaveBalanceMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<LeaveBalanceDTO> findOne(Long id) {
        LOG.debug("Request to get LeaveBalance : {}", id);
        return leaveBalanceRepository.findById(id).map(leaveBalanceMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete LeaveBalance : {}", id);
        leaveBalanceRepository.deleteById(id);
    }
}
