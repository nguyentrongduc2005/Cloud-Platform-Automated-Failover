package com.project.apsas.service.impl;

import com.project.apsas.dto.response.ProfileResponse;
import com.project.apsas.dto.response.UploadResult;
import com.project.apsas.entity.Profile;
import com.project.apsas.entity.User;
import com.project.apsas.exception.AppException;
import com.project.apsas.exception.ErrorCode;
import com.project.apsas.repository.ProfileRepository;
import com.project.apsas.repository.UserRepository;
import com.project.apsas.service.AuthService;
import com.project.apsas.service.CloudinaryService;
import com.project.apsas.service.ProfileAvatarService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProfileAvatarServiceImpl implements ProfileAvatarService {

    AuthService authService;
    UserRepository userRepository;
    ProfileRepository profileRepository;
    CloudinaryService cloudinaryService;
    @NonFinal
    @Value("${cloudinary.option.folder-name}")
    String folder;

    @Override
    public ProfileResponse updateMyAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.VALIDATION_FAILED);
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new AppException(ErrorCode.UNSUPPORTED_MEDIA);
        }

        Long userId;
        try {
            userId = Long.parseLong(authService.currentId());
        } catch (NumberFormatException e) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Profile profile = user.getProfile();
        if (profile == null) {
            profile = new Profile();
            profile.setUser(user);
            user.setProfile(profile);
        }

        String publicId = UUID.randomUUID().toString();
        try {
            UploadResult uploadResult = cloudinaryService.upload(file, folder, publicId);
            profile.setAvatarUrl(uploadResult.getUrl());
        } catch (Exception e) {
            log.error("Avatar upload failed for userId={}", userId, e);
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }

        profileRepository.save(profile);

        return ProfileResponse.builder()
                .avatar(profile.getAvatarUrl())
                .success(true)
                .build();
    }
}
