package com.sadarbazar.controller;

import com.sadarbazar.dto.AuthDTO;
import com.sadarbazar.entity.User;
import com.sadarbazar.entity.enums.Role;
import com.sadarbazar.exception.BusinessException;
import com.sadarbazar.repository.UserRepository;
import com.sadarbazar.security.JwtService;
import com.sadarbazar.security.UserDetailsImpl;
import com.sadarbazar.service.CartService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CartService cartService;

    @PostMapping("/register")
    public ResponseEntity<AuthDTO.AuthResponse> registerUser(
            @Valid @RequestBody AuthDTO.RegisterRequest request, 
            HttpServletRequest httpRequest,
            HttpServletResponse response) {
            
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email is already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .role(Role.CUSTOMER)
                .build();

        user = userRepository.save(user);

        // Auto-login after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        setJwtCookie(response, jwtService.generateToken(userDetails));

        // Merge guest cart if applicable
        UUID guestSessionId = getGuestSessionId(httpRequest);
        if (guestSessionId != null) {
            cartService.mergeGuestCart(user.getId(), guestSessionId);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(toAuthResponse(user));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDTO.AuthResponse> login(
            @Valid @RequestBody AuthDTO.LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        setJwtCookie(response, jwtService.generateToken(userDetails));
        
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();

        // Merge guest cart if applicable
        UUID guestSessionId = getGuestSessionId(httpRequest);
        if (guestSessionId != null) {
            cartService.mergeGuestCart(user.getId(), guestSessionId);
        }

        return ResponseEntity.ok(toAuthResponse(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("auth_token", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set true in production
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/guest-session")
    public ResponseEntity<Void> createGuestSession(
            HttpServletRequest request,
            HttpServletResponse response) {
            
        boolean hasGuestCookie = false;
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if ("guest_session_token".equals(c.getName())) {
                    hasGuestCookie = true;
                    break;
                }
            }
        }

        if (!hasGuestCookie) {
            String guestSessionId = UUID.randomUUID().toString();
            Cookie cookie = new Cookie("guest_session_token", guestSessionId);
            cookie.setHttpOnly(true);
            cookie.setSecure(false); // Set to true in prod
            cookie.setPath("/");
            cookie.setMaxAge(30 * 24 * 60 * 60); // 30 days
            response.addCookie(cookie);
        }

        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/me")
    public ResponseEntity<AuthDTO.AuthResponse> getCurrentUser(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            return ResponseEntity.ok(toAuthResponse(user));
        }
        
        // If not logged in, they are a guest
        AuthDTO.AuthResponse guestResponse = new AuthDTO.AuthResponse();
        guestResponse.setGuest(true);
        return ResponseEntity.ok(guestResponse);
    }

    private void setJwtCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("auth_token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set to true in prod with HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        response.addCookie(cookie);
    }

    private UUID getGuestSessionId(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("guest_session_token".equals(cookie.getName())) {
                    try {
                        return UUID.fromString(cookie.getValue());
                    } catch (IllegalArgumentException e) {
                        return null;
                    }
                }
            }
        }
        return null;
    }

    private AuthDTO.AuthResponse toAuthResponse(User user) {
        return AuthDTO.AuthResponse.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .isGuest(false)
                .build();
    }
}
