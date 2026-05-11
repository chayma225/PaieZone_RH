// src/main/java/tn/paiezone/rh/service/RegulatoryParamService.java
package tn.paiezone.rh.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.RegulatoryParam;
import tn.paiezone.rh.repository.RegulatoryParamRepository;
import tn.paiezone.rh.service.dto.RegulatoryParamDTO;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class RegulatoryParamService {

    private final RegulatoryParamRepository repo;

    @Transactional(readOnly = true)
    public List<RegulatoryParamDTO> findAllActive() {
        return repo.findAllActive().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RegulatoryParamDTO> findAll() {
        return repo.findAllByOrderByParamKeyAscEffectiveFromDesc()
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<RegulatoryParamDTO> findById(Long id) {
        return repo.findById(id).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public List<RegulatoryParamDTO> findHistoryByKey(String key) {
        return repo.findByParamKeyOrderByEffectiveFromDesc(key)
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Mise à jour par le Super Admin.
     * - Même date → modification in-place
     * - Date différente → fermer l'ancien + créer nouveau (historique préservé)
     */
    public RegulatoryParamDTO update(Long id, RegulatoryParamDTO dto, String updatedBy) {
        RegulatoryParam existing = repo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Paramètre introuvable : id=" + id));

        // Modification in-place si même date d'effet
        if (dto.getEffectiveFrom().equals(existing.getEffectiveFrom())) {
            existing.setNumericValue(dto.getNumericValue());
            if (dto.getParamLabel()     != null) existing.setParamLabel(dto.getParamLabel());
            if (dto.getLegalReference() != null) existing.setLegalReference(dto.getLegalReference());
            if (dto.getDescription()    != null) existing.setDescription(dto.getDescription());
            existing.setUpdatedBy(updatedBy);
            existing.setUpdatedAt(Instant.now());
            log.info("Param {} modifié in-place par {}", existing.getParamKey(), updatedBy);
            return toDTO(repo.save(existing));
        }

        // Nouvelle version avec date d'effet future → préserve l'historique
        existing.setEffectiveTo(dto.getEffectiveFrom().minusDays(1));
        existing.setActive(false);
        repo.save(existing);

        RegulatoryParam newP = new RegulatoryParam();
        newP.setParamKey(existing.getParamKey());
        newP.setCategory(existing.getCategory());
        newP.setParamLabel(dto.getParamLabel() != null ? dto.getParamLabel() : existing.getParamLabel());
        newP.setNumericValue(dto.getNumericValue());
        newP.setStringValue(dto.getStringValue());
        newP.setEffectiveFrom(dto.getEffectiveFrom());
        newP.setLegalReference(dto.getLegalReference() != null ? dto.getLegalReference() : existing.getLegalReference());
        newP.setDescription(dto.getDescription() != null ? dto.getDescription() : existing.getDescription());
        newP.setActive(true);
        newP.setUpdatedBy(updatedBy);
        newP.setUpdatedAt(Instant.now());

        log.info("Param {} nouvelle version | valeur={} effective={} par {}",
            existing.getParamKey(), dto.getNumericValue(), dto.getEffectiveFrom(), updatedBy);
        return toDTO(repo.save(newP));
    }

    // ── Mapper ──────────────────────────────────────────────────────

    private RegulatoryParamDTO toDTO(RegulatoryParam e) {
        RegulatoryParamDTO d = new RegulatoryParamDTO();
        d.setId(e.getId());
        d.setParamKey(e.getParamKey());
        d.setParamLabel(e.getParamLabel());
        d.setNumericValue(e.getNumericValue());
        d.setStringValue(e.getStringValue());
        d.setEffectiveFrom(e.getEffectiveFrom());
        d.setEffectiveTo(e.getEffectiveTo());
        d.setLegalReference(e.getLegalReference());
        d.setDescription(e.getDescription());
        d.setActive(e.getActive());
        d.setCategory(e.getCategory());
        d.setUpdatedAt(e.getUpdatedAt());
        d.setUpdatedBy(e.getUpdatedBy());
        return d;
    }

    public RegulatoryParamDTO save(RegulatoryParamDTO regulatoryParamDTO) {
        log.debug("Request to save RegulatoryParam : {}", regulatoryParamDTO);
        // Vous pouvez réutiliser votre logique de conversion ou un mapper
        RegulatoryParam regulatoryParam = new RegulatoryParam(); // À adapter selon vos besoins
        // ... remplissage de l'entité ...
        regulatoryParam = repo.save(regulatoryParam);
        return toDTO(regulatoryParam);
    }

    // Modifiez ou surchargez la méthode update pour le contrôleur
    public RegulatoryParamDTO update(RegulatoryParamDTO regulatoryParamDTO) {
        log.debug("Request to update RegulatoryParam : {}", regulatoryParamDTO);
        // Ici, on appelle votre version complexe avec des valeurs par défaut
        // ou on implémente une logique simple
        return update(regulatoryParamDTO.getId(), regulatoryParamDTO, "system");
    }

    @Transactional(readOnly = true)
    public Optional<RegulatoryParamDTO> findOne(Long id) {
        log.debug("Request to get RegulatoryParam : {}", id);
        return repo.findById(id).map(this::toDTO);
    }

    public void delete(Long id) {
        log.debug("Request to delete RegulatoryParam : {}", id);
        repo.deleteById(id);
    }
}
