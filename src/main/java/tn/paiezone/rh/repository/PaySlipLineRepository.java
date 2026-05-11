package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.PaySlipLine;

import java.util.List;

@Repository
public interface PaySlipLineRepository extends JpaRepository<PaySlipLine, Long> {

    @Modifying
    @Query("DELETE FROM PaySlipLine l WHERE l.paySlip.id = :paySlipId")
    void deleteByPaySlipId(@Param("paySlipId") Long paySlipId);

    List<PaySlipLine> findByPaySlipIdOrderBySortOrder(Long paySlipId);
}
