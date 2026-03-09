# Task 1 - Approval System (He Thong Phe Duyet)

He thong quan ly yeu cau phe duyet vat tu/san pham noi bo. Nguoi dung tao yeu cau, Approver duyet, Admin quan ly toan bo.

---

## Cau Truc Thu Muc

```
Task 1/
├── be/task1/          # Backend - Spring Boot
└── fe/task1/          # Frontend - Next.js
```

---

## Tech Stack

### Backend
- Java 21
- Spring Boot 4.0.3
- Spring Security + OAuth2 Resource Server (JWT HS512)
- Spring Data JPA + Hibernate
- PostgreSQL (NeonDB cloud)
- Lombok + MapStruct 1.5.5
- Nimbus JOSE JWT (tao va verify token thu cong)

### Frontend
- Next.js 16.1.6 (App Router)
- React 19
- TypeScript 5
- TailwindCSS 4
- shadcn/ui (Button, Table, Dialog, Badge, AlertDialog, DropdownMenu, Form, Popover...)
- Axios (goi API User, Product, Notification)
- Fetch API (goi API Approval)
- React Hook Form + Zod (validation form)
- TanStack React Table 8 (bang du lieu)
- jwt-decode (doc role tu token o client)
- lucide-react (icons)
- @stomp/stompjs + sockjs-client (WebSocket real-time notification)
- sonner (toast notification)
- date-fns (format thoi gian tuong doi)

---

## Chay Du An

### Backend
```bash
cd be/task1
./mvnw spring-boot:run
# Server chay tai: http://localhost:8080/task1
```

### Frontend
```bash
cd fe/task1
npm install
npm run dev
# App chay tai: http://localhost:3000
```

---

## Cau Hinh

### Backend (application.yaml)
```yaml
server:
  port: 8080
  servlet:
    context-path: /task1

spring:
  datasource:
    url: jdbc:postgresql://ep-floral-forest-ai5wnhjb-pooler.c-4.us-east-1.aws.neon.tech/neondb
    username: neondb_owner
    password: npg_ZWbo7pGFQJE3
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update  # Tu dong tao/cap nhat bang

jwt:
  signerKey: "ktWvH+jVekZ1QVSc7imoQ0BmDed+jtf4wRlhq/U+2ctBDgk8kgtuMVe+9xS8Csxv"
```

### Frontend (lib/axios.tsx)
- Base URL: `http://localhost:8080/task1`
- Tu dong gan `Authorization: Bearer <token>` tu localStorage vao moi request

---

## Database - Cac Bang (Entity)

### users
| Field      | Type       | Mo ta                       |
|------------|------------|-----------------------------|
| userId     | UUID (PK)  | Tu sinh UUID                |
| userName   | String     | Ten dang nhap               |
| passWord   | String     | Mat khau (plain text)       |
| email      | String     | Email                       |
| name       | String     | Ho ten that                 |
| department | Department | Phong ban (enum)            |
| roles      | Set<Roles> | ManyToMany voi bang roles (`@BatchSize(size=10)`) |

### roles
| Field    | Type   | Mo ta              |
|----------|--------|--------------------|
| roleId   | int PK | Tu sinh IDENTITY   |
| roleName | String | Ten role           |

### products
| Field              | Type        | Mo ta                        |
|--------------------|-------------|------------------------------|
| productId          | Long PK     | Tu sinh IDENTITY             |
| productName        | String      | Ten san pham                 |
| productDescription | String      | Mo ta                        |
| productQuantity    | Integer     | So luong ton kho             |
| productType        | ProductType | Loai san pham (enum)         |
| owner              | Users       | ManyToOne - Approver so huu  |

