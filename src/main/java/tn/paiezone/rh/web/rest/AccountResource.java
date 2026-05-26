package tn.paiezone.rh.web.rest;

import jakarta.validation.Valid;
import java.util.*;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.User;
import tn.paiezone.rh.domain.UserProfile;
import tn.paiezone.rh.domain.enumeration.AppRole;
import tn.paiezone.rh.repository.CompanyRepository;
import tn.paiezone.rh.repository.UserProfileRepository;
import tn.paiezone.rh.repository.UserRepository;
import tn.paiezone.rh.security.SecurityUtils;
import tn.paiezone.rh.service.CompanyService;
import tn.paiezone.rh.service.MailService;
import tn.paiezone.rh.service.UserService;
import tn.paiezone.rh.service.dto.AdminUserDTO;
import tn.paiezone.rh.service.dto.CompanyDTO;
import tn.paiezone.rh.service.dto.PasswordChangeDTO;
import tn.paiezone.rh.web.rest.errors.*;
import tn.paiezone.rh.web.rest.vm.KeyAndPasswordVM;
import tn.paiezone.rh.web.rest.vm.ManagedUserVM;
import tn.paiezone.rh.web.rest.vm.RegisterWithCompanyVM;

/**
 * REST controller for managing the current user's account.
 */
@RestController
@RequestMapping("/api")
public class AccountResource {

    private static class AccountResourceException extends RuntimeException {

        private AccountResourceException(String message) {
            super(message);
        }
    }

    private static final Logger LOG = LoggerFactory.getLogger(AccountResource.class);

    private final UserRepository userRepository;

    private final UserService userService;

    private final MailService mailService;

    private final CompanyService companyService;

    private final CompanyRepository companyRepository;

    private final UserProfileRepository userProfileRepository;

