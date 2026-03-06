package com.example.task1.service;

import com.example.task1.dto.authentication.req.AuthenticationRequest;
import com.example.task1.dto.authentication.res.AuthenticationResponse;
import com.example.task1.dto.authentication.res.LogoutRequest;
import com.example.task1.entity.InvalidatedToken;
import com.example.task1.entity.Users;
import com.example.task1.mapper.UserMapper;
import com.example.task1.repository.InvalidatedRepository;
import com.example.task1.repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.util.Collection;
import java.util.Date;
import java.util.StringJoiner;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final InvalidatedRepository invalidatedRepository;
    //private final UserMapper userMapper;
    @NonFinal
    @Value("${jwt.signerKey}") //doc bien tu file .yaml
    protected String SIGNER_KEY;

    public AuthenticationResponse authenticate(AuthenticationRequest request){
        var user = userRepository.findByUserName(request.getUserName()).orElseThrow(() -> new RuntimeException("User not found"));
        boolean authenticated =  request.getPassWord().equals(user.getPassWord());
        if (!authenticated) {
            throw new RuntimeException("Invalid credentials");
        }

        var token = generateToken(user);

        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(authenticated)
                .build();
    }

    public void logout(LogoutRequest request) throws ParseException, JOSEException {
        var signToken =verifyToken(request.getToken()); // Kiểm tra token hợp lệ
        var jti = signToken.getJWTClaimsSet().getJWTID(); // Lấy jti từ token
        // Lưu jti vào blacklist (ví dụ: database, cache,...)
        Date expirationTime = signToken.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(jti)
                .expiryTime(expirationTime)
                .build();
        invalidatedRepository.save(invalidatedToken);
    }

    private String generateToken(Users user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        String jti = java.util.UUID.randomUUID().toString(); // Unique identifier for the token
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUserName())
                .jwtID(jti)
                .issuer("duythucdev")
                .issueTime(new Date())
                .expirationTime(new Date(Instant.now().plusSeconds(3600).toEpochMilli())) // Token hết hạn sau 1 giờ
                .claim("scope", buildScope(user)) // Thêm các claim tùy ý
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        try{
            SignedJWT signedJWT = new SignedJWT(header, jwtClaimsSet);
            signedJWT.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return signedJWT.serialize();
        } catch (Exception e){
            log.error("can not create token", e);
            throw new RuntimeException("Token generation failed");
        }
    }

    private SignedJWT verifyToken(String token) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);
        if (!verified || expirationTime.after(new Date())) {
            throw new RuntimeException("Token is invalid or expired");
        }

        return signedJWT;
    }

    private String buildScope(Users user){
        StringJoiner stringJoiner = new StringJoiner(",");

        if(!CollectionUtils.isEmpty(user.getRoles())){
            user.getRoles().forEach(role -> {
                stringJoiner.add("ROLE_" + role.getRoleName());
            });
        }
        return stringJoiner.toString();
    }
}
