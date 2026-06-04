package tn.paiezone.rh.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.ConventionRule;
import tn.paiezone.rh.domain.enumeration.ConventionRuleType;

@Repository
public interface ConventionRuleRepository extends JpaRepository<ConventionRule, Long> {
    List<ConventionRule> findByConvention_IdAndActiveTrueOrderByRuleTypeAsc(Long conventionId);
    List<ConventionRule> findByConvention_IdAndRuleTypeAndActiveTrue(Long conventionId, ConventionRuleType ruleType);
}
