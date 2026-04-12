package tn.paiezone.rh.service;

import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.Authority;
import tn.paiezone.rh.domain.UserProfile;
import tn.paiezone.rh.repository.UserProfileRepository;
import tn.paiezone.rh.repository.UserRepository;
import tn.paiezone.rh.security.AuthoritiesConstants;
import tn.paiezone.rh.security.RoleMapper;
import tn.paiezone.rh.service.dto.UserProfileDTO;
import tn.paiezone.rh.service.mapper.UserProfileMapper;

@Service
@Transactional
public class UserProfileService {

    private static final Logger LOG = LoggerFactory.getLogger(UserProfileService.class);

    private final UserProfileRepository userProfileRepository;
    private final UserProfileMapper userProfileMapper;
    private final UserRepository userRepository; // ← ajouté

    public UserProfileService(
        UserProfileRepository userProfileRepository,
        UserProfileMapper userProfileMapper,
        UserRepository userRepository // ← ajouté
    ) {
        this.userProfileRepository = userProfileRepository;
        this.userProfileMapper = userProfileMapper;
        this.userRepository = userRepository; // ← ajouté
    }

    public UserProfileDTO save(UserProfileDTO userProfileDTO) {
        LOG.debug("Request to save UserProfile : {}", userProfileDTO);
        UserProfile userProfile = userProfileMapper.toEntity(userProfileDTO);
        userProfile = userProfileRepository.save(userProfile);
        syncUserAuthority(userProfile); // ← ajouté
        return userProfileMapper.toDto(userProfile);
    }

    public UserProfileDTO update(UserProfileDTO userProfileDTO) {
        LOG.debug("Request to update UserProfile : {}", userProfileDTO);
        UserProfile userProfile = userProfileMapper.toEntity(userProfileDTO);
        userProfile = userProfileRepository.save(userProfile);
        syncUserAuthority(userProfile); // ← ajouté
        return userProfileMapper.toDto(userProfile);
    }

    public Optional<UserProfileDTO> partialUpdate(UserProfileDTO userProfileDTO) {
        LOG.debug("Request to partially update UserProfile : {}", userProfileDTO);
        return userProfileRepository
            .findById(userProfileDTO.getId())
            .map(existingUserProfile -> {
                userProfileMapper.partialUpdate(existingUserProfile, userProfileDTO);
                return existingUserProfile;
            })
            .map(userProfileRepository::save)
            .map(userProfileMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<UserProfileDTO> findAll() {
        LOG.debug("Request to get all UserProfiles");
        return userProfileRepository.findAll().stream().map(userProfileMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    @Transactional(readOnly = true)
    public Optional<UserProfileDTO> findOne(Long id) {
        LOG.debug("Request to get UserProfile : {}", id);
        return userProfileRepository.findById(id).map(userProfileMapper::toDto);
    }

    public void delete(Long id) {
        LOG.debug("Request to delete UserProfile : {}", id);
        userProfileRepository.deleteById(id);
    }

    // ── Sync AppRole → Spring Authority ──────────────────────────────────
    private void syncUserAuthority(UserProfile userProfile) {
        if (userProfile.getJhiUserId() == null) return;

        userRepository
            .findOneByLogin(userProfile.getJhiUserId())
            .ifPresent(user -> {
                Set<Authority> authorities = new HashSet<>();

                Authority roleUser = new Authority();
                roleUser.setName(AuthoritiesConstants.USER);
                authorities.add(roleUser);

                Authority roleMetier = new Authority();
                roleMetier.setName(RoleMapper.toAuthority(userProfile.getRole()));
                authorities.add(roleMetier);

                user.setAuthorities(authorities);
                userRepository.save(user);

                LOG.debug("Authority synced: {} → {}", user.getLogin(), RoleMapper.toAuthority(userProfile.getRole()));
            });
    }
}
