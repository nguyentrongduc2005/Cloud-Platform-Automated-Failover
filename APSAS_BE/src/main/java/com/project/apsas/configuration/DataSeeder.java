package com.project.apsas.configuration;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.apsas.entity.Permission;
import com.project.apsas.entity.Profile;
import com.project.apsas.entity.Role;
import com.project.apsas.entity.User;
import com.project.apsas.enums.UserStatus;
import com.project.apsas.repository.PermissionRepository;
import com.project.apsas.repository.ProfileRepository;
import com.project.apsas.repository.RoleRepository;
import com.project.apsas.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.core.io.support.EncodedResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import javax.sql.DataSource;
import java.nio.charset.StandardCharsets;
import java.io.IOException;
import java.time.LocalDate;
import java.sql.Connection;
import java.util.*;

@Component
@Slf4j
public class DataSeeder implements ApplicationRunner {
    private final PermissionRepository permRepo;
    private final RoleRepository roleRepo;
    private final UserRepository userRepo;
    private final ProfileRepository profileRepo;
    private final PasswordEncoder encoder;
    private final AdminProperties admin;
    private final TransactionTemplate transactionTemplate; // Dùng để quản lý transaction thủ công
    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper;
    private final DataSource dataSource;

    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    @Value("${app.seed.demo-users-enabled:true}")
    private boolean seedDemoUsersEnabled;

    @Value("${app.seed.demo-users-password:Demo@12345}")
    private String demoUsersPassword;

    @Value("${app.seed.demo-users-source:classpath:seed/demo-users.json}")
    private String demoUsersSource;

    @Value("${app.seed.bootstrap-sql-enabled:true}")
    private boolean seedBootstrapSqlEnabled;

    @Value("${app.seed.bootstrap-sql-source:classpath:seed/bootstrap-data.sql}")
    private String seedBootstrapSqlSource;

    public DataSeeder(PermissionRepository p, RoleRepository r, UserRepository u,
            ProfileRepository pr, PasswordEncoder e, AdminProperties a,
            PlatformTransactionManager transactionManager,
            ResourceLoader resourceLoader,
            ObjectMapper objectMapper,
            DataSource dataSource) { // Inject TransactionManager
        this.permRepo = p;
        this.roleRepo = r;
        this.userRepo = u;
        this.profileRepo = pr;
        this.encoder = e;
        this.admin = a;
        this.transactionTemplate = new TransactionTemplate(
                Objects.requireNonNull(transactionManager, "TransactionManager cannot be null"));
        this.resourceLoader = Objects.requireNonNull(resourceLoader, "ResourceLoader cannot be null");
        this.objectMapper = Objects.requireNonNull(objectMapper, "ObjectMapper cannot be null");
        this.dataSource = Objects.requireNonNull(dataSource, "DataSource cannot be null");
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!seedEnabled)
            return;

        log.info("🚀 Starting data seeding...");

        // Chạy từng bước độc lập, bước này lỗi không ảnh hưởng bước kia
        seedPermissions();
        seedRolesAndPermissions();
        seedAdminUser();
        seedDemoUsers();
        seedBootstrapSql();