### approval_requests
| Field              | Type                      | Mo ta                                                             |
|--------------------|---------------------------|-------------------------------------------------------------------|
| approvalRequestId  | Long PK                   | Tu sinh IDENTITY                                                  |
| title              | String                    | Tieu de yeu cau                                                   |
| approvalDescription| String                    | Mo ta yeu cau                                                     |
| products           | Set<Products>             | Danh sach san pham duoc yeu cau (`@BatchSize(size=10)`)           |
| productQuantities  | Map<Long, Integer>        | So luong tung san pham duoc yeu cau (`@BatchSize(size=10)`)       |
| creatorUser        | Users                     | Nguoi tao yeu cau (ROLE_USER) — EAGER                            |
| currentApprover    | Users                     | Nguoi duyet (ROLE_APPROVER) — EAGER                              |
| approvalStatus     | String                    | PENDING / APPROVED / REJECTED                                     |
| feedback           | String                    | Nhan xet cua approver                                             |
| createdAt          | LocalDateTime             | Thoi diem tao yeu cau (set khi tao)                               |
| updatedAt          | LocalDateTime             | Thoi diem cap nhat (set khi confirm, null neu con PENDING)        |

**DB Indexes tren approval_requests:**
- `idx_ar_status` — tren cot `approvalStatus`
- `idx_ar_creator` — tren cot `creatorUser`
- `idx_ar_approver` — tren cot `currentApprover`
- `idx_ar_created` — tren cot `createdAt`

### notifications
| Field     | Type             | Mo ta                                    |
|-----------|------------------|------------------------------------------|
| id        | Long PK          | Tu sinh IDENTITY                         |
| message   | String           | (unused — legacy field)                  |
| recipient | String           | Username nguoi nhan (hoac admin username) |
| content   | String           | Noi dung thong bao                       |
| type      | NotificationType | Loai thong bao (enum)                    |
| isRead    | boolean          | Trang thai da doc (default false)        |
| createdAt | LocalDateTime    | Thoi diem tao (default now())            |

**Luu y:** Moi thong bao duoc luu rieng cho tung nguoi nhan. Khi co event, he thong tao 1 record cho nguoi nhan chinh (approver/creator) + 1 record rieng cho moi admin. Moi nguoi co `isRead` state doc lap.

### invalidated_tokens
| Field      | Type   | Mo ta                           |
|------------|--------|---------------------------------|
| id         | String | JWT ID (jti) - Dung blacklist   |
| expiryTime | Date   | Thoi gian het han token         |

---

## Enums

```java
enum Role         { USER, ADMIN, APPROVER }
enum Department   { MARKETING, SALES, GENERAL_ADMINISTRATION, PROCUREMENT_FACILITIES,
                    HUMAN_RESOURCE, SECURITY_TEAM, TECHNICAL_TEAM }
enum ProductType  { OFFICE_SUPPLIES, OFFICE_EQUIPMENT, UNIFORM_PPE }
enum ApprovalRequestsStatus { PENDING, APPROVED, REJECTED }
enum NotificationType       { NEW_REQUEST, REQUEST_APPROVED, REQUEST_REJECTED }
```

---

## API Endpoints

Base URL: `http://localhost:8080/task1`

### Auth (/auth) - Public, khong can token

| Method | URL           | Mo ta                        | Body                                  |
|--------|---------------|------------------------------|---------------------------------------|
| POST   | /auth/login   | Dang nhap, tra ve JWT token  | `{ userName, passWord }`              |
| POST   | /auth/logout  | Dang xuat (blacklist token)  | `{ token }`                           |

**Login Response:**
```json
{
  "code": 1000,
  "result": {
    "token": "<JWT_TOKEN>",
    "authenticated": true
  }
}
```

---

### Users (/users) - Can JWT

| Method | URL                          | Role             | Mo ta                        |
|--------|------------------------------|------------------|------------------------------|
| POST   | /users/create                | ADMIN            | Tao nguoi dung moi           |
| GET    | /users/getUsers              | ADMIN            | Lay danh sach tat ca user    |
| GET    | /users/getUserByRole?role=   | ADMIN, USER      | Lay user theo role name      |
| GET    | /users/getMyInfo             | Bat ki (da login)| Lay thong tin ban than       |
| DELETE | /users/deleteUser/{userId}   | ADMIN            | Xoa nguoi dung               |
| PUT    | /users/updateUser/{userId}   | ADMIN            | Cap nhat nguoi dung          |

**UserCreationRequest body:**
```json
{
  "userName": "string",
  "passWord": "string",
  "email": "string",
  "name": "string",
  "department": "MARKETING",
  "roles": ["ADMIN"]
}
```

