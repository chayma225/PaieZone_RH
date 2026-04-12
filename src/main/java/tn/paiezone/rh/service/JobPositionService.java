package tn.paiezone.rh.service;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.JobPosition;
import tn.paiezone.rh.repository.JobPositionRepository;
import tn.paiezone.rh.service.dto.JobPositionDTO;
import tn.paiezone.rh.service.mapper.JobPositionMapper;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.JobPosition}.
 */
@Service
@Transactional
public class JobPositionService {

    private static final Logger LOG = LoggerFactory.getLogger(JobPositionService.class);

    private final JobPositionRepository jobPositionRepository;

    private final JobPositionMapper jobPositionMapper;

    public JobPositionService(JobPositionRepository jobPositionRepository, JobPositionMapper jobPositionMapper) {
        this.jobPositionRepository = jobPositionRepository;
        this.jobPositionMapper = jobPositionMapper;
    }

    /**
     * Save a jobPosition.
     *
     * @param jobPositionDTO the entity to save.
     * @return the persisted entity.
     */
    public JobPositionDTO save(JobPositionDTO jobPositionDTO) {
        LOG.debug("Request to save JobPosition : {}", jobPositionDTO);
        JobPosition jobPosition = jobPositionMapper.toEntity(jobPositionDTO);
        jobPosition = jobPositionRepository.save(jobPosition);
        return jobPositionMapper.toDto(jobPosition);
    }

    /**
     * Update a jobPosition.
     *
     * @param jobPositionDTO the entity to save.
     * @return the persisted entity.
     */
    public JobPositionDTO update(JobPositionDTO jobPositionDTO) {
        LOG.debug("Request to update JobPosition : {}", jobPositionDTO);
        JobPosition jobPosition = jobPositionMapper.toEntity(jobPositionDTO);
        jobPosition = jobPositionRepository.save(jobPosition);
        return jobPositionMapper.toDto(jobPosition);
    }

    /**
     * Partially update a jobPosition.
     *
     * @param jobPositionDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<JobPositionDTO> partialUpdate(JobPositionDTO jobPositionDTO) {
        LOG.debug("Request to partially update JobPosition : {}", jobPositionDTO);

        return jobPositionRepository
            .findById(jobPositionDTO.getId())
            .map(existingJobPosition -> {
                jobPositionMapper.partialUpdate(existingJobPosition, jobPositionDTO);

                return existingJobPosition;
            })
            .map(jobPositionRepository::save)
            .map(jobPositionMapper::toDto);
    }

    /**
     * Get all the jobPositions.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<JobPositionDTO> findAll() {
        LOG.debug("Request to get all JobPositions");
        return jobPositionRepository.findAll().stream().map(jobPositionMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one jobPosition by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<JobPositionDTO> findOne(Long id) {
        LOG.debug("Request to get JobPosition : {}", id);
        return jobPositionRepository.findById(id).map(jobPositionMapper::toDto);
    }

    /**
     * Delete the jobPosition by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete JobPosition : {}", id);
        jobPositionRepository.deleteById(id);
    }
}
