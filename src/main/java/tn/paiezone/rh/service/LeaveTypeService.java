package tn.paiezone.rh.service;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.LeaveType;
import tn.paiezone.rh.repository.LeaveTypeRepository;
import tn.paiezone.rh.service.dto.LeaveTypeDTO;
import tn.paiezone.rh.service.mapper.LeaveTypeMapper;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.LeaveType}.
 */
@Service
@Transactional
public class LeaveTypeService {

    private static final Logger LOG = LoggerFactory.getLogger(LeaveTypeService.class);

    private final LeaveTypeRepository leaveTypeRepository;

    private final LeaveTypeMapper leaveTypeMapper;

    public LeaveTypeService(LeaveTypeRepository leaveTypeRepository, LeaveTypeMapper leaveTypeMapper) {
        this.leaveTypeRepository = leaveTypeRepository;
        this.leaveTypeMapper = leaveTypeMapper;
    }

    /**
     * Save a leaveType.
     *
     * @param leaveTypeDTO the entity to save.
     * @return the persisted entity.
     */
    public LeaveTypeDTO save(LeaveTypeDTO leaveTypeDTO) {
        LOG.debug("Request to save LeaveType : {}", leaveTypeDTO);
        LeaveType leaveType = leaveTypeMapper.toEntity(leaveTypeDTO);
        leaveType = leaveTypeRepository.save(leaveType);
        return leaveTypeMapper.toDto(leaveType);
    }

    /**
     * Update a leaveType.
     *
     * @param leaveTypeDTO the entity to save.
     * @return the persisted entity.
     */
    public LeaveTypeDTO update(LeaveTypeDTO leaveTypeDTO) {
        LOG.debug("Request to update LeaveType : {}", leaveTypeDTO);
        LeaveType leaveType = leaveTypeMapper.toEntity(leaveTypeDTO);
        leaveType = leaveTypeRepository.save(leaveType);
        return leaveTypeMapper.toDto(leaveType);
    }

    /**
     * Partially update a leaveType.
     *
     * @param leaveTypeDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<LeaveTypeDTO> partialUpdate(LeaveTypeDTO leaveTypeDTO) {
        LOG.debug("Request to partially update LeaveType : {}", leaveTypeDTO);

        return leaveTypeRepository
            .findById(leaveTypeDTO.getId())
            .map(existingLeaveType -> {
                leaveTypeMapper.partialUpdate(existingLeaveType, leaveTypeDTO);

                return existingLeaveType;
            })
            .map(leaveTypeRepository::save)
            .map(leaveTypeMapper::toDto);
    }

    /**
     * Get all the leaveTypes.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<LeaveTypeDTO> findAll() {
        LOG.debug("Request to get all LeaveTypes");
        return leaveTypeRepository.findAll().stream().map(leaveTypeMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one leaveType by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<LeaveTypeDTO> findOne(Long id) {
        LOG.debug("Request to get LeaveType : {}", id);
        return leaveTypeRepository.findById(id).map(leaveTypeMapper::toDto);
    }

    /**
     * Delete the leaveType by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete LeaveType : {}", id);
        leaveTypeRepository.deleteById(id);
    }
}