**UserResponse:**
```json
{
  "userId": "uuid",
  "userName": "string",
  "email": "string",
  "name": "string",
  "department": "MARKETING",
  "roles": [{ "roleId": 1, "roleName": "ADMIN" }]
}
```

---

### Products (/products) - Can JWT

| Method | URL                              | Role     | Mo ta                             |
|--------|----------------------------------|----------|-----------------------------------|
| GET    | /products                        | Bat ki   | Lay tat ca san pham               |
| GET    | /products/department/{ownerName} | Bat ki   | Lay san pham theo userName owner  |
| POST   | /products/create                 | APPROVER | Tao san pham moi (owner = caller) |
| DELETE | /products/delete/{productId}     | APPROVER | Xoa san pham (phai la owner)      |

**ProductRequest body:**
```json
{
  "productName": "string",
  "productDescription": "string",
  "productQuantity": 100,
  "productType": "OFFICE_SUPPLIES"
}
```

**ProductResponse:**
```json
{
  "productId": 1,
  "productName": "string",
  "productDescription": "string",
  "productQuantity": 100,
  "productType": "OFFICE_SUPPLIES",
  "ownerName": "approver_username",
  "department": "TECHNICAL_TEAM"
}
```

---

### Approval Requests (/approval-requests) - Can JWT

| Method | URL                              | Role     | Mo ta                                                          |
|--------|----------------------------------|----------|----------------------------------------------------------------|
| GET    | /approval-requests               | ADMIN    | Lay tat ca yeu cau — `Page<ApprovalResponse>` (filter + page) |
| GET    | /approval-requests/myUser        | USER     | Lay yeu cau toi da tao — `Page<ApprovalResponse>`             |
| GET    | /approval-requests/myApprover    | APPROVER | Lay yeu cau can toi duyet — `Page<ApprovalResponse>`          |
| GET    | /approval-requests/detail/{id}   | Bat ki   | Lay chi tiet mot yeu cau                                       |
| POST   | /approval-requests/create        | USER     | Tao yeu cau moi                                                |
| PUT    | /approval-requests/{id}/confirm  | APPROVER | Duyet hoac tu choi yeu cau                                     |

**Query params cho 3 GET phan trang (dung SpringFilter + Pageable):**
```
?page=0&size=10&filter=title~~'keyword'&sort=createdAt,desc
```
- `filter` — SpringFilter query string, vi du: `title~~'abc' and approvalStatus:'PENDING'`
- `page`, `size` — phan trang (Spring Pageable)
- `sort` — sap xep, vi du `createdAt,desc`

**Page response (result la Spring Page object):**
```json
{
  "code": 1000,
  "result": {
    "content": [ ... ],
    "totalElements": 50,
    "totalPages": 5,
    "number": 0,
    "size": 10
  }
}
```

**ApprovalCreationRequest body:**
```json
{
  "title": "string",
  "approvalDescription": "string",
  "currentApproverId": "uuid_cua_approver",
  "productQuantities": {
    "1": 5,
    "2": 10
  }
}
```

**ApprovalConfirmRequest body:**
```json
{
  "approvalStatus": "APPROVED",
  "feedback": "Da duyet, du hang ton kho"
}
```

**Khi APPROVED:** He thong tu dong tru so luong trong kho cua tung san pham. Neu ton kho khong du se throw exception.

---

### Notifications (/notifications) - Can JWT

| Method | URL                        | Role     | Mo ta                           |
|--------|----------------------------|----------|---------------------------------|
| GET    | /notifications             | Bat ki   | Lay tat ca thong bao cua minh   |
| GET    | /notifications/unread-count| Bat ki   | Dem so thong bao chua doc       |
| PUT    | /notifications/{id}/read   | Bat ki   | Danh dau 1 thong bao da doc    |
| PUT    | /notifications/read-all    | Bat ki   | Danh dau tat ca da doc         |

**Notification Response (trong list):**
```json
{
  "id": 1,
  "recipient": "admin1",
  "content": "You have a new approval request from user1: Yeu cau vat tu",
  "type": "NEW_REQUEST",
  "read": false,
  "createdAt": "2026-03-09T10:30:00"
}
```

**Luu y Jackson serialization:** Entity dung `boolean isRead` voi Lombok `@Data` → getter la `isRead()` → Jackson serialize thanh `"read"` (bo prefix `is`). FE phai dung field name `read`, khong phai `isRead`.

