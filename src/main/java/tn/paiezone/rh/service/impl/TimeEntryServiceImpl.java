package tn.paiezone.rh.service.impl;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.TimeEntry;
import tn.paiezone.rh.repository.TimeEntryRepository;
import tn.paiezone.rh.service.TimeEntryService;
import tn.paiezone.rh.service.dto.TimeEntryDTO;
import tn.paiezone.rh.service.mapper.TimeEntryMapper;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.TimeEntry}.
 */
@Service
@Transactional
public class TimeEntryServiceImpl implements TimeEntryService {

    private static final Logger LOG = LoggerFactory.getLogger(TimeEntryServiceImpl.class);

    private final TimeEntryRepository timeEntryRepository;

    private final TimeEntryMapper timeEntryMapper;

    public TimeEntryServiceImpl(TimeEntryRepository timeEntryRepository, TimeEntryMapper timeEntryMapper) {
        this.timeEntryRepository = timeEntryRepository;
        this.timeEntryMapper = timeEntryMapper;
    }

    @Override
    public TimeEntryDTO save(TimeEntryDTO timeEntryDTO) {
        LOG.debug("Request to save TimeEntry : {}", timeEntryDTO);
        TimeEntry timeEntry = timeEntryMapper.toEntity(timeEntryDTO);
        timeEntry = timeEntryRepository.save(timeEntry);
        return timeEntryMapper.toDto(timeEntry);
    }

    @Override
    public TimeEntryDTO update(TimeEntryDTO timeEntryDTO) {
        LOG.debug("Request to update TimeEntry : {}", timeEntryDTO);
        TimeEntry timeEntry = timeEntryMapper.toEntity(timeEntryDTO);
        timeEntry = timeEntryRepository.save(timeEntry);
        return timeEntryMapper.toDto(timeEntry);
    }

    @Override
    public Optional<TimeEntryDTO> partialUpdate(TimeEntryDTO timeEntryDTO) {
        LOG.debug("Request to partially update TimeEntry : {}", timeEntryDTO);

        return timeEntryRepository
            .findById(timeEntryDTO.getId())
            .map(existingTimeEntry -> {
                timeEntryMapper.partialUpdate(existingTimeEntry, timeEntryDTO);

                return existingTimeEntry;
            })
            .map(timeEntryRepository::save)
            .map(timeEntryMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<TimeEntryDTO> findOne(Long id) {
        LOG.debug("Request to get TimeEntry : {}", id);
        return timeEntryRepository.findById(id).map(timeEntryMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete TimeEntry : {}", id);
        timeEntryRepository.deleteById(id);
    }
}
