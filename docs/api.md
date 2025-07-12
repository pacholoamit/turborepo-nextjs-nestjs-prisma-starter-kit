# API Reference

This document describes the NestJS backend API endpoints available in the Xevon AI application.

## Base URL

```
http://localhost:3001  # Development
```

## Authentication

The API uses Clerk for authentication. Include the Clerk session token in requests:

```typescript
// Frontend example
const token = await getToken();
fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Endpoints

### Health Check

#### GET `/`

Returns a simple health check message.

**Response:**
```json
"Hello World!"
```

**Example:**
```bash
curl http://localhost:3001/
```

### Users

#### GET `/users`

Retrieves all users from the database.

**Response:**
```typescript
{
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: Date;
  updatedAt: Date;
}[]
```

**Example:**
```bash
curl http://localhost:3001/users
```

**Example Response:**
```json
[
  {
    "id": "user_2abc123def456",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "user_2xyz789ghi012",
    "email": "jane@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "createdAt": "2025-01-02T00:00:00.000Z",
    "updatedAt": "2025-01-02T00:00:00.000Z"
  }
]
```

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

**Error Response Format:**
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

## Data Models

### User

```typescript
interface User {
  id: string;           // Clerk user ID
  email: string;        // User email address
  firstName: string | null;  // User's first name
  lastName: string | null;   // User's last name
  createdAt: Date;      // Account creation timestamp
  updatedAt: Date;      // Last update timestamp
}
```

## Database Integration

The API uses the shared `@xevon/database` package which provides:

- **Prisma Client**: Type-safe database access
- **Shared Types**: Consistent data models across applications
- **Connection Management**: Optimized database connections

**Example Usage in Controllers:**
```typescript
import { prisma } from '@xevon/database';

@Injectable()
export class UsersService {
  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
```

## Development

### Adding New Endpoints

1. **Create Module:**
   ```bash
   cd apps/server
   nest generate module feature-name
   nest generate controller feature-name
   nest generate service feature-name
   ```

2. **Implement Controller:**
   ```typescript
   @Controller('feature-name')
   export class FeatureController {
     constructor(private readonly featureService: FeatureService) {}
     
     @Get()
     async findAll() {
       return this.featureService.findAll();
     }
   }
   ```

3. **Implement Service:**
   ```typescript
   @Injectable()
   export class FeatureService {
     async findAll() {
       return prisma.feature.findMany();
     }
   }
   ```

4. **Add to App Module:**
   ```typescript
   @Module({
     imports: [FeatureModule],
     // ...
   })
   export class AppModule {}
   ```

### Testing Endpoints

Use the development server to test endpoints:

```bash
# Start the server
bun dev

# Test in another terminal
curl http://localhost:3001/users
```

### Debugging

Enable debugging in NestJS:

```typescript
// main.ts
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'log', 'debug', 'verbose'],
});
```

## Future Endpoints

The following endpoints are planned for future releases:

- `POST /users` - Create new user
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /connectors` - List user connectors
- `POST /connectors` - Create new connector
- `GET /reports` - List user reports
- `POST /reports` - Generate new report

## Support

For API-related questions:
- Check the NestJS server logs: `bun run services:logs`
- Review the source code in `apps/server/src/`
- Test endpoints using the development environment
- Create an issue for bugs or feature requests

---

*API documentation last updated: June 2025*