---

### WebSocket - Real-time Notifications

**Endpoint:** `ws://localhost:8080/task1/ws-notification` (SockJS)

**STOMP Connect:** Gui header `Authorization: Bearer <token>`. BE validate token trong `WebSocketConfig` interceptor, set username lam principal.

**Subscribe channels:**
| Channel                        | Ai subscribe | Mo ta                              |
|--------------------------------|--------------|------------------------------------|
| `/topic/admin-notifications`   | ADMIN        | Broadcast moi thong bao (real-time)|
| `/user/queue/notifications`    | Tat ca       | Thong bao ca nhan (theo username)  |

**Luong gui thong bao (NotificationService.send):**
1. Luu notification vao DB cho nguoi nhan chinh (approver hoac creator)
2. Luu rieng 1 record cho moi admin (moi admin co `isRead` state doc lap)
3. Gui real-time qua WebSocket: broadcast `/topic/admin-notifications` + user-specific `/user/queue/notifications`

---

## Luong Bao Mat (Security)

1. User POST `/auth/login` → nhan JWT (HS512, het han sau 1 gio)
2. JWT chua `scope` claim voi gia tri nhu `ROLE_ADMIN`, `ROLE_USER`, `ROLE_APPROVER` (nhieu role ngan cach nhau bang dau phay)
3. Moi request tiep theo phai gui header: `Authorization: Bearer <token>`
4. `SecurityConfig` cau hinh:
   - `/auth/login`, `/auth/logout`, `/ws-notification/**` la public (WebSocket auth xu ly o STOMP level)
   - Con lai yeu cau authenticated
   - Dung `JwtGrantedAuthoritiesConverter` voi `authorityPrefix = ""` va `authoritiesClaimName = "scope"`
5. Phan quyen tai tang Service dung `@PreAuthorize("hasRole('ROLE_ADMIN')")`
6. Logout: token bi blacklist vao bang `invalidated_tokens`
7. `CustomJwtDecoder` (dang comment out) - co the dung de kiem tra blacklist khi decode

---

## Frontend - Cau Truc Trang

### Route va Role

| Route                          | Role     | Noi dung                              |
|--------------------------------|----------|---------------------------------------|
| `/login`                       | Public   | Form dang nhap                        |
| `/dashboard/admin`             | ADMIN    | Trang tong quan admin                 |
| `/dashboard/admin/users`       | ADMIN    | Quan ly nguoi dung (CRUD)             |
| `/dashboard/admin/requests`    | ADMIN    | Xem tat ca yeu cau phe duyet          |
| `/dashboard/admin/workflows`   | ADMIN    | Quan ly quy trinh phe duyet (CRUD)    |
| `/dashboard/approver`          | APPROVER | Danh sach yeu cau can duyet (PENDING) |
| `/dashboard/approver/products` | APPROVER | Quan ly san pham cua ban than         |
| `/dashboard/user`              | USER     | Xem yeu cau phe duyet cua ban than    |

### Bao Ve Route (DashboardLayout)
- `app/dashboard/layout.tsx` doc token tu `localStorage`
- Dung `jwt-decode` giai ma de lay `scope` (role)
- Neu role khong dung voi route → redirect ve `/`
- Neu khong co token → redirect ve `/`

### Login Flow
1. User nhap username/password → POST `/auth/login`
2. Nhan token → luu vao `localStorage` key `"token"`
3. Decode scope tu token → redirect dung dashboard theo role:
   - `ROLE_ADMIN` → `/dashboard/admin`
   - `ROLE_APPROVER` → `/dashboard/approver`
   - `ROLE_USER` → `/dashboard/user`

### Logout Flow
1. Doc token tu `localStorage`
2. Goi `authService.logout(token)` → POST `/auth/logout` de BE blacklist token
3. Xoa `token` va `token_expiry` khoi `localStorage`
4. Redirect ve `/login`
- (Neu goi BE that bai van xoa localStorage va redirect binh thuong)

---

## Frontend - Components Chinh

