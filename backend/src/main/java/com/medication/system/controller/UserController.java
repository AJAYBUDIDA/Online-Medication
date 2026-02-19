package com.medication.system.controller;

import com.medication.system.entity.User;
import com.medication.system.payload.request.ChangePasswordRequest;
import com.medication.system.payload.request.UpdateProfileRequest;
import com.medication.system.payload.response.MessageResponse;
import com.medication.system.repository.UserRepository;
import com.medication.system.service.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/user")
public class UserController {
    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        user.setEmail(request.getEmail());
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Profile updated successfully!"));
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        if (!encoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Current password is incorrect!"));
        }

        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Password changed successfully!"));
    }
}