    public AccountResource(
        UserRepository userRepository,
        UserService userService,
        MailService mailService,
        CompanyService companyService,
        CompanyRepository companyRepository,
        UserProfileRepository userProfileRepository
    ) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.mailService = mailService;
        this.companyService = companyService;
        this.companyRepository = companyRepository;
        this.userProfileRepository = userProfileRepository;
    }

    /**
     * {@code POST  /register} : register the user.
     *
     * @param managedUserVM the managed user View Model.
     * @throws InvalidPasswordException {@code 400 (Bad Request)} if the password is incorrect.
     * @throws EmailAlreadyUsedException {@code 400 (Bad Request)} if the email is already used.
     * @throws LoginAlreadyUsedException {@code 400 (Bad Request)} if the login is already used.
     */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void registerAccount(@Valid @RequestBody ManagedUserVM managedUserVM) {
        if (isPasswordLengthInvalid(managedUserVM.getPassword())) {
            throw new InvalidPasswordException();
        }
        User user = userService.registerUser(managedUserVM, managedUserVM.getPassword());
        mailService.sendActivationEmail(user);
    }

    @PostMapping("/register-with-company")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public void registerWithCompany(@Valid @RequestBody RegisterWithCompanyVM vm) {
        if (isPasswordLengthInvalid(vm.getPassword())) {
            throw new InvalidPasswordException();
        }
        if (companyRepository.existsByTaxId(vm.getTaxId())) {
            throw new BadRequestAlertException("Ce matricule fiscal est déjà utilisé par une autre entreprise.", "company", "taxIdExists");
        }

        User user = userService.registerUser(vm, vm.getPassword());

        // Auto-activate immediately — company admins don't need email verification
        userService.activateRegistration(user.getActivationKey());

        CompanyDTO companyDTO = new CompanyDTO();
        companyDTO.setName(vm.getCompanyName());
        companyDTO.setTaxId(vm.getTaxId());
        companyDTO.setPhone(vm.getPhone());
        companyDTO.setEmail(vm.getCompanyEmail());
        companyDTO.setAddress(vm.getAddress());
        companyDTO.setGouvernorat(vm.getGouvernorat());
        companyDTO.setCity(vm.getCity());
        companyDTO.setPostalCode(vm.getPostalCode());
        String adminLogin = vm.getLogin().toLowerCase();
        companyDTO.setAdminLogin(adminLogin);
        CompanyDTO savedCompany = companyService.save(companyDTO, vm.getPlan());

        // Create a UserProfile for the admin so tenant resolution works via both paths
        if (!userProfileRepository.existsByJhiUserId(adminLogin)) {
            Company company = companyRepository.findById(savedCompany.getId()).orElseThrow();
            UserProfile profile = new UserProfile();
            profile.setJhiUserId(adminLogin);
            profile.setRole(AppRole.ADMIN);
            profile.setCompany(company);
            profile.setActive(true);
            userProfileRepository.save(profile);
        }
    }

    /**
     * {@code GET  /activate} : activate the registered user.
     *
     * @param key the activation key.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the user couldn't be activated.
     */
    @GetMapping("/activate")
    public void activateAccount(@RequestParam(value = "key") String key) {
        Optional<User> user = userService.activateRegistration(key);
        if (!user.isPresent()) {
            throw new AccountResourceException("No user was found for this activation key");
        }
    }

    /**
     * {@code GET  /account} : get the current user.
     *
     * @return the current user.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the user couldn't be returned.
     */
    @GetMapping("/account")
    public AdminUserDTO getAccount() {
        return userService
            .getUserWithAuthorities()
            .map(AdminUserDTO::new)
            .orElseThrow(() -> new AccountResourceException("User could not be found"));
    }

    /**
     * {@code POST  /account} : update the current user information.
     *
     * @param userDTO the current user information.
     * @throws EmailAlreadyUsedException {@code 400 (Bad Request)} if the email is already used.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the user login wasn't found.
     */
    @PostMapping("/account")
    public void saveAccount(@Valid @RequestBody AdminUserDTO userDTO) {
        String userLogin = SecurityUtils.getCurrentUserLogin().orElseThrow(() ->
            new AccountResourceException("Current user login not found")
        );
        Optional<User> existingUser = userRepository.findOneByEmailIgnoreCase(userDTO.getEmail());
        if (existingUser.isPresent() && (!existingUser.orElseThrow().getLogin().equalsIgnoreCase(userLogin))) {
            throw new EmailAlreadyUsedException();
        }
        Optional<User> user = userRepository.findOneByLogin(userLogin);
        if (!user.isPresent()) {
            throw new AccountResourceException("User could not be found");
        }
        userService.updateUser(
            userDTO.getFirstName(),
            userDTO.getLastName(),
            userDTO.getEmail(),
            userDTO.getLangKey(),
            userDTO.getImageUrl()
        );
    }

    /**
     * {@code POST  /account/change-password} : changes the current user's password.
     *
     * @param passwordChangeDto current and new password.
     * @throws InvalidPasswordException {@code 400 (Bad Request)} if the new password is incorrect.
     */
    @PostMapping(path = "/account/change-password")
    public void changePassword(@RequestBody PasswordChangeDTO passwordChangeDto) {
        if (isPasswordLengthInvalid(passwordChangeDto.getNewPassword())) {
            throw new InvalidPasswordException();
        }
        userService.changePassword(passwordChangeDto.getCurrentPassword(), passwordChangeDto.getNewPassword());
    }

    /**
     * {@code POST   /account/reset-password/init} : Send an email to reset the password of the user.
     *
     * @param mail the mail of the user.
     */
    @PostMapping(path = "/account/reset-password/init")
    public void requestPasswordReset(@RequestBody String mail) {
        Optional<User> user = userService.requestPasswordReset(mail);
        if (user.isPresent()) {
            mailService.sendPasswordResetMail(user.orElseThrow());
        } else {
            // Pretend the request has been successful to prevent checking which emails really exist
            // but log that an invalid attempt has been made
            LOG.warn("Password reset requested for non existing mail");
        }
    }

    /**
     * {@code POST   /account/reset-password/finish} : Finish to reset the password of the user.
     *
     * @param keyAndPassword the generated key and the new password.
     * @throws InvalidPasswordException {@code 400 (Bad Request)} if the password is incorrect.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the password could not be reset.
     */
    @PostMapping(path = "/account/reset-password/finish")
    public void finishPasswordReset(@RequestBody KeyAndPasswordVM keyAndPassword) {
        if (isPasswordLengthInvalid(keyAndPassword.getNewPassword())) {
            throw new InvalidPasswordException();
        }
        Optional<User> user = userService.completePasswordReset(keyAndPassword.getNewPassword(), keyAndPassword.getKey());

        if (!user.isPresent()) {
            throw new AccountResourceException("No user was found for this reset key");
        }
    }

    private static boolean isPasswordLengthInvalid(String password) {
        return (
            StringUtils.isEmpty(password) ||
            password.length() < ManagedUserVM.PASSWORD_MIN_LENGTH ||
            password.length() > ManagedUserVM.PASSWORD_MAX_LENGTH
        );
    }
}