### Layout Components
- `components/navbar.tsx` - Thanh nav co ten app "APPROVAL SYSTEM", avatar user, dropdown logout, **NotificationBell**
- `components/sidebar.tsx` - `AdminSidebar` (3 muc menu) va `ApproverSidebar` (2 muc menu)
- `app/dashboard/layout.tsx` - Bao ve route, **NotificationProvider** boc toan bo, **WebSocketConnector** ket noi WebSocket + load thong bao cu tu DB khi dang nhap

### Notification Components (`components/notifications/`)
- `NotificationBell.tsx` - Chuong thong bao tren navbar: badge so chua doc, popover danh sach thong bao, click 1 thong bao de doc, nut "Doc tat ca", tag loai (Yeu cau moi/Da duyet/Tu choi), thoi gian tuong doi
- `context/NotificationContext.tsx` - Context quan ly state thong bao: `notifications[]`, `addNotification`, `markOneRead(id)`, `markAllRead`, `loadNotifications` (goi REST API load tu DB)
- `hooks/useWebSocket.tsx` - Hook ket noi STOMP/SockJS, subscribe channels theo role, nhan thong bao real-time va hien toast

### Approval Components (`components/approval/`)
- `approval-table.tsx` - Bang hien thi danh sach yeu cau, dung TanStack React Table; **server-side pagination bat buoc** — khong co globalFilter/columnFilters noi bo
- `approval-toolbar.tsx` - Thanh cong cu tren bang; **tach roi khoi TanStack Table**, nhan `search`, `status`, `onSearchChange`, `onStatusChange` tu props (khong con phu thuoc vao table instance)
- `columns.tsx` - Dinh nghia cot bang; **khong co filterFn** (filter duoc xu ly phia server)
- `approval-row-actions.tsx` - Nut hanh dong tren tung hang
- `modals/detail-modal.tsx` - Modal xem chi tiet yeu cau; **hien thi `createdAt` + `updatedAt`** (an `updatedAt` khi null)
- `modals/review-modal.tsx` - Modal approver duyet/tu choi (nhap feedback)
- `modals/create-request-modal.tsx` - Modal USER tao yeu cau moi

### Workflow Components (`app/dashboard/admin/workflows/`)
- `page.tsx` - Trang quan ly quy trinh phe duyet (ADMIN). CRUD workflow template voi cac buoc duyet.
  - **Loc nguoi da chon**: Khi chon nguoi cu the o 1 buoc, cac buoc khac se khong hien thi nguoi do nua (dung `getSelectedApproverIds` loc ra `availableApprovers`)
  - **Chon ADMIN role**: Khi vai tro buoc duyet la "Quan tri vien" (ADMIN), an dropdown chon nguoi cu the, hien text "Gui truc tiep den quan tri vien". `specificApproverId` tu dong bi xoa.

### Page-level Components
- `app/dashboard/admin/users/create-updateUser.tsx` - Modal tao/sua user (ADMIN)
- `app/dashboard/approver/products/create-product.tsx` - Modal tao san pham (APPROVER)

### UI Components (shadcn - `components/ui/`)
button, card, input, label, table, badge, dialog, alert-dialog, dropdown-menu, select, textarea, checkbox, form, scroll-area, separator, field

---

## Frontend - Service Layer

### lib/axios.tsx
- Axios instance voi `baseURL: http://localhost:8080/task1`
- Request interceptor tu dong them `Authorization: Bearer <token>` tu localStorage

### lib/service/auth-api.tsx
- Ham goi POST `/auth/login`

### lib/service/user-api.tsx (dung Axios)
```
userService.getAllUsers()              → GET /users/getUsers
userService.getAllUsersWithRoles(role) → GET /users/getUserByRole?role=...
userService.getMyInfo()               → GET /users/getMyInfo
userService.createUser(data)          → POST /users/create
userService.updateUser(id, data)      → PUT /users/updateUser/{id}
userService.deleteUserById(id)        → DELETE /users/deleteUser/{id}
```

### lib/service/product-api.tsx (dung Axios)
```
productService.getAllProducts()              → GET /products
productService.getProductsByOwner(username) → GET /products/department/{username}
productService.createProduct(data)          → POST /products/create
productService.deleteProductById(id)        → DELETE /products/delete/{id}
```

