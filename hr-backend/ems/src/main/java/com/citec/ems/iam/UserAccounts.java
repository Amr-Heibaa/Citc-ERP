package com.citec.ems.iam;

import com.citec.ems.iam.domain.User;
import com.citec.ems.iam.infrastructure.UserRepository;
import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
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
        return userRepository.findById(userId).map(UserAccounts::toSummary);
    }

    /** Batch-loads many user summaries in ONE query (avoids N+1). */
    @Transactional(readOnly = true)
    public Map<Long, UserAccountSummary> findSummaries(Collection<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Map.of();
        }
        return userRepository.findAllById(userIds).stream()
                .map(UserAccounts::toSummary)
                .collect(Collectors.toMap(UserAccountSummary::userId, summary -> summary));
    }

    private static UserAccountSummary toSummary(User user) {
        return new UserAccountSummary(user.getUserId(), user.getUsername(), user.getEmail());
    }
}