package tn.paiezone.rh.service.impl;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.LeaveRequest;
import tn.paiezone.rh.repository.LeaveRequestRepository;
import tn.paiezone.rh.service.LeaveRequestService;
import tn.paiezone.rh.service.dto.LeaveRequestDTO;
import tn.paiezone.rh.service.mapper.LeaveRequestMapper;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.LeaveRequest}.
 */
@Service
@Transactional
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private static final Logger LOG = LoggerFactory.getLogger(LeaveRequestServiceImpl.class);

    private final LeaveRequestRepository leaveRequestRepository;

    private final LeaveRequestMapper leaveRequestMapper;

    public LeaveRequestServiceImpl(LeaveRequestRepository leaveRequestRepository, LeaveRequestMapper leaveRequestMapper) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveRequestMapper = leaveRequestMapper;
    }

    @Override
    public LeaveRequestDTO save(LeaveRequestDTO leaveRequestDTO) {
        LOG.debug("Request to save LeaveRequest : {}", leaveRequestDTO);
        LeaveRequest leaveRequest = leaveRequestMapper.toEntity(leaveRequestDTO);
        leaveRequest = leaveRequestRepository.save(leaveRequest);
        return leaveRequestMapper.toDto(leaveRequest);
    }

    @Override
    public LeaveRequestDTO update(LeaveRequestDTO leaveRequestDTO) {
        LOG.debug("Request to update LeaveRequest : {}", leaveRequestDTO);
        LeaveRequest leaveRequest = leaveRequestMapper.toEntity(leaveRequestDTO);
        leaveRequest = leaveRequestRepository.save(leaveRequest);
        return leaveRequestMapper.toDto(leaveRequest);
    }

    @Override
    public Optional<LeaveRequestDTO> partialUpdate(LeaveRequestDTO leaveRequestDTO) {
        LOG.debug("Request to partially update LeaveRequest : {}", leaveRequestDTO);

        return leaveRequestRepository
            .findById(leaveRequestDTO.getId())
            .map(existingLeaveRequest -> {
                leaveRequestMapper.partialUpdate(existingLeaveRequest, leaveRequestDTO);

                return existingLeaveRequest;
            })
            .map(leaveRequestRepository::save)
            .map(leaveRequestMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<LeaveRequestDTO> findOne(Long id) {
        LOG.debug("Request to get LeaveRequest : {}", id);
        return leaveRequestRepository.findById(id).map(leaveRequestMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete LeaveRequest : {}", id);
        leaveRequestRepository.deleteById(id);
    }
}