### lib/service/notification-api.tsx (dung Axios)
```
notificationService.getMyNotifications()     → GET /notifications
notificationService.getUnreadCount()         → GET /notifications/unread-count
notificationService.markAsRead(id)           → PUT /notifications/{id}/read
notificationService.markAllAsRead()          → PUT /notifications/read-all
```

### lib/service/workflow-api.tsx (dung Axios)
```
workflowService.getAll()          → GET /workflows
workflowService.getById(id)       → GET /workflows/{id}
workflowService.create(data)      → POST /workflows/create
workflowService.update(id, data)  → PUT /workflows/{id}
workflowService.delete(id)        → DELETE /workflows/{id}
```

### lib/service/approval-api.tsx (dung Fetch)
```typescript
// Helper tao SpringFilter query string
buildFilter(search?: string, status?: string): string
// vi du: search="abc", status="PENDING" → "title~~'abc' and approvalStatus:'PENDING'"

// Return type chung
type PagedApprovalResult = {
  content: ApprovalResponse[];
  totalElements: number;
  totalPages: number;
  number: number;   // trang hien tai (0-based)
  size: number;
}

getAllApprovalRequests(page, size, search?, status?)   → GET /approval-requests           [ADMIN]
getPendingApprovalRequests(page, size, search?)        → GET /approval-requests/myApprover [APPROVER]
  // BE tu AND status=PENDING, FE khong truyen status
getMyRequests(page, size, search?, status?)            → GET /approval-requests/myUser     [USER]
confirmApprovalRequest(id, status, feedback)           → PUT /approval-requests/{id}/confirm [APPROVER]
creationApprovalRequest(data)                          → POST /approval-requests/create   [USER]
```

---

## Response Format Chung (ApiResponse)

Moi API tra ve dang:
```json
{
  "code": 1000,
  "message": null,
  "result": { ... }
}
```
- `code: 1000` = thanh cong
- `message` = null neu khong co loi (null fields bi bo qua nho @JsonInclude)
- `result` = du lieu thuc su

---

## Backend Package Structure

```
com.example.task1/
├── Task1Application.java
├── configuration/
│   ├── SecurityConfig.java       # JWT decoder, filter chain, CORS + validateToken/getUsernameFromToken (dung cho WebSocket)
│   ├── CustomJwtDecoder.java     # (dang comment) Custom decoder kiem tra blacklist
│   ├── WebConfig.java            # CORS config
│   └── WebSocketConfig.java      # STOMP/SockJS config, JWT auth interceptor cho WebSocket CONNECT
├── controller/
│   ├── AuthenticationController.java  # /auth/login, /auth/logout
│   ├── UserController.java            # /users/**
│   ├── ProductController.java         # /products/**
│   ├── ApprovalController.java        # /approval-requests/**
│   └── NotificationController.java    # /notifications/** (GET, PUT mark read)
├── service/
│   ├── AuthenticationService.java     # Xac thuc, tao JWT, logout
│   ├── UserService.java               # CRUD user
│   ├── ProductService.java            # CRUD product
│   ├── ApprovalService.java           # Tao/duyet yeu cau (goi NotificationService.send)
│   └── NotificationService.java       # Gui thong bao (luu DB + WebSocket), query, mark read
├── entity/
│   ├── Users.java
│   ├── Roles.java
│   ├── Products.java
│   ├── ApprovalRequests.java
│   ├── InvalidatedToken.java
│   └── Notification.java             # Entity thong bao (recipient, content, type, isRead, createdAt)
├── repository/
│   ├── UserRepository.java
│   ├── RoleRepository.java
│   ├── ProductRepository.java
│   ├── ApprovalRequestRepository.java
│   ├── InvalidatedRepository.java
│   └── NotificationRepository.java   # findByRecipient, countByRecipientAndIsRead
├── mapper/
│   ├── UserMapper.java            # MapStruct
│   └── ProductMapper.java         # MapStruct
├── dto/
│   ├── ApiResponse.java
│   ├── authentication/
│   │   ├── req/AuthenticationRequest.java
│   │   └── res/AuthenticationResponse.java, LogoutRequest.java
│   ├── user/
│   │   ├── req/UserCreationRequest.java, UserUpdateRequest.java
│   │   └── res/UserResponse.java
│   ├── product/
│   │   ├── req/ProductRequest.java
│   │   └── res/ProductResponse.java
│   ├── approvalRequest/
│   │   ├── req/ApprovalCreationRequest.java, ApprovalConfirmRequest.java
│   │   └── res/ApprovalResponse.java, ApprovalConfirmResponse.java
│   └── notification/
│       └── req/NotificationRequest.java   # recipient, content, notificationType
├── enums/
│   ├── Role.java
│   ├── Department.java
│   ├── ProductType.java
│   ├── ApprovalRequestsStatus.java
│   └── NotificationType.java             # NEW_REQUEST, REQUEST_APPROVED, REQUEST_REJECTED
└── exception/
    ├── AppException.java
    ├── ErrorCode.java                     # Them NOTIFICATION_NOT_FOUND(6001), UNAUTHORIZED(7001)
    └── GlobalExceptionHandler.java
```

