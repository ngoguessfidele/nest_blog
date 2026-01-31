# NestJS Blog API

A robust, scalable blog backend API built with NestJS, demonstrating advanced backend development skills including modular architecture, database integration, validation, error handling, and API documentation.

## 🚀 Features

- **Full CRUD Operations**: Complete Create, Read, Update, Delete functionality for posts, categories, and comments
- **Pagination & Filtering**: Efficient data retrieval with pagination, search, and tag-based filtering
- **User Authentication Ready**: Structured for easy integration with JWT or other auth systems
- **Data Validation**: Comprehensive input validation using class-validator
- **Error Handling**: Global exception filters with user-friendly error responses
- **API Documentation**: Auto-generated Swagger documentation
- **Database Integration**: MongoDB with Mongoose ODM for flexible data modeling
- **CORS Support**: Configured for frontend integration
- **Environment Configuration**: Flexible configuration management

## 🛠️ Technology Stack

- **Framework**: NestJS (Node.js framework for scalable server-side applications)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Linting**: ESLint with Prettier

## 📁 Project Structure

```
src/
├── app.module.ts              # Root application module
├── main.ts                    # Application bootstrap
├── common/                    # Shared utilities and interceptors
│   ├── dto/                   # Common DTOs (pagination, etc.)
│   ├── filters/               # Global exception filters
│   └── services/              # Shared services
├── posts/                     # Posts module
│   ├── posts.controller.ts    # REST API endpoints
│   ├── posts.service.ts       # Business logic
│   ├── posts.module.ts        # Module configuration
│   ├── dto/                   # Request/Response DTOs
│   ├── entities/              # Database schemas
│   └── schemas/               # Mongoose schemas
├── categories/                # Categories module (similar structure)
└── comments/                  # Comments module (similar structure)
```

## 🔧 Installation & Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd nest_blog

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and other configs

# Start development server
npm run start:dev
```

## 📚 API Endpoints

### Posts
- `GET /api/posts` - Get all posts (with pagination, search, filtering)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Comments
- `GET /api/comments` - Get all comments
- `POST /api/comments` - Create new comment

## 📖 API Documentation

Access the interactive API documentation at `/api` when the server is running.

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:cov
```

## 🚀 Deployment

This project is configured for easy deployment to platforms like Railway, Heroku, or Vercel. The application uses environment-based configuration for seamless deployment across different environments.

### Environment Variables

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://...
```

## 💡 Key NestJS Concepts Demonstrated

### 1. **Modular Architecture**
- Feature-based modules for better organization
- Dependency injection for loose coupling
- Global modules for shared functionality

### 2. **Data Transfer Objects (DTOs)**
- Input validation with class-validator decorators
- Transformation with class-transformer
- Type safety throughout the application

### 3. **Database Design**
- Mongoose schemas with proper indexing
- Population for relationships
- Schema validation at the database level

### 4. **Error Handling**
- Global exception filters
- Custom error responses
- Proper HTTP status codes

### 5. **API Design**
- RESTful conventions
- Pagination implementation
- Filtering and search capabilities

### 6. **Configuration Management**
- Environment-based configuration
- ConfigService for centralized config access

### 7. **Documentation**
- Auto-generated Swagger docs
- Endpoint descriptions and examples

## 🎯 Skills Showcased

- **Backend Development**: Full-stack API development with modern practices
- **TypeScript**: Strong typing, interfaces, and advanced features
- **Database Design**: NoSQL database modeling and optimization
- **API Design**: RESTful API design with proper HTTP methods and status codes
- **Validation & Security**: Input validation and error handling
- **Testing**: Unit and integration testing
- **Deployment**: Production-ready application deployment
- **Documentation**: API documentation and code maintainability

## 📈 Performance Features

- Database query optimization
- Efficient pagination
- Proper indexing on frequently queried fields
- Caching-ready architecture

## 🔐 Security Considerations

- Input validation and sanitization
- CORS configuration
- Environment variable management
- No sensitive data in codebase

## 🤝 Contributing

This project demonstrates production-ready code quality and best practices suitable for enterprise applications.

---

**Built with ❤️ using NestJS**
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
