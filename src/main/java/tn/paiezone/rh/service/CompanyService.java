package tn.paiezone.rh.service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.repository.CompanyRepository;
import tn.paiezone.rh.service.dto.CompanyDTO;
import tn.paiezone.rh.service.mapper.CompanyMapper;

@Service
@Transactional
public class CompanyService {

    private static final Logger LOG = LoggerFactory.getLogger(CompanyService.class);
    private static final String ENTITY_NAME = "company";

    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;

    public CompanyService(CompanyRepository companyRepository, CompanyMapper companyMapper) {
        this.companyRepository = companyRepository;
        this.companyMapper = companyMapper;
    }

    /**
     * ✅ CREATE — génération automatique des champs techniques
     */
    public CompanyDTO save(CompanyDTO companyDTO) {
        LOG.debug("Request to save Company : {}", companyDTO);

        companyDTO.setTenantSchema("tenant_" + UUID.randomUUID().toString().replace("-", ""));
        companyDTO.setCreatedAt(Instant.now());
        companyDTO.setActive(true);
        companyDTO.setTrialEnd(LocalDate.now().plusDays(14));

        Company company = companyMapper.toEntity(companyDTO);
        company = companyRepository.save(company);

        return companyMapper.toDto(company);
    }

    /**
     * ✅ UPDATE — protège les champs immuables MAIS respecte active
     *    (permet au toggleStatus de fonctionner)
     */
    public CompanyDTO update(CompanyDTO companyDTO) {
        LOG.debug("Request to update Company : {}", companyDTO);

        Company existing = companyRepository
            .findById(companyDTO.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Entreprise introuvable."));

        // ✅ Champs vraiment immuables → toujours protégés
        companyDTO.setTenantSchema(existing.getTenantSchema());
        companyDTO.setCreatedAt(existing.getCreatedAt());
        companyDTO.setTrialEnd(existing.getTrialEnd());

        // ✅ active → on garde la valeur du DTO si elle est fournie
        //    sinon on reprend celle de la base (sécurité)
        if (companyDTO.getActive() == null) {
            companyDTO.setActive(existing.getActive());
        }

        Company company = companyMapper.toEntity(companyDTO);
        company = companyRepository.save(company);
        return companyMapper.toDto(company);
    }

    /**
     * ✅ PARTIAL UPDATE — protège tous les champs techniques
     */
    public Optional<CompanyDTO> partialUpdate(CompanyDTO companyDTO) {
        LOG.debug("Request to partially update Company : {}", companyDTO);

        return companyRepository
            .findById(companyDTO.getId())
            .map(existingCompany -> {
                companyDTO.setTenantSchema(existingCompany.getTenantSchema());
                companyDTO.setCreatedAt(existingCompany.getCreatedAt());
                companyDTO.setTrialEnd(existingCompany.getTrialEnd());
                if (companyDTO.getActive() == null) {
                    companyDTO.setActive(existingCompany.getActive());
                }
                companyMapper.partialUpdate(existingCompany, companyDTO);
                return existingCompany;
            })
            .map(companyRepository::save)
            .map(companyMapper::toDto);
    }

    /**
     * Get all the companies.
     */
    @Transactional(readOnly = true)
    public List<CompanyDTO> findAll() {
        LOG.debug("Request to get all Companies");
        return companyRepository.findAll().stream().map(companyMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one company by id.
     */
    @Transactional(readOnly = true)
    public Optional<CompanyDTO> findOne(Long id) {
        LOG.debug("Request to get Company : {}", id);
        return companyRepository.findById(id).map(companyMapper::toDto);
    }

    /**
     * Delete the company by id.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Company : {}", id);
        companyRepository.deleteById(id);
    }
}
