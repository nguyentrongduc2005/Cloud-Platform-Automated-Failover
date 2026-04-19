package com.project.apsas.controller;

import com.project.apsas.dto.ApiResponse;
import com.project.apsas.dto.response.ProfileResponse;
import com.project.apsas.service.ProfileAvatarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping({ "/me/avatar/upload", "/me/avatar" })
@RequiredArgsConstructor
public class ProfileAvatarController {

    private final ProfileAvatarService profileAvatarService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<ProfileResponse> uploadAvatar(@RequestParam("file") MultipartFile file) {
        ProfileResponse profile = profileAvatarService.updateMyAvatar(file);

        return ApiResponse.<ProfileResponse>builder()
                .code("ok")
                .message("SUCCESS")
                .data(profile)
                .build();
    }
}
