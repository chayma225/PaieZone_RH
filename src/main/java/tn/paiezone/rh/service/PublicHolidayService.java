package tn.paiezone.rh.service;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.PublicHoliday;
import tn.paiezone.rh.repository.PublicHolidayRepository;
import tn.paiezone.rh.service.dto.PublicHolidayDTO;
import tn.paiezone.rh.service.mapper.PublicHolidayMapper;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.PublicHoliday}.
 */
@Service
@Transactional
public class PublicHolidayService {

    private static final Logger LOG = LoggerFactory.getLogger(PublicHolidayService.class);

    private final PublicHolidayRepository publicHolidayRepository;

    private final PublicHolidayMapper publicHolidayMapper;

    public PublicHolidayService(PublicHolidayRepository publicHolidayRepository, PublicHolidayMapper publicHolidayMapper) {
        this.publicHolidayRepository = publicHolidayRepository;
        this.publicHolidayMapper = publicHolidayMapper;
    }

    /**
     * Save a publicHoliday.
     *
     * @param publicHolidayDTO the entity to save.
     * @return the persisted entity.
     */
    public PublicHolidayDTO save(PublicHolidayDTO publicHolidayDTO) {
        LOG.debug("Request to save PublicHoliday : {}", publicHolidayDTO);
        PublicHoliday publicHoliday = publicHolidayMapper.toEntity(publicHolidayDTO);
        publicHoliday = publicHolidayRepository.save(publicHoliday);
        return publicHolidayMapper.toDto(publicHoliday);
    }

    /**
     * Update a publicHoliday.
     *
     * @param publicHolidayDTO the entity to save.
     * @return the persisted entity.
     */
    public PublicHolidayDTO update(PublicHolidayDTO publicHolidayDTO) {
        LOG.debug("Request to update PublicHoliday : {}", publicHolidayDTO);
        PublicHoliday publicHoliday = publicHolidayMapper.toEntity(publicHolidayDTO);
        publicHoliday = publicHolidayRepository.save(publicHoliday);
        return publicHolidayMapper.toDto(publicHoliday);
    }

    /**
     * Partially update a publicHoliday.
     *
     * @param publicHolidayDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<PublicHolidayDTO> partialUpdate(PublicHolidayDTO publicHolidayDTO) {
        LOG.debug("Request to partially update PublicHoliday : {}", publicHolidayDTO);

        return publicHolidayRepository
            .findById(publicHolidayDTO.getId())
            .map(existingPublicHoliday -> {
                publicHolidayMapper.partialUpdate(existingPublicHoliday, publicHolidayDTO);

                return existingPublicHoliday;
            })
            .map(publicHolidayRepository::save)
            .map(publicHolidayMapper::toDto);
    }

    /**
     * Get all the publicHolidays.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<PublicHolidayDTO> findAll() {
        LOG.debug("Request to get all PublicHolidays");
        return publicHolidayRepository.findAll().stream().map(publicHolidayMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one publicHoliday by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<PublicHolidayDTO> findOne(Long id) {
        LOG.debug("Request to get PublicHoliday : {}", id);
        return publicHolidayRepository.findById(id).map(publicHolidayMapper::toDto);
    }

    /**
     * Delete the publicHoliday by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete PublicHoliday : {}", id);
        publicHolidayRepository.deleteById(id);
    }
}
