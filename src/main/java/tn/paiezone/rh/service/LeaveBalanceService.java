package tn.paiezone.rh.service;

import tn.paiezone.rh.service.dto.LeaveBalanceDTO;

import java.util.List;
import java.util.Optional;

public interface LeaveBalanceService {
    /** Accumulation mensuelle de congés */
    void accrueMonthlyAnnualLeave();

    /** Report des congés en fin d'année */
    void processYearEndCarryOver(int fromYear);

    // Méthodes CRUD standard
    LeaveBalanceDTO save(LeaveBalanceDTO leaveBalanceDTO);
    LeaveBalanceDTO update(LeaveBalanceDTO leaveBalanceDTO);
    Optional<LeaveBalanceDTO> partialUpdate(LeaveBalanceDTO leaveBalanceDTO);
    List<LeaveBalanceDTO> findAll();
    Optional<LeaveBalanceDTO> findOne(Long id);
    void delete(Long id);
}
