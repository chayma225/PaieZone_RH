package tn.paiezone.rh.service.impl;

import jakarta.persistence.EntityNotFoundException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.Advance;
import tn.paiezone.rh.domain.enumeration.AdvanceStatus;
import tn.paiezone.rh.repository.AdvanceRepository;
import tn.paiezone.rh.repository.PaySlipRepository;
import tn.paiezone.rh.security.SecurityUtils;
import tn.paiezone.rh.service.AdvanceService;
import tn.paiezone.rh.service.dto.AdvanceDTO;
import tn.paiezone.rh.service.mapper.AdvanceMapper;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.Advance}.
 */
@Service
@Transactional
public class AdvanceServiceImpl implements AdvanceService {

    private static final Logger LOG = LoggerFactory.getLogger(AdvanceServiceImpl.class);

    private final AdvanceRepository advanceRepository;
    private final AdvanceMapper advanceMapper;
    private final PaySlipRepository paySlipRepository; // Ajouté

    public AdvanceServiceImpl(AdvanceRepository advanceRepository, AdvanceMapper advanceMapper, PaySlipRepository paySlipRepository) {
        this.advanceRepository = advanceRepository;
        this.advanceMapper = advanceMapper;
        this.paySlipRepository = paySlipRepository;
    }

    @Override
    public AdvanceDTO save(AdvanceDTO advanceDTO) {
        LOG.debug("Request to save Advance : {}", advanceDTO);
        Advance advance = advanceMapper.toEntity(advanceDTO);
        String login = SecurityUtils.getCurrentUserLogin().orElse("system");
        Instant now = Instant.now();
        if (advance.getId() == null) {
            advance.setCreatedBy(login);
            advance.setCreatedDate(now);
        }
        advance.setLastModifiedBy(login);
        advance.setLastModifiedDate(now);
        advance = advanceRepository.save(advance);
        return advanceMapper.toDto(advance);
    }

    @Override
    public AdvanceDTO update(AdvanceDTO advanceDTO) {
        LOG.debug("Request to update Advance : {}", advanceDTO);
        Advance advance = advanceMapper.toEntity(advanceDTO);
        String login = SecurityUtils.getCurrentUserLogin().orElse("system");
        advance.setLastModifiedBy(login);
        advance.setLastModifiedDate(Instant.now());
        advance = advanceRepository.save(advance);
        return advanceMapper.toDto(advance);
    }

    @Override
    public Optional<AdvanceDTO> partialUpdate(AdvanceDTO advanceDTO) {
        LOG.debug("Request to partially update Advance : {}", advanceDTO);

        return advanceRepository
            .findById(advanceDTO.getId())
            .map(existingAdvance -> {
                advanceMapper.partialUpdate(existingAdvance, advanceDTO);
                return existingAdvance;
            })
            .map(advanceRepository::save)
            .map(advanceMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AdvanceDTO> findOne(Long id) {
        LOG.debug("Request to get Advance : {}", id);
        return advanceRepository.findById(id).map(advanceMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Advance : {}", id);
        advanceRepository.deleteById(id);
    }

    /**
     * Soumission d'une demande d'avance par l'employé.
     */
    @Override
    public AdvanceDTO requestAdvance(AdvanceDTO dto) {
        LOG.debug("Requesting new advance for employee");
        dto.setStatus(AdvanceStatus.REQUESTED);
        dto.setRequestDate(LocalDate.now());
        Advance advance = advanceMapper.toEntity(dto);
        String login = SecurityUtils.getCurrentUserLogin().orElse("system");
        Instant now = Instant.now();
        advance.setCreatedBy(login);
        advance.setCreatedDate(now);
        advance.setLastModifiedBy(login);
        advance.setLastModifiedDate(now);
        return advanceMapper.toDto(advanceRepository.save(advance));
    }

    /**
     * Approbation par le RH.
     */
    @Override
    public AdvanceDTO approveAdvance(Long id, String approvedBy) {
        LOG.debug("Approving advance : {}", id);
        Advance advance = advanceRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Avance introuvable : " + id));

        if (advance.getStatus() != AdvanceStatus.REQUESTED) {
            throw new IllegalStateException("L'avance est déjà au statut : " + advance.getStatus());
        }

        // Si le mois de déduction n'est pas défini → mois prochain par défaut
        if (advance.getDeductionMonth() == null) {
            LocalDate nextMonth = LocalDate.now().plusMonths(1);
            advance.setDeductionMonth(nextMonth.getMonthValue());
            advance.setDeductionYear(nextMonth.getYear());
        }

        advance.setStatus(AdvanceStatus.APPROVED);
        advance.setApprovedBy(approvedBy);
        advance.setApprovedAt(Instant.now());
        advance.setLastModifiedBy(approvedBy);
        advance.setLastModifiedDate(Instant.now());

        return advanceMapper.toDto(advanceRepository.save(advance));
    }

    /**
     * Rejet par le RH.
     */
    @Override
    public AdvanceDTO rejectAdvance(Long id, String reason) {
        LOG.debug("Rejecting advance : {}", id);
        Advance advance = advanceRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Avance introuvable : " + id));

        if (advance.getStatus() != AdvanceStatus.REQUESTED) {
            throw new IllegalStateException("Seules les avances REQUESTED peuvent être rejetées.");
        }

        advance.setStatus(AdvanceStatus.REJECTED);
        advance.setNotes(reason);
        advance.setLastModifiedBy(SecurityUtils.getCurrentUserLogin().orElse("system"));
        advance.setLastModifiedDate(Instant.now());
        return advanceMapper.toDto(advanceRepository.save(advance));
    }

    /**
     * Marquer une avance comme déduite.
     */
    @Override
    public void markAsDeducted(Long employeeId, int month, int year, Long paySlipId) {
        LOG.debug("Marking approved advances as DEDUCTED for employee {} in {}-{}", employeeId, month, year);
        List<Advance> advances = advanceRepository.findApprovedForDeduction(employeeId, month, year);

        advances.forEach(a -> {
            a.setStatus(AdvanceStatus.DEDUCTED);
            // Lier l'avance au bulletin dans lequel elle a été déduite
            paySlipRepository.findById(paySlipId).ifPresent(a::setPaySlip);
            advanceRepository.save(a);
        });
    }
}