---

## Luong Nghiep Vu Chinh

### USER tao yeu cau phe duyet
1. USER dang nhap → nhan token
2. Mo modal "Tao yeu cau" → chon san pham (cua approver), nhap so luong, chon approver
3. POST `/approval-requests/create` → yeu cau duoc tao voi status `PENDING`
4. USER co the xem danh sach yeu cau cua minh tai `/dashboard/user`

### APPROVER duyet yeu cau
1. APPROVER thay yeu cau PENDING tai `/dashboard/approver`
2. Mo modal Review → nhap feedback → chon APPROVED hoac REJECTED
3. PUT `/approval-requests/{id}/confirm`
4. Neu APPROVED: he thong tru so luong ton kho tu dong
5. Neu ton kho khong du → throw exception, khong duyet

### ADMIN quan ly he thong
1. Xem tat ca yeu cau tai `/dashboard/admin/requests`
2. CRUD nguoi dung tai `/dashboard/admin/users`
3. Tao user voi cac role: ADMIN, USER, APPROVER, va assign phong ban
4. Nhan thong bao moi event (tao yeu cau, duyet/tu choi) — luu rieng trong DB cho moi admin

### He thong thong bao (Notification)
1. **Khi USER tao yeu cau:** Gui thong bao cho Approver duoc chon + tat ca Admin
2. **Khi APPROVER duyet/tu choi:** Gui thong bao cho User tao yeu cau + tat ca Admin
3. **Real-time:** WebSocket STOMP/SockJS gui ngay lap tuc + hien toast
4. **Khi dang nhap:** Load thong bao cu tu DB, hien toast "Ban co X thong bao moi chua doc"
5. **Doc thong bao:** Click vao 1 thong bao de doc (PUT `/notifications/{id}/read`) hoac "Doc tat ca" (PUT `/notifications/read-all`)
6. **Moi nguoi co `isRead` rieng:** Admin, Approver, User deu co record thong bao rieng trong DB

---

## Chien Luoc Toi Uu Hieu Nang

### Backend
- **EAGER loading** cho `creatorUser` va `currentApprover` tren `ApprovalRequests` — tranh N+1 khi render list
- **`@BatchSize(size=10)`** cho `products` (Set), `productQuantities` (Map), va `Users.roles` — gom nhieu SELECT thanh 1 IN-query thay vi query rieng tung ban ghi
- **DB indexes**: `idx_ar_status`, `idx_ar_creator`, `idx_ar_approver`, `idx_ar_created` — tang toc WHERE/ORDER BY
- Ket qua: giam tu ~31 query xuong con ~5 query moi trang

### Frontend
- **Cache theo key** `[endpoint, page, size, search, status]` — tranh fetch lai khi params khong doi
- **Debounce 400ms** tren o tim kiem — giam so lan goi API khi user dang go
- **Prefetch trang ke** ngay sau khi trang hien tai load xong — giam do tre khi chuyen trang
- **isFetching overlay** — hien spinner de che bang trong khi du lieu moi dang tai, khong xoa data cu

---

## Luu Y Quan Trong

