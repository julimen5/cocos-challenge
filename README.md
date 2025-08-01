# Trading API - Cocos Challenge

A robust trading API built with **Bun**, **Fastify**, **Prisma**, and **PostgreSQL** using Clean Architecture principles.

## 🚀 **Quick Start**

### **Prerequisites**
- [Bun](https://bun.sh/) (latest version)
- PostgreSQL database
- Git

### **Installation**

1. **Clone the repository**
```bash
git clone <repository-url>
cd trading-api
```

2. **Install dependencies**
```bash
bun install
```

3. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Database setup**
```bash
bun db:generate
bun db:migrate
```

5. **Start development server**
```bash
bun dev
```

The API will be available at: `http://localhost:3000`  
API Documentation: `http://localhost:3000/docs`

## 📚 **API Endpoints**

### **Portfolio**
- `GET /api/portfolio/:userId` - Get user portfolio with positions and returns

### **Instruments**
- `GET /api/instruments/search?q=ticker` - Search instruments by ticker or name

### **Orders**
- `POST /api/orders` - Place a new order (BUY/SELL/CASH_IN/CASH_OUT)
- `PATCH /api/orders/:orderId/cancel` - Cancel a pending order

## 🏗️ **Architecture**

This project follows **Clean Architecture** principles with a **Use Cases** pattern:

```
src/
├── lib/                    # Infrastructure (DB, logging, validation)
├── modules/               # Business modules
│   ├── portfolio/        # Portfolio management
│   │   ├── use-cases/   # Business logic
│   │   ├── routes.ts    # HTTP endpoints
│   │   └── schemas.ts   # Validation schemas
│   ├── instruments/     # Instrument search
│   ├── orders/         # Order management
│   └── shared/         # Shared types and utilities
├── middleware/          # HTTP middleware
├── app.ts              # Fastify app configuration
└── server.ts           # Server entry point
```

### **Key Design Decisions**

- **Use Cases Pattern**: Each business operation is isolated in its own use case
- **Type Safety**: Full TypeScript coverage with Prisma-generated types
- **Validation**: Zod schemas for request/response validation
- **Testing**: Bun's native test runner with isolated test database
- **Documentation**: Auto-generated Swagger/OpenAPI docs

## 🗄️ **Database Schema**

The API uses PostgreSQL with the following main entities:

- **Users**: User accounts with portfolio data
- **Instruments**: Tradeable assets (stocks, currencies, crypto)
- **Orders**: Buy/sell orders with different types and statuses
- **MarketData**: Historical and current price data

### **Order Types & States**

**Order Types:**
- `MARKET`: Execute immediately at current price
- `LIMIT`: Execute when price reaches specified level

**Order States:**
- `NEW`: Pending execution (limit orders)
- `FILLED`: Successfully executed
- `REJECTED`: Rejected due to insufficient funds/shares
- `CANCELLED`: Cancelled by user

**Order Sides:**
- `BUY`: Purchase shares
- `SELL`: Sell shares  
- `CASH_IN`: Deposit cash
- `CASH_OUT`: Withdraw cash

## 🧪 **Testing**

Run tests with Bun's native test runner:

```bash
# Run all tests
bun test

# Run with watch mode
bun test:watch

# Run specific test file
bun test tests/orders/place-order.test.ts
```

## 📝 **Development Scripts**

```bash
# Development
bun dev              # Start with hot reload
bun build            # Build for production
bun start            # Start production server

# Database
bun db:generate      # Generate Prisma client
bun db:migrate       # Run database migrations
bun db:studio        # Open Prisma Studio

# Testing
bun test             # Run tests
bun test:watch       # Run tests in watch mode
```

## 🚀 **Production Deployment**

1. **Build the application**
```bash
bun build
```

2. **Set production environment variables**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
PORT=3000
```

3. **Run database migrations**
```bash
bun db:migrate
```

4. **Start the server**
```bash
bun start
```

## 🔧 **Configuration**

### **Environment Variables**

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Server port | 3000 |
| `HOST` | Server host | 0.0.0.0 |
| `NODE_ENV` | Environment | development |
| `LOG_LEVEL` | Logging level | info |
| `CORS_ORIGIN` | CORS origin | * |

## 📋 **TODO / Implementation Status**

### **✅ Completed**
- [x] Project scaffolding and architecture
- [x] Database schema and migrations
- [x] Basic endpoint structure
- [x] Type definitions
- [x] Test setup

### **🚧 In Progress**
- [ ] Portfolio calculation logic
- [ ] Order placement and validation
- [ ] Market data integration
- [ ] Position calculations

### **📝 Pending**
- [ ] Error handling improvements
- [ ] Rate limiting
- [ ] API authentication
- [ ] Performance optimizations
- [ ] Advanced order types

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 🛠️ **Built With**

- **[Bun](https://bun.sh/)** - Fast JavaScript runtime and package manager
- **[Fastify](https://www.fastify.io/)** - High-performance web framework
- **[Prisma](https://www.prisma.io/)** - Type-safe database client
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation
- **[Winston](https://github.com/winstonjs/winston)** - Logging library
- **PostgreSQL** - Relational database

---

## 📄 **License**

This project is part of the Cocos Trading Challenge. 