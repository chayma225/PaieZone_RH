package tn.paiezone.rh.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.LeaveBalance;
import tn.paiezone.rh.domain.LeaveType;
import tn.paiezone.rh.domain.enumeration.LeaveTypeName;
import tn.paiezone.rh.repository.EmployeeRepository;
import tn.paiezone.rh.repository.LeaveBalanceRepository;
import tn.paiezone.rh.repository.LeaveTypeRepository;
import tn.paiezone.rh.service.LeaveBalanceService;
import tn.paiezone.rh.service.dto.LeaveBalanceDTO;
import tn.paiezone.rh.service.mapper.LeaveBalanceMapper;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class LeaveBalanceServiceImpl implements LeaveBalanceService {

    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceMapper leaveBalanceMapper;

    /** Accumulation mensuelle : 1,5 jour/mois */
    @Override
    public void accrueMonthlyAnnualLeave() {
        int currentYear = LocalDate.now().getYear();
        BigDecimal monthlyAccrual = new BigDecimal("1.5");

        LeaveType annual = leaveTypeRepository.findByName(LeaveTypeName.ANNUEL)
            .orElseThrow(() -> new IllegalStateException("Type ANNUAL manquant en base"));

        List<Employee> employees = employeeRepository.findAll(); // Adapté selon votre logique active/non-active

        for (Employee emp : employees) {
            LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeIdAndYear(emp.getId(), annual.getId(), currentYear)
                .orElseGet(() -> createInitialBalance(emp, annual, currentYear));

            balance.setEntitled(balance.getEntitled().add(monthlyAccrual));
            recalculateRemaining(balance);
            balance.setLastUpdatedAt(Instant.now());
            leaveBalanceRepository.save(balance);
        }
        log.info("📅 Accumulation mensuelle effectuée pour {} employés", employees.size());
    }

    /** Report des congés en fin d'année */
    @Override
    public void processYearEndCarryOver(int fromYear) {
        LeaveType annual = leaveTypeRepository.findByName(LeaveTypeName.ANNUEL).orElseThrow();
        List<LeaveBalance> fromYearBalances = leaveBalanceRepository.findByLeaveTypeIdAndYear(annual.getId(), fromYear);

        int nextYear = fromYear + 1;
        BigDecimal maxCarryOver = BigDecimal.valueOf(annual.getCarryOverDays() != null ? annual.getCarryOverDays() : 0);

        for (LeaveBalance b : fromYearBalances) {
            BigDecimal carryOver = b.getRemaining().min(maxCarryOver);

            if (carryOver.compareTo(BigDecimal.ZERO) > 0) {
                LeaveBalance nextYearBalance = leaveBalanceRepository
                    .findByEmployeeIdAndLeaveTypeIdAndYear(b.getEmployee().getId(), annual.getId(), nextYear)
                    .orElseGet(() -> createInitialBalance(b.getEmployee(), annual, nextYear));

                nextYearBalance.setCarryOver(carryOver);
                nextYearBalance.setEntitled(nextYearBalance.getEntitled().add(carryOver));
                recalculateRemaining(nextYearBalance);
                leaveBalanceRepository.save(nextYearBalance);
            }
        }
    }

    private void recalculateRemaining(LeaveBalance balance) {
        BigDecimal taken = balance.getTaken() != null ? balance.getTaken() : BigDecimal.ZERO;
        BigDecimal pending = balance.getPending() != null ? balance.getPending() : BigDecimal.ZERO;

        balance.setRemaining(
            balance.getEntitled().subtract(taken).subtract(pending).max(BigDecimal.ZERO)
        );
    }

    private LeaveBalance createInitialBalance(Employee emp, LeaveType lt, int year) {
        LeaveBalance b = new LeaveBalance();
        b.setEmployee(emp);
        b.setLeaveType(lt);
        b.setYear(year);
        b.setEntitled(BigDecimal.ZERO);
        b.setTaken(BigDecimal.ZERO);
        b.setPending(BigDecimal.ZERO);
        b.setCarryOver(BigDecimal.ZERO);
        b.setRemaining(BigDecimal.ZERO);
        b.setLastUpdatedAt(Instant.now());
        return b; // On ne save pas ici, on laisse la méthode appelante le faire
    }

    // --- Méthodes CRUD Standard ---

    @Override
    public LeaveBalanceDTO save(LeaveBalanceDTO leaveBalanceDTO) {
        LeaveBalance entity = leaveBalanceMapper.toEntity(leaveBalanceDTO);
        entity = leaveBalanceRepository.save(entity);
        return leaveBalanceMapper.toDto(entity);
    }

    @Override
    public LeaveBalanceDTO update(LeaveBalanceDTO leaveBalanceDTO) {
        return save(leaveBalanceDTO);
    }

    @Override
    public Optional<LeaveBalanceDTO> partialUpdate(LeaveBalanceDTO leaveBalanceDTO) {
        return leaveBalanceRepository.findById(leaveBalanceDTO.getId())
            .map(existing -> {
                leaveBalanceMapper.partialUpdate(existing, leaveBalanceDTO);
                return existing;
            })
            .map(leaveBalanceRepository::save)
            .map(leaveBalanceMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveBalanceDTO> findAll() {
        return leaveBalanceRepository.findAll().stream()
            .map(leaveBalanceMapper::toDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<LeaveBalanceDTO> findOne(Long id) {
        return leaveBalanceRepository.findById(id).map(leaveBalanceMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        leaveBalanceRepository.deleteById(id);
    }
}