1. **Mat khau plain text**: PassWord luu thang, khong hash. Can them BCrypt neu production.
2. **CustomJwtDecoder** dang duoc comment out - neu bat len, moi request se kiem tra token co trong blacklist khong.
3. **ApprovalController** dung `@GetMapping("/detail/{approvalRequestId}")` nhung tham so la `long` khong co `@PathVariable` → co the bi loi khi goi.
4. Token het han sau **1 gio** (3600 giay).
5. CORS duoc bat tai `SecurityConfig` voi `Customizer.withDefaults()`, cau hinh cu the trong `WebConfig`.
6. **`@Filter` (SpringFilter)** phai duoc dat o tham so Controller (`@Filter Specification<ApprovalRequests> spec`), khong phai tang Service. Neu thieu annotation nay se gay `IllegalStateException` luc runtime.
7. **Specification + collections**: khong dung `JOIN FETCH` voi Pageable (gay `HibernateException: firstResult/maxResults specified with collection fetch`). Thay vao do dung `@BatchSize` de load collections.
8. **APPROVER endpoint** (`/myApprover`): BE da tu AND dieu kien `status = PENDING`, FE khong can truyen `status` vao filter.
9. **Thong bao cu cho Admin**: Cac thong bao tao TRUOC khi sua `NotificationService` khong co record cho admin trong DB. Chi thong bao MOI tu sau khi deploy moi duoc luu cho admin.
10. **WebSocket endpoint**: `/ws-notification/**` la public o HTTP level. Auth duoc xu ly o STOMP CONNECT level qua `WebSocketConfig` interceptor (doc token tu STOMP header, validate, set principal).
11. **Notification `isRead` serialization**: Lombok `@Data` + `boolean isRead` → getter `isRead()` → Jackson serialize thanh `"read"` (bo prefix `is`). FE phai dung `read`, khong phai `isRead`.
12. **Workflow - Loc nguoi da chon**: Khi chon nguoi cu the (`specificApproverId`) o 1 buoc trong quy trinh, cac buoc khac se loc nguoi do khoi dropdown (tranh trung lap nguoi duyet giua cac buoc).
13. **Workflow - Vai tro ADMIN**: Khi chon vai tro "Quan tri vien" (ADMIN) cho 1 buoc, dropdown chon nguoi cu the bi an va `specificApproverId` tu dong xoa. Buoc do gui truc tiep den quan tri vien ma khong can chon nguoi duyet cu the.

---

## Pitfalls Da Gap

| Van de | Nguyen nhan | Giai phap |
|--------|-------------|-----------|
| `IllegalStateException` khi goi filter endpoint | Thieu `@Filter` annotation tren tham so `Specification` o Controller | Them `@Filter` vao dung tham so Controller |
| `HibernateException: firstResult/maxResults` | Dung `JOIN FETCH` voi collections trong Pageable query | Bo `JOIN FETCH`, them `@BatchSize` tren field collection |
| N+1 query khi load danh sach approval | `creatorUser`/`currentApprover` la LAZY | Doi sang EAGER cho 2 field nay |
| APPROVER thay yeu cau sai status | FE truyen them `status` filter vao `/myApprover` | Bo filter status o FE, de BE tu xu ly `AND status=PENDING` |
| FE: Navbar dung `{children}` khong co prop | `NotificationProvider` + `{children}` dat nham trong Navbar | Chuyen `NotificationProvider` sang `layout.tsx`, Navbar chi render `<NotificationBell />` |
| FE: WebSocket khong ket noi | `useWebSocket` hook duoc tao nhung khong bao gio goi | Tao `WebSocketConnector` component trong `layout.tsx` de goi hook |
| FE: WebSocket URL sai | FE goi `/ws-notification` nhung BE co context-path `/task1` | Sua URL thanh `/task1/ws-notification` |
| FE: Admin role check sai | Hook kiem tra `role === 'ADMIN'` nhung JWT scope la `ROLE_ADMIN` | Sua thanh `role === 'ROLE_ADMIN'` |
| FE: JSON field name mismatch | FE dung `isRead`/`NotificationType`, BE serialize thanh `read`/`type` | Sua FE interface dung `read` va `type` |
| Admin khong nhan thong bao | `NotificationService.send()` chi luu record cho approver/creator | Them logic luu rieng 1 record cho moi admin trong `send()` |
| Admin mat thong bao khi refresh | Chi gui broadcast real-time, khong luu vao DB cho admin | Luu notification record rieng cho admin + load tu DB khi dang nhap |
