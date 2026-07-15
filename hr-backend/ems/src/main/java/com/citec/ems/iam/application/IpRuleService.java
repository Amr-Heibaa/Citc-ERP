package com.citec.ems.iam.application;


import com.citec.ems.iam.domain.*;
import com.citec.ems.iam.infrastructure.*;
import com.citec.ems.shared.BadRequestException;
import java.net.InetAddress;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class IpRuleService {

    private final ApplicationModuleRepository applicationModuleRepository;
    private final UserLoginIpRuleRepository userLoginIpRuleRepository;

    public IpRuleService(
            ApplicationModuleRepository applicationModuleRepository,
            UserLoginIpRuleRepository userLoginIpRuleRepository) {
        this.applicationModuleRepository = applicationModuleRepository;
        this.userLoginIpRuleRepository = userLoginIpRuleRepository;
    }

    public void assertLoginAllowed(Long userId, String applicationCode, String ipAddress) {
        Integer moduleId = applicationModuleRepository.findByApplicationCodeIgnoreCase(applicationCode)
                .map(ApplicationModule::getApplicationModuleId)
                .orElse(null);
        List<UserLoginIpRule> rules = userLoginIpRuleRepository.findActiveRules(userId, moduleId, LocalDate.now());
        if (rules.isEmpty()) {
            return;
        }

        boolean hasAllowRules = false;
        boolean matchesAllow = false;
        for (UserLoginIpRule rule : rules) {
            boolean matches = matches(rule, ipAddress);
            if (Short.valueOf(UserLoginIpRule.BLOCK).equals(rule.getRuleType()) && matches) {
                throw new BadRequestException("Login is blocked from this IP address.");
            }
            if (Short.valueOf(UserLoginIpRule.ALLOW).equals(rule.getRuleType())) {
                hasAllowRules = true;
                matchesAllow = matchesAllow || matches;
            }
        }

        if (hasAllowRules && !matchesAllow) {
            throw new BadRequestException("Login is not allowed from this IP address.");
        }
    }

    private boolean matches(UserLoginIpRule rule, String ipAddress) {
        if (ipAddress == null || ipAddress.isBlank()) {
            return false;
        }
        String clientIp = firstForwardedIp(ipAddress);
        if (rule.getIpAddress() != null && rule.getIpAddress().equals(clientIp)) {
            return true;
        }
        if (rule.getIpRange() != null) {
            return cidrMatches(rule.getIpRange(), clientIp);
        }
        return false;
    }

    private String firstForwardedIp(String value) {
        int comma = value.indexOf(',');
        return comma >= 0 ? value.substring(0, comma).trim() : value.trim();
    }

    private boolean cidrMatches(String cidr, String ipAddress) {
        if (!cidr.contains("/")) {
            return cidr.equals(ipAddress);
        }
        String[] parts = cidr.split("/");
        if (parts.length != 2) {
            return false;
        }
        try {
            byte[] networkBytes = InetAddress.getByName(parts[0]).getAddress();
            byte[] ipBytes = InetAddress.getByName(ipAddress).getAddress();
            if (networkBytes.length != 4 || ipBytes.length != 4) {
                return false;
            }
            int prefix = Integer.parseInt(parts[1]);
            if (prefix < 0 || prefix > 32) {
                return false;
            }
            long network = ipv4ToLong(networkBytes);
            long ip = ipv4ToLong(ipBytes);
            long mask = prefix == 0 ? 0 : (0xffffffffL << (32 - prefix)) & 0xffffffffL;
            return (network & mask) == (ip & mask);
        } catch (Exception ex) {
            return false;
        }
    }

    private long ipv4ToLong(byte[] bytes) {
        return ((long) bytes[0] & 0xff) << 24
                | ((long) bytes[1] & 0xff) << 16
                | ((long) bytes[2] & 0xff) << 8
                | ((long) bytes[3] & 0xff);
    }
}




