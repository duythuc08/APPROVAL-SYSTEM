package com.example.task1.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data // Lombok: sinh getter, setter, toString, equals, hashCode
@NoArgsConstructor // Lombok: sinh constructor không tham số
@AllArgsConstructor // Lombok: sinh constructor có tham số cho tất cả field
@Builder // Lombok: hỗ trợ tạo object theo Builder pattern
@FieldDefaults(level = AccessLevel.PRIVATE) // Lombok: mặc định tất cả field là private
@JsonInclude(JsonInclude.Include.NON_NULL) // Bỏ qua field null khi trả về JSON
public class ApiResponse<T> {
    int code = 1000;
    String message;
    T result; //T thay doi theo tu kieu du lieu
}