package tn.paiezone.rh.service.impl;

import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.LeaveBalance;
import tn.paiezone.rh.domain.LeaveRequest;
import tn.paiezone.rh.domain.LeaveType;
import tn.paiezone.rh.domain.PublicHoliday;
import tn.paiezone.rh.domain.enumeration.LeaveStatus;
import tn.paiezone.rh.repository.EmployeeRepository;
import tn.paiezone.rh.repository.LeaveBalanceRepository;
import tn.paiezone.rh.repository.LeaveRequestRepository;
import tn.paiezone.rh.repository.LeaveTypeRepository;
import tn.paiezone.rh.repository.PublicHolidayRepository;
import tn.paiezone.rh.service.LeaveRequestService;
import tn.paiezone.rh.service.dto.LeaveRequestDTO;
import tn.paiezone.rh.service.mapper.LeaveRequestMapper;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveRequestMapper leaveRequestMapper;
    private final PublicHolidayRepository publicHolidayRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public LeaveRequestDTO submit(LeaveRequestDTO dto) {
        // Vérification des dates
        if (dto.getStartDate() == null || dto.getEndDate() == null) {
            throw new IllegalArgumentException("Les dates de début et de fin sont obligatoires");
        }

        int year = dto.getStartDate().getYear();
        Long empId = dto.getEmployee().getId();
        Long ltId = dto.getLeaveType().getId();

        // Rejet automatique si la date de début est dans le passé
        if (dto.getStartDate().isBefore(LocalDate.now())) {
            int days = Math.max(countWorkingDays(dto.getStartDate(), dto.getEndDate(), year), 0);
            LeaveRequest rejected = leaveRequestMapper.toEntity(dto);
            rejected.setNumberOfDays(days);
            rejected.setStatus(LeaveStatus.REJECTED);
            rejected.setRequestedAt(Instant.now());
            rejected.setProcessedAt(Instant.now());
            rejected.setManagerComment("Rejet automatique : la date de début (" + dto.getStartDate() + ") est dans le passé.");
            LeaveRequest saved = leaveRequestRepository.save(rejected);
            log.warn("⛔ Congé emp#{} rejeté auto : date passée ({} < {})", empId, dto.getStartDate(), LocalDate.now());
            return leaveRequestMapper.toDto(saved);
        }

        // 1. Obtenir ou créer automatiquement le solde pour cette année
        LeaveBalance balance = leaveBalanceRepository
            .findByEmployeeIdAndLeaveTypeIdAndYear(empId, ltId, year)
            .orElseGet(() -> {
                LeaveType lt = leaveTypeRepository.findById(ltId).orElseThrow(() -> new IllegalStateException("Type de congé introuvable"));
                Employee emp = employeeRepository.findById(empId).orElseThrow(() -> new IllegalStateException("Employé introuvable"));
                BigDecimal entitled = BigDecimal.valueOf(lt.getMaxDaysPerYear());
                LeaveBalance b = new LeaveBalance();
                b.setYear(year);
                b.setEmployee(emp);
                b.setLeaveType(lt);
                b.setEntitled(entitled);
                b.setTaken(BigDecimal.ZERO);
                b.setPending(BigDecimal.ZERO);
                b.setCarryOver(BigDecimal.ZERO);
                b.setRemaining(entitled);
                b.setLastUpdatedAt(Instant.now());
                return leaveBalanceRepository.save(b);
            });

        int workingDays = countWorkingDays(dto.getStartDate(), dto.getEndDate(), year);

        if (workingDays <= 0) {
            throw new IllegalStateException("La demande ne contient aucun jour ouvrable.");
        }

        if (balance.getRemaining().compareTo(BigDecimal.valueOf(workingDays)) < 0) {
            throw new IllegalStateException(
                "Solde insuffisant : " + balance.getRemaining() + " j disponibles, " + workingDays + " j demandés"
            );
        }

        // 2. Bloquer les jours (pending)
        balance.setPending(balance.getPending().add(BigDecimal.valueOf(workingDays)));
        balance.setRemaining(balance.getRemaining().subtract(BigDecimal.valueOf(workingDays)));
        leaveBalanceRepository.save(balance);

        // 3. Sauvegarder la demande
        LeaveRequest leaveRequest = leaveRequestMapper.toEntity(dto);
        leaveRequest.setNumberOfDays(workingDays);
        leaveRequest.setStatus(LeaveStatus.PENDING);
        leaveRequest.setRequestedAt(Instant.now());

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        log.info("📋 Congé demandé : emp#{} {} → {} ({} j)", dto.getEmployee().getId(), dto.getStartDate(), dto.getEndDate(), workingDays);

        return leaveRequestMapper.toDto(saved);
    }

    @Override
    public LeaveRequestDTO approve(Long id, Long approvedById) {
        LeaveRequest lr = getOrThrow(id);
        assertStatus(lr, LeaveStatus.PENDING);

        LeaveBalance balance = getBalance(lr);

        // Passage de pending (réservé) à taken (consommé)
        BigDecimal days = BigDecimal.valueOf(lr.getNumberOfDays());
        balance.setPending(balance.getPending().subtract(days));
        balance.setTaken(balance.getTaken().add(days));
        leaveBalanceRepository.save(balance);

        lr.setStatus(LeaveStatus.APPROVED);
        lr.setProcessedAt(Instant.now());
        // Optionnel: lr.setProcessedBy(employeeRepository.getReferenceById(approvedById));

        log.info("✅ Congé #{} approuvé", id);
        return leaveRequestMapper.toDto(leaveRequestRepository.save(lr));
    }

    @Override
    public LeaveRequestDTO reject(Long id, String comment) {
        LeaveRequest lr = getOrThrow(id);
        assertStatus(lr, LeaveStatus.PENDING);

        LeaveBalance balance = getBalance(lr);

        // Restituer les jours : on enlève du pending et on remet dans le remaining
        BigDecimal days = BigDecimal.valueOf(lr.getNumberOfDays());
        balance.setPending(balance.getPending().subtract(days));
        balance.setRemaining(balance.getRemaining().add(days));
        leaveBalanceRepository.save(balance);

        lr.setStatus(LeaveStatus.REJECTED);
        lr.setProcessedAt(Instant.now());
        lr.setManagerComment(comment);

        log.info("❌ Congé #{} rejeté : {}", id, comment);
        return leaveRequestMapper.toDto(leaveRequestRepository.save(lr));
    }

    public int countWorkingDays(LocalDate from, LocalDate to, int year) {
        List<LocalDate> holidays = publicHolidayRepository.findByYear(year).stream().map(PublicHoliday::getHolidayDate).toList();

        int count = 0;
        LocalDate current = from;
        while (!current.isAfter(to)) {
            DayOfWeek dow = current.getDayOfWeek();
            // Logique standard : Samedi et Dimanche sont non-ouvrables
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY && !holidays.contains(current)) {
                count++;
            }
            current = current.plusDays(1);
        }
        return count;
    }

    private LeaveRequest getOrThrow(Long id) {
        return leaveRequestRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Congé introuvable : " + id));
    }

    private LeaveBalance getBalance(LeaveRequest lr) {
        return leaveBalanceRepository
            .findByEmployeeIdAndLeaveTypeIdAndYear(lr.getEmployee().getId(), lr.getLeaveType().getId(), lr.getStartDate().getYear())
            .orElseThrow(() -> new IllegalStateException("Solde introuvable"));
    }

    private void assertStatus(LeaveRequest lr, LeaveStatus expected) {
        if (lr.getStatus() != expected) {
            throw new IllegalStateException("Statut incorrect. Attendu : " + expected + ", Actuel : " + lr.getStatus());
        }
    }

    @Override
    public LeaveRequestDTO save(LeaveRequestDTO leaveRequestDTO) {
        return null;
    }

    @Override
    public LeaveRequestDTO update(LeaveRequestDTO leaveRequestDTO) {
        return null;
    }

    @Override
    public Optional<LeaveRequestDTO> partialUpdate(LeaveRequestDTO leaveRequestDTO) {
        return Optional.empty();
    }

    // Ajout des méthodes CRUD manquantes pour l'interface
    @Override
    public Optional<LeaveRequestDTO> findOne(Long id) {
        return leaveRequestRepository.findById(id).map(leaveRequestMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        leaveRequestRepository.deleteById(id);
    }
}
