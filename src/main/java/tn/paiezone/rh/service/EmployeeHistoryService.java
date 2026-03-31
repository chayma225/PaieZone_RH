package tn.paiezone.rh.service;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.EmployeeHistory;
import tn.paiezone.rh.repository.EmployeeHistoryRepository;
import tn.paiezone.rh.service.dto.EmployeeHistoryDTO;
import tn.paiezone.rh.service.mapper.EmployeeHistoryMapper;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.EmployeeHistory}.
 */
@Service
@Transactional
public class EmployeeHistoryService {

    private static final Logger LOG = LoggerFactory.getLogger(EmployeeHistoryService.class);

    private final EmployeeHistoryRepository employeeHistoryRepository;

    private final EmployeeHistoryMapper employeeHistoryMapper;

    public EmployeeHistoryService(EmployeeHistoryRepository employeeHistoryRepository, EmployeeHistoryMapper employeeHistoryMapper) {
        this.employeeHistoryRepository = employeeHistoryRepository;
        this.employeeHistoryMapper = employeeHistoryMapper;
    }

    /**
     * Save a employeeHistory.
     *
     * @param employeeHistoryDTO the entity to save.
     * @return the persisted entity.
     */
    public EmployeeHistoryDTO save(EmployeeHistoryDTO employeeHistoryDTO) {
        LOG.debug("Request to save EmployeeHistory : {}", employeeHistoryDTO);
        EmployeeHistory employeeHistory = employeeHistoryMapper.toEntity(employeeHistoryDTO);
        employeeHistory = employeeHistoryRepository.save(employeeHistory);
        return employeeHistoryMapper.toDto(employeeHistory);
    }

    /**
     * Update a employeeHistory.
     *
     * @param employeeHistoryDTO the entity to save.
     * @return the persisted entity.
     */
    public EmployeeHistoryDTO update(EmployeeHistoryDTO employeeHistoryDTO) {
        LOG.debug("Request to update EmployeeHistory : {}", employeeHistoryDTO);
        EmployeeHistory employeeHistory = employeeHistoryMapper.toEntity(employeeHistoryDTO);
        employeeHistory = employeeHistoryRepository.save(employeeHistory);
        return employeeHistoryMapper.toDto(employeeHistory);
    }

    /**
     * Partially update a employeeHistory.
     *
     * @param employeeHistoryDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<EmployeeHistoryDTO> partialUpdate(EmployeeHistoryDTO employeeHistoryDTO) {
        LOG.debug("Request to partially update EmployeeHistory : {}", employeeHistoryDTO);

        return employeeHistoryRepository
            .findById(employeeHistoryDTO.getId())
            .map(existingEmployeeHistory -> {
                employeeHistoryMapper.partialUpdate(existingEmployeeHistory, employeeHistoryDTO);

                return existingEmployeeHistory;
            })
            .map(employeeHistoryRepository::save)
            .map(employeeHistoryMapper::toDto);
    }

    /**
     * Get all the employeeHistories.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<EmployeeHistoryDTO> findAll() {
        LOG.debug("Request to get all EmployeeHistories");
        return employeeHistoryRepository
            .findAll()
            .stream()
            .map(employeeHistoryMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one employeeHistory by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<EmployeeHistoryDTO> findOne(Long id) {
        LOG.debug("Request to get EmployeeHistory : {}", id);
        return employeeHistoryRepository.findById(id).map(employeeHistoryMapper::toDto);
    }

    /**
     * Delete the employeeHistory by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete EmployeeHistory : {}", id);
        employeeHistoryRepository.deleteById(id);
    }
}