        log.info("✅ Data seeding process finished.");
    }

    private void seedPermissions() {
        // Chạy trong transaction riêng biệt
        transactionTemplate.execute(status -> {
            log.info("Seeding permissions...");
            List<String> permissions = List.of(
                    // Admin - User & Role
                    "VIEW_USERS", "CREATE_USERS", "UPDATE_USERS", "DELETE_USERS", "MANAGE_USERS",
                    "VIEW_ROLES", "CREATE_ROLES", "UPDATE_ROLES", "DELETE_ROLES", "MANAGE_ROLES",
                    // Tutorial
                    "MANAGE_TUTORIALS", "PUBLISH_TUTORIALS", "VIEW_TUTORIALS",
                    "CREATE_TUTORIAL", "UPDATE_TUTORIAL", "DELETE_TUTORIAL", "VIEW_OWN_TUTORIALS",
                    // Content
                    "CREATE_CONTENT", "UPDATE_CONTENT", "DELETE_CONTENT",
                    "CREATE_ASSIGNMENT", "UPDATE_ASSIGNMENT", "DELETE_ASSIGNMENT",
                    // Course
                    "VIEW_COURSES", "CREATE_COURSE", "UPDATE_COURSE", "DELETE_COURSE", "ENROLL_COURSE",
                    // Submissions & Feedback
                    "VIEW_SUBMISSIONS", "EVALUATE_SUBMISSIONS", "SUBMIT_ASSIGNMENT",
                    "VIEW_FEEDBACK", "RESPOND_FEEDBACK", "SUBMIT_FEEDBACK",
                    "RESPOND_HELP_REQUESTS", "REQUEST_HELP", "VIEW_HELP_REQUESTS",
                    // Utils
                    "VIEW_NOTIFICATIONS", "MANAGE_NOTIFICATIONS", "VIEW_TEACHER_STATS", "VIEW_PROGRESS",
                    "VIEW_PROFILE", "UPDATE_PROFILE", "DASHBOARD_VIEW",
                    "PROFILE_READ", "PROFILE_WRITE", "SUPPORT_CREATE",
                    "RESOURCE_READ", "RESOURCE_WRITE", "TESTCASE_READ", "TESTCASE_WRITE",
                    "SCHEDULE_READ", "NOTIF_READ", "NOTIF_WRITE",
                    "USER_MANAGE", "API_MANAGE", "MAINTENANCE_MANAGE", "POLICY_MANAGE");

            for (String name : permissions) {
                if (permRepo.findByName(name).isEmpty()) {
                    Permission permission = Permission.builder()
                            .name(name)
                            .description(name.replace('_', ' ').toLowerCase())
                            .build();
                    permRepo.save(Objects.requireNonNull(permission, "Permission cannot be null"));
                }
            }
            return null;
        });
    }

    private void seedRolesAndPermissions() {
        transactionTemplate.execute(status -> {
            log.info("Seeding roles and permissions...");

            Map<String, List<String>> roleMap = new LinkedHashMap<>();

            roleMap.put("GUEST", List.of("RESOURCE_READ", "SUPPORT_CREATE"));

            roleMap.put("STUDENT", List.of(
                    "DASHBOARD_VIEW", "PROFILE_READ", "PROFILE_WRITE",
                    "VIEW_COURSES", "ENROLL_COURSE", "SUBMIT_ASSIGNMENT",
                    "VIEW_NOTIFICATIONS", "REQUEST_HELP", "RESOURCE_READ",
                    "SCHEDULE_READ", "SUPPORT_CREATE", "VIEW_SUBMISSIONS"));

            roleMap.put("LECTURER", List.of(
                    "DASHBOARD_VIEW", "PROFILE_READ", "PROFILE_WRITE",
                    "VIEW_COURSES", "CREATE_COURSE", "UPDATE_COURSE", "DELETE_COURSE",
                    "VIEW_SUBMISSIONS", "EVALUATE_SUBMISSIONS", "VIEW_HELP_REQUESTS",
                    "RESPOND_FEEDBACK", "VIEW_TEACHER_STATS", "VIEW_NOTIFICATIONS",
                    "RESOURCE_READ", "RESOURCE_WRITE", "SUPPORT_CREATE"));

            roleMap.put("CONTENT_PROVIDER", List.of(
                    "DASHBOARD_VIEW", "PROFILE_READ", "PROFILE_WRITE",
                    "CREATE_TUTORIAL", "UPDATE_TUTORIAL", "DELETE_TUTORIAL", "VIEW_OWN_TUTORIALS",
                    "CREATE_CONTENT", "UPDATE_CONTENT", "CREATE_ASSIGNMENT", "UPDATE_ASSIGNMENT",
                    "RESOURCE_READ", "RESOURCE_WRITE", "VIEW_NOTIFICATIONS", "SUPPORT_CREATE"));

            roleMap.put("PROVIDER", roleMap.get("CONTENT_PROVIDER"));

            // Admin lấy full quyền
            List<String> allPerms = permRepo.findAll().stream().map(Permission::getName).toList();
            roleMap.put("ADMIN", allPerms);

            for (var entry : roleMap.entrySet()) {
                String roleName = entry.getKey();
                List<String> requiredPerms = entry.getValue();

                // 1. Tìm hoặc tạo Role (Chưa lưu DB ngay để tránh lỗi)
                Role role = roleRepo.findByName(roleName)
                        .orElseGet(() -> {
                            Role newRole = Role.builder()
                                    .name(roleName)
                                    .description(roleName)
                                    .permissions(new HashSet<>())
                                    .build();
                            return roleRepo.save(Objects.requireNonNull(newRole, "Role cannot be null"));
                        });

                // 2. Load các Permission Entity cần thiết từ DB
                List<Permission> targetPermissions = permRepo.findAll().stream()
                        .filter(p -> requiredPerms.contains(p.getName()))
                        .toList();

                if (role.getPermissions() == null)
                    role.setPermissions(new HashSet<>());

                // 3. Logic CHECK TRÙNG LẶP quan trọng:
                // Chỉ thêm những permission mà role chưa có (so sánh bằng Tên)
                boolean isModified = false;
                for (Permission p : targetPermissions) {
                    boolean alreadyHas = role.getPermissions().stream()
                            .anyMatch(existingP -> existingP.getName().equals(p.getName()));

                    if (!alreadyHas) {
                        role.getPermissions().add(p);
                        isModified = true;
                    }
                }

                // 4. Chỉ save nếu có sự thay đổi
                if (isModified) {
                    roleRepo.save(role);
                    log.info("Updated permissions for role: {}", roleName);
                }
            }
            return null;
        });
    }

    private void seedAdminUser() {
        transactionTemplate.execute(status -> {
            log.info("Seeding admin user...");
            String email = Optional.ofNullable(admin.getEmail()).orElse("admin@apsas.local");
            String name = Optional.ofNullable(admin.getName()).orElse("APSAS Admin");
            String rawPass = Optional.ofNullable(admin.getPassword()).orElse("Admin@12345");
            if (admin.getPassword() == null || admin.getPassword().isBlank()) {
                log.warn("Admin password is using fallback value. Set app.admin.password in production.");
            }

            Optional<User> existingUser = userRepo.findByEmail(email);

            if (existingUser.isEmpty()) {
                // Tạo mới nếu chưa có
                Role adminRole = roleRepo.findByName("ADMIN")
                        .orElseThrow(() -> new RuntimeException("ADMIN role not found"));

                User u = User.builder()
                        .name(name)
                        .email(email)
                        .password(encoder.encode(rawPass))
                        .status(UserStatus.ACTIVE)
                        .roles(new HashSet<>(Collections.singletonList(adminRole)))
                        .build();

                User savedUser = userRepo.save(Objects.requireNonNull(u, "User cannot be null"));

                // Tạo Profile
                Profile profile = Profile.builder().user(savedUser).build();
                profileRepo.save(Objects.requireNonNull(profile, "Profile cannot be null"));
                log.info("Created Admin User: {}", email);

            } else {
                // Nếu User đã có, kiểm tra xem có Profile chưa
                User user = existingUser.get();
                if (user.getProfile() == null) {
                    Profile profile = Profile.builder().user(user).build();
                    profileRepo.save(Objects.requireNonNull(profile, "Profile cannot be null"));
                    log.info("Fixed missing profile for Admin: {}", email);
                }
            }
            return null;
        });
    }

    private void seedDemoUsers() {
        if (!seedDemoUsersEnabled) {
            log.info("Skip demo user seeding (app.seed.demo-users-enabled=false)");
            return;
        }

        List<DemoUserSeed> demoUsers = loadDemoUsersFromSource();
        if (demoUsers.isEmpty()) {
            log.info("Skip demo user seeding because source has no records: {}", demoUsersSource);
            return;
        }

        transactionTemplate.execute(status -> {
            log.info("Seeding demo users...");

            for (DemoUserSeed demo : demoUsers) {
                User user = userRepo.findByEmail(demo.email)
                        .orElseGet(() -> {
                            Role role = roleRepo.findByName(demo.roleName)
                                    .orElseThrow(() -> new RuntimeException("Role not found: " + demo.roleName));

                            User newUser = User.builder()
                                    .name(demo.name)
                                    .email(demo.email)
                                    .password(encoder.encode(demoUsersPassword))
                                    .status(UserStatus.ACTIVE)
                                    .roles(new HashSet<>(Collections.singletonList(role)))
                                    .build();
                            return userRepo.save(Objects.requireNonNull(newUser, "Demo user cannot be null"));
                        });

                if (user.getProfile() == null) {
                    Profile profile = Profile.builder()
                            .user(user)
                            .avatarUrl(demo.avatarUrl)
                            .bio("Auto seeded user for UI rendering")
                            .address("Hanoi")
                            .phone("0900000000")
                            .dob(LocalDate.of(2000, 1, 1))
                            .build();
                    profileRepo.save(Objects.requireNonNull(profile, "Profile cannot be null"));
                }
            }

            log.info("Demo users seeded with default password from app.seed.demo-users-password");
            return null;
        });
    }

    private List<DemoUserSeed> loadDemoUsersFromSource() {
        try {
            String source = demoUsersSource;
            if (source == null || source.isBlank()) {
                source = "classpath:seed/demo-users.json";
            }
            Resource resource = resourceLoader.getResource(source);
            if (!resource.exists()) {
                log.warn("Demo user source not found: {}", source);
                return List.of();
            }

            List<DemoUserSeed> parsed = objectMapper.readValue(
                    resource.getInputStream(),
                    new TypeReference<List<DemoUserSeed>>() {
                    });

            return parsed.stream()
                    .filter(Objects::nonNull)
                    .filter(item -> item.email != null && !item.email.isBlank())
                    .filter(item -> item.name != null && !item.name.isBlank())
                    .filter(item -> item.roleName != null && !item.roleName.isBlank())
                    .toList();
        } catch (IOException ex) {
            log.error("Cannot read demo users source: {}", demoUsersSource, ex);
            return List.of();
        }
    }

    private void seedBootstrapSql() {
        if (!seedBootstrapSqlEnabled) {
            log.info("Skip SQL bootstrap seeding (app.seed.bootstrap-sql-enabled=false)");
            return;
        }

        String source = Optional.ofNullable(seedBootstrapSqlSource)
                .filter(s -> !s.isBlank())
                .orElse("classpath:seed/bootstrap-data.sql");
        Resource resource = resourceLoader.getResource(source);
        if (!resource.exists()) {
            log.warn("Bootstrap SQL source not found: {}", source);
            return;
        }

        try (Connection connection = dataSource.getConnection()) {
            ScriptUtils.executeSqlScript(connection, new EncodedResource(resource, StandardCharsets.UTF_8));
            log.info("Applied bootstrap SQL data from: {}", source);
        } catch (Exception ex) {
            log.error("Cannot apply bootstrap SQL data from: {}", source, ex);
        }
    }

    private record DemoUserSeed(String email, String name, String roleName, String avatarUrl) {
    }
}