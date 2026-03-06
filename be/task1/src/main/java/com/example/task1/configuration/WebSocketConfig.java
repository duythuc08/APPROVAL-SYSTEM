package com.example.task1.configuration;

import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.ArrayList;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final SecurityConfig securityConfig;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue"); // /topic cho admin, /queue cho user
        config.setApplicationDestinationPrefixes("/app"); // Định nghĩa prefix cho các điểm đến ứng dụng (controller)
        config.setUserDestinationPrefix("/user"); // Định nghĩa prefix cho các điểm đến riêng của người dùng
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-notification")
                .setAllowedOrigins("http://localhost:3000")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public @Nullable Message<?> preSend(Message<?> message, MessageChannel channel) {
                // Truy cập vào header của tin nhắn để kiểm tra nếu đây là một kết nối WebSocket
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                // Kiểm tra nếu đây là một tin nhắn CONNECT
                if(StompCommand.CONNECT.equals(accessor.getCommand())) {

                    String authorizationHeader = accessor.getFirstNativeHeader("Authorization");

                    // Kiểm tra nếu header Authorization tồn tại và bắt đầu bằng "Bearer "
                    if(authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {

                        String token = authorizationHeader.substring(7);
                        // Validate token và lấy thông tin người dùng từ token
                        if(securityConfig.validateToken(token)) {
                        String username = securityConfig.getUsernameFromToken(token);
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken
                                (username, null, new ArrayList<>());
                            accessor.setUser(auth);
                        }
                    }
                }
                return message;
            }
        });
    }
}
