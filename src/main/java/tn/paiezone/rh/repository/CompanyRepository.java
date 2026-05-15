package tn.paiezone.rh.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.Company;

@SuppressWarnings("unused")
@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findFirstByAdminLogin(String adminLogin);

    List<Company> findByAdminLogin(String adminLogin);

    boolean existsByTaxId(String taxId);
}
