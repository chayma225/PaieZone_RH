package tn.paiezone.rh.security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import tn.paiezone.rh.repository.EmployeeRepository;
import tn.paiezone.rh.repository.PaySlipRepository;

/**
 * Bean de sécurité pour vérifier qu'un employé accède uniquement à ses propres bulletins.
 * Utilisé via @PreAuthorize("@paySlipSecurity.isOwner(#id, authentication)")
 */
@Component("paySlipSecurity")
public class PaySlipSecurity {

    private final PaySlipRepository paySlipRepository;
    private final EmployeeRepository employeeRepository;

    public PaySlipSecurity(PaySlipRepository paySlipRepository, EmployeeRepository employeeRepository) {
        this.paySlipRepository = paySlipRepository;
        this.employeeRepository = employeeRepository;
    }

    public boolean isOwner(Long paySlipId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) return false;
        String login = authentication.getName();
        return employeeRepository
            .findByUserProfile_JhiUserId(login)
            .flatMap(emp ->
                paySlipRepository.findById(paySlipId).filter(ps -> ps.getEmployee() != null && ps.getEmployee().getId().equals(emp.getId()))
            )
            .isPresent();
    }
}
