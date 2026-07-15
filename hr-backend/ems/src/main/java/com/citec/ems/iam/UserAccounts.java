package com.citec.ems.iam;

import com.citec.ems.iam.infrastructure.UserRepository;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserAccounts {

    private final UserRepository userRepository;

    public UserAccounts(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public boolean existsById(Long userId) {
        return userRepository.existsById(userId);
    }

    @Transactional(readOnly = true)
    public Optional<UserAccountSummary> findSummary(Long userId) {
        return userRepository.findById(userId)
                .map(user -> new UserAccountSummary(user.getUserId(), user.getUsername(), user.getEmail()));
    }
}
