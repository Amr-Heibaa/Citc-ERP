package com.citec.ems.iam.infrastructure;


import com.citec.ems.iam.domain.*;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsernameIgnoreCase(String username);

    Optional<User> findByEmailIgnoreCase(String email);

    @Query("""
            select user
            from User user
            join fetch user.status
            where lower(user.username) = lower(:identifier)
               or lower(user.email) = lower(:identifier)
            """)
    Optional<User> findByUsernameOrEmail(@Param("identifier") String identifier);
}




