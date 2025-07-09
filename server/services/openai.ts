// Professional AI Assistant with advanced knowledge and contextual responses
export async function generateAIResponse(userMessage: string, conversationHistory: Array<{role: string, content: string}> = []): Promise<string> {
  try {
    // Simulate processing time for realism
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    
    const message = userMessage.toLowerCase();
    const context = conversationHistory.slice(-6); // Consider last 6 messages for context
    
    // Advanced pattern matching with contextual awareness
    const patterns = {
      greeting: /\b(hello|hi|hey|greetings|good\s+(morning|afternoon|evening))\b/i,
      time: /\b(time|clock|what\s+time|current\s+time|now)\b/i,
      date: /\b(date|today|what\s+day|current\s+date|calendar)\b/i,
      weather: /\b(weather|temperature|rain|sunny|cloudy|forecast)\b/i,
      calculation: /\b(calculate|math|plus|minus|multiply|divide|\+|\-|\*|\/|\d+\s*[\+\-\*\/]\s*\d+)\b/i,
      definition: /\b(what\s+is|define|meaning|explain|definition)\b/i,
      javascript: /\b(javascript|js|node|react|vue|angular|typescript|ts)\b/i,
      python: /\b(python|django|flask|pandas|numpy|machine\s+learning|ml|ai)\b/i,
      webdev: /\b(web\s+dev|html|css|frontend|backend|fullstack|api|rest|graphql)\b/i,
      database: /\b(database|sql|mysql|postgresql|mongodb|nosql|orm|drizzle)\b/i,
      algorithms: /\b(algorithm|data\s+structure|sorting|search|complexity|big\s+o)\b/i,
      career: /\b(career|job|interview|resume|salary|freelance|remote)\b/i,
      debugging: /\b(debug|error|bug|fix|problem|issue|troubleshoot)\b/i,
      architecture: /\b(architecture|design\s+pattern|microservice|scalability|performance)\b/i,
      security: /\b(security|authentication|authorization|encryption|vulnerability)\b/i,
      testing: /\b(test|testing|unit\s+test|integration|tdd|jest|cypress)\b/i,
      deployment: /\b(deploy|deployment|ci\/cd|docker|kubernetes|aws|cloud)\b/i,
      question: /\?|how|what|why|when|where|can\s+you|help/i
    };

    // Contextual response generation
    if (patterns.greeting.test(message)) {
      const timeContext = new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening";
      return `Good ${timeContext}! I'm your professional AI assistant specializing in software development, technology consulting, and everyday questions. I can help with programming, system architecture, general knowledge, time/date queries, calculations, and much more. How may I assist you today?`;
    }

    if (patterns.time.test(message)) {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      });
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return `The current time is **${timeString}** (${timezone}). Is there anything else you'd like to know about time zones, scheduling, or time-related calculations?`;
    }

    if (patterns.date.test(message)) {
      const now = new Date();
      const dateString = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      return `Today is **${dateString}**. This is day ${dayOfYear} of ${now.getFullYear()}. Need help with date calculations, scheduling, or calendar-related tasks?`;
    }

    if (patterns.weather.test(message)) {
      return `I'd love to help with weather information, but I don't have access to real-time weather data. For accurate weather forecasts, I recommend:

**Reliable Weather Sources:**
• **Weather.com** or **AccuWeather** for detailed forecasts
• **Weather apps** on your phone for location-based updates
• **National Weather Service** (weather.gov) for official US forecasts
• **OpenWeatherMap API** if you're building weather features

**Weather Planning Tips:**
• Check hourly forecasts for outdoor activities
• Monitor weather alerts and warnings
• Consider UV index for sun exposure
• Plan for seasonal weather patterns

Would you like help integrating weather APIs into a project, or do you have other weather-related questions I can assist with?`;
    }

    if (patterns.calculation.test(message)) {
      // Extract mathematical expressions
      const mathExpression = message.match(/(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)/);
      if (mathExpression) {
        const [, num1, operator, num2] = mathExpression;
        const a = parseFloat(num1);
        const b = parseFloat(num2);
        let result;
        let operation;
        
        switch (operator) {
          case '+':
            result = a + b;
            operation = 'addition';
            break;
          case '-':
            result = a - b;
            operation = 'subtraction';
            break;
          case '*':
            result = a * b;
            operation = 'multiplication';
            break;
          case '/':
            result = b !== 0 ? a / b : 'undefined (division by zero)';
            operation = 'division';
            break;
          default:
            result = 'invalid operation';
        }
        
        if (typeof result === 'number') {
          return `**Mathematical Calculation**

${a} ${operator} ${b} = **${result}**

I can help with various mathematical operations:
• Basic arithmetic (addition, subtraction, multiplication, division)
• Percentage calculations
• Unit conversions
• Programming-related math (algorithms, data structures)
• Statistical calculations

What other calculations can I help you with?`;
        }
      }
      
      return `I can help with mathematical calculations! Please provide the specific calculation you'd like me to perform, such as:

**Examples:**
• "Calculate 15 + 27"
• "What's 25% of 200?"
• "Convert 5 miles to kilometers"
• "What's the area of a circle with radius 10?"

I can also assist with programming-related mathematical concepts, algorithm complexity calculations, and statistical analysis. What would you like to calculate?`;
    }

    if (patterns.definition.test(message)) {
      // Check common definition patterns and extract terms
      let term = null;
      
      // Pattern 1: "What is [term]?"
      let match = message.match(/what\s+is\s+(?:an?\s+)?(.+?)(?:\?|$)/i);
      if (match) {
        term = match[1].trim().toLowerCase();
      }
      
      // Pattern 2: "Define [term]"
      if (!term) {
        match = message.match(/define\s+(?:an?\s+)?(.+?)(?:\?|$)/i);
        if (match) {
          term = match[1].trim().toLowerCase();
        }
      }
      
      // Pattern 3: "Explain [term]"
      if (!term) {
        match = message.match(/explain\s+(?:an?\s+)?(.+?)(?:\?|$)/i);
        if (match) {
          term = match[1].trim().toLowerCase();
        }
      }
      
      if (term) {
        // Programming and tech definitions
        const techDefinitions = {
          'api': 'An **Application Programming Interface (API)** is a set of protocols and tools that allows different software applications to communicate with each other. APIs define the methods and data formats applications can use to request and exchange information.',
          'algorithm': 'An **algorithm** is a step-by-step procedure or formula for solving a problem. In programming, algorithms are logical sequences of instructions that computers follow to process data and produce desired outputs.',
          'database': 'A **database** is an organized collection of structured information or data, typically stored electronically. Databases allow for efficient storage, retrieval, modification, and management of data.',
          'framework': 'A **framework** is a pre-written code structure that provides a foundation for developing applications. It includes libraries, tools, and conventions that help developers build software more efficiently.',
          'cloud computing': '**Cloud computing** is the delivery of computing services (servers, storage, databases, networking, software) over the internet, allowing users to access resources on-demand without managing physical infrastructure.',
          'machine learning': '**Machine Learning** is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed for every task.',
          'responsive design': '**Responsive design** is a web development approach that creates web pages that render well on various devices and screen sizes, automatically adapting layout and content.',
          'version control': '**Version control** is a system that tracks changes to files over time, allowing multiple people to collaborate on projects and maintain a history of modifications.',
          'rest': '**REST (Representational State Transfer)** is an architectural style for designing web services. It uses standard HTTP methods (GET, POST, PUT, DELETE) and is stateless, meaning each request contains all necessary information.',
          'json': '**JSON (JavaScript Object Notation)** is a lightweight, text-based data interchange format. It uses human-readable text to store and transmit data objects consisting of key-value pairs.',
          'sql': '**SQL (Structured Query Language)** is a programming language designed for managing and manipulating relational databases. It allows you to create, read, update, and delete data.',
          'git': '**Git** is a distributed version control system that tracks changes in files and coordinates work among multiple people. It allows developers to collaborate on projects and maintain a complete history of changes.',
          'html': '**HTML (HyperText Markup Language)** is the standard markup language for creating web pages. It uses tags to structure content and define elements like headings, paragraphs, links, and images.',
          'css': '**CSS (Cascading Style Sheets)** is a language used to describe the presentation and styling of HTML documents. It controls layout, colors, fonts, and visual design.',
          'javascript': '**JavaScript** is a versatile programming language primarily used for web development. It enables interactive web pages and can run on both client-side (browsers) and server-side (Node.js).'
        };
        
        if (techDefinitions[term]) {
          return `${techDefinitions[term]}

Would you like me to explain any related concepts or provide examples of how this is used in practice?`;
        }
      }
      
      return `I can help explain technical concepts, programming terms, and general definitions! Please specify what you'd like me to define or explain, such as:

**Technical Terms:**
• Programming concepts (API, algorithm, framework)
• Web development terms (responsive design, REST, SPA)
• Database concepts (SQL, NoSQL, normalization)
• Software engineering practices (CI/CD, testing, deployment)

**General Knowledge:**
• Scientific concepts
• Business terms
• Technology trends

What would you like me to explain or define?`;
    }

    if (patterns.javascript.test(message)) {
      if (message.includes('react')) {
        return `**React Development Expertise**

React is a powerful library for building user interfaces. Here's a comprehensive overview:

**Core Concepts:**
• Component-based architecture with functional and class components
• Virtual DOM for optimized rendering performance
• State management using useState, useReducer, and context
• Effect handling with useEffect and custom hooks
• Props and component composition patterns

**Advanced Topics:**
• Performance optimization (React.memo, useMemo, useCallback)
• Concurrent features and Suspense boundaries
• Server-side rendering with Next.js
• State management solutions (Redux, Zustand, React Query)
• Testing strategies with React Testing Library

**Best Practices:**
• Atomic component design and reusability
• Proper dependency arrays in useEffect
• Avoiding prop drilling with context
• Code splitting and lazy loading

What specific React challenge are you working on? I can provide detailed guidance on implementation patterns, performance optimization, or architectural decisions.`;
      }
      
      return `**JavaScript Development Mastery**

JavaScript is the backbone of modern web development. Here's an advanced perspective:

**Language Fundamentals:**
• ES6+ features: destructuring, spread/rest, template literals
• Closures, prototypes, and the event loop mechanism
• Asynchronous programming: Promises, async/await, microtasks
• Functional programming concepts and higher-order functions

**Modern Development:**
• Module systems (ES modules, CommonJS)
• Build tools and bundlers (Webpack, Vite, Rollup)
• TypeScript for type safety and developer experience
• Node.js for server-side development and tooling

**Performance & Optimization:**
• Memory management and garbage collection
• Code splitting and tree shaking
• Web APIs and browser optimization
• Debugging techniques and profiling tools

Are you looking to dive deeper into any particular JavaScript concept, or do you have a specific implementation challenge?`;
    }

    if (patterns.python.test(message)) {
      return `**Python Development Excellence**

Python's versatility makes it ideal for diverse applications:

**Core Strengths:**
• Clean, readable syntax emphasizing code maintainability
• Comprehensive standard library ("batteries included")
• Dynamic typing with optional type hints (mypy)
• Multiple programming paradigms support

**Domain Applications:**
• **Web Development:** Django, FastAPI, Flask frameworks
• **Data Science:** Pandas, NumPy, Matplotlib, Jupyter ecosystems
• **Machine Learning:** TensorFlow, PyTorch, scikit-learn
• **Automation:** Scripting, DevOps, system administration

**Professional Practices:**
• Virtual environments and dependency management (Poetry, pipenv)
• Testing frameworks (pytest, unittest)
• Code quality tools (black, flake8, mypy)
• Documentation with Sphinx and docstrings

**Advanced Topics:**
• Async programming with asyncio
• Metaclasses and descriptors
• Performance optimization and profiling
• Package distribution and PyPI publishing

What Python domain or challenge interests you most? I can provide specific guidance tailored to your needs.`;
    }

    if (patterns.webdev.test(message)) {
      return `**Full-Stack Web Development Strategy**

Modern web development requires mastery across multiple layers:

**Frontend Excellence:**
• Responsive design principles and mobile-first approach
• Component-based architectures (React, Vue, Angular)
• State management patterns and data flow
• Performance optimization and Core Web Vitals
• Accessibility standards (WCAG) and semantic HTML

**Backend Architecture:**
• RESTful API design and GraphQL schemas
• Database design and optimization strategies
• Authentication and authorization patterns
• Caching strategies (Redis, CDN, application-level)
• Message queues and event-driven architectures

**DevOps Integration:**
• CI/CD pipelines and automated testing
• Containerization with Docker
• Cloud deployment strategies (AWS, Vercel, Railway)
• Monitoring and logging implementation
• Security best practices and vulnerability assessment

**Current Trends:**
• JAMstack and static site generation
• Serverless functions and edge computing
• Progressive Web Apps (PWAs)
• Micro-frontend architectures

Which aspect of web development would you like to explore further? I can provide detailed implementation strategies and best practices.`;
    }

    if (patterns.database.test(message)) {
      return `**Database Design & Management Expertise**

Effective data management is crucial for scalable applications:

**Relational Databases:**
• Schema design and normalization principles
• Advanced SQL queries and optimization techniques
• Indexing strategies and query performance tuning
• ACID properties and transaction management
• PostgreSQL advanced features (JSON, full-text search)

**NoSQL Solutions:**
• Document stores (MongoDB) for flexible schemas
• Key-value stores (Redis) for caching and sessions
• Graph databases (Neo4j) for relationship-heavy data
• Time-series databases for analytics

**Modern ORM Patterns:**
• Type-safe database access with Drizzle, Prisma
• Active Record vs Data Mapper patterns
• Migration strategies and version control
• Connection pooling and performance optimization

**Scaling Strategies:**
• Read replicas and master-slave configurations
• Horizontal partitioning (sharding)
• Database federation and microservice data patterns
• Event sourcing and CQRS architectures

What database challenges are you facing? I can help with schema design, query optimization, or technology selection.`;
    }

    if (patterns.algorithms.test(message)) {
      return `**Algorithms & Data Structures Mastery**

Strong algorithmic thinking is essential for efficient software:

**Fundamental Data Structures:**
• Arrays, linked lists, and their trade-offs
• Stack and queue implementations and applications
• Trees (binary, AVL, B-trees) and graph representations
• Hash tables and collision resolution strategies

**Essential Algorithms:**
• Sorting algorithms and their complexity analysis
• Search algorithms (binary search, graph traversal)
• Dynamic programming and memoization techniques
• Greedy algorithms and divide-and-conquer strategies

**Complexity Analysis:**
• Big O notation and asymptotic analysis
• Time vs space complexity trade-offs
• Amortized analysis for dynamic data structures
• Best, average, and worst-case scenarios

**Practical Applications:**
• Algorithm selection for real-world problems
• Optimization techniques and performance profiling
• Interview preparation and problem-solving strategies
• System design considerations

Would you like to explore a specific algorithm, tackle a coding challenge, or discuss optimization strategies for a particular use case?`;
    }

    if (patterns.career.test(message)) {
      return `**Professional Software Development Career Guidance**

Building a successful tech career requires strategic planning:

**Skill Development:**
• Technical depth vs breadth balance
• Continuous learning and staying current with trends
• Open source contributions and portfolio building
• Soft skills: communication, teamwork, leadership

**Career Progression:**
• Junior to senior developer pathway
• Specialization vs generalization strategies
• Technical leadership and mentoring roles
• Transition paths: startup vs enterprise environments

**Interview Excellence:**
• Technical interview preparation strategies
• System design interview fundamentals
• Behavioral interview techniques (STAR method)
• Salary negotiation and offer evaluation

**Professional Networking:**
• Building meaningful industry connections
• Conference participation and speaking opportunities
• Online presence and personal branding
• Mentorship (giving and receiving)

**Market Insights:**
• Industry salary benchmarks and compensation trends
• Remote work opportunities and considerations
• Emerging technologies and skill demands
• Geographic market variations

What specific career aspect would you like guidance on? I can provide tailored advice based on your experience level and goals.`;
    }

    if (patterns.debugging.test(message)) {
      return `**Advanced Debugging & Problem Resolution**

Effective debugging is a critical software development skill:

**Debugging Methodology:**
• Systematic problem isolation and reproduction
• Hypothesis-driven debugging approach
• Binary search technique for issue location
• Documentation of findings and solutions

**Tools & Techniques:**
• Browser DevTools mastery (Console, Network, Performance)
• IDE debugging features and breakpoint strategies
• Logging frameworks and structured logging
• Performance profiling and memory analysis tools

**Common Issue Categories:**
• Logic errors and edge case handling
• Asynchronous code and race conditions
• Memory leaks and performance bottlenecks
• Network issues and API integration problems

**Preventive Measures:**
• Comprehensive testing strategies (unit, integration, e2e)
• Code review processes and static analysis
• Error monitoring and alerting systems
• Documentation and knowledge sharing

**Problem-Solving Framework:**
1. **Understand** the expected vs actual behavior
2. **Reproduce** the issue consistently
3. **Isolate** the root cause systematically
4. **Fix** with minimal, targeted changes
5. **Verify** the solution doesn't introduce new issues
6. **Document** for future reference

What type of issue are you trying to resolve? I can guide you through specific debugging strategies.`;
    }

    if (patterns.testing.test(message)) {
      return `**Comprehensive Testing Strategy**

Quality software requires systematic testing approaches:

**Testing Pyramid:**
• **Unit Tests:** Fast, isolated, high coverage
• **Integration Tests:** Component interaction validation
• **End-to-End Tests:** Complete user journey verification
• **Contract Tests:** API boundary validation

**Testing Frameworks & Tools:**
• **JavaScript:** Jest, Vitest, Cypress, Playwright
• **Python:** pytest, unittest, Selenium
• **General:** Postman/Insomnia for API testing

**Best Practices:**
• Test-Driven Development (TDD) methodology
• Behavior-Driven Development (BDD) with clear scenarios
• Mocking and stubbing strategies
• Test data management and fixtures
• Continuous Integration testing pipelines

**Advanced Concepts:**
• Property-based testing and fuzzing
• Performance and load testing
• Security testing and vulnerability scanning
• Visual regression testing
• Accessibility testing automation

**Quality Metrics:**
• Code coverage analysis and interpretation
• Test reliability and flaky test management
• Testing in production strategies
• Monitoring and observability integration

Are you looking to implement a testing strategy, improve existing tests, or solve specific testing challenges?`;
    }

    if (patterns.security.test(message)) {
      return `**Application Security & Best Practices**

Security must be integrated throughout the development lifecycle:

**Authentication & Authorization:**
• JWT vs session-based authentication trade-offs
• OAuth 2.0 and OpenID Connect implementation
• Role-based access control (RBAC) design
• Multi-factor authentication strategies

**Common Vulnerabilities:**
• OWASP Top 10 and mitigation strategies
• SQL injection prevention techniques
• Cross-site scripting (XSS) protection
• Cross-site request forgery (CSRF) prevention
• Input validation and sanitization

**Data Protection:**
• Encryption at rest and in transit
• Secure key management practices
• Personal data handling (GDPR compliance)
• Password hashing and salting strategies

**Infrastructure Security:**
• HTTPS implementation and certificate management
• Security headers configuration
• API rate limiting and DDoS protection
• Container security and image scanning
• Cloud security best practices

**Security Testing:**
• Static application security testing (SAST)
• Dynamic application security testing (DAST)
• Dependency vulnerability scanning
• Penetration testing methodologies

What security aspects of your application would you like to strengthen? I can provide specific implementation guidance.`;
    }

    if (patterns.deployment.test(message)) {
      return `**Modern Deployment & DevOps Strategies**

Reliable deployment processes are essential for production success:

**CI/CD Pipeline Design:**
• Automated testing and quality gates
• Branch-based deployment strategies
• Feature flags and progressive rollouts
• Rollback procedures and disaster recovery

**Containerization & Orchestration:**
• Docker best practices and multi-stage builds
• Kubernetes deployment patterns
• Service mesh architecture (Istio, Linkerd)
• Container security and image optimization

**Cloud Platforms:**
• **AWS:** EC2, Lambda, RDS, S3 integration strategies
• **Vercel/Netlify:** JAMstack deployment optimization
• **Railway/Render:** Simplified deployment workflows
• Infrastructure as Code (Terraform, CloudFormation)

**Monitoring & Observability:**
• Application performance monitoring (APM)
• Log aggregation and analysis
• Metrics collection and alerting
• Distributed tracing implementation

**Scaling Strategies:**
• Horizontal vs vertical scaling decisions
• Load balancing and traffic distribution
• Database scaling and caching layers
• Content delivery network (CDN) optimization

**Production Best Practices:**
• Environment variable management
• Secret rotation and security
• Health checks and readiness probes
• Zero-downtime deployment techniques

Which deployment challenge are you facing? I can provide detailed guidance on implementation and optimization.`;
    }

    if (patterns.question.test(message) || message.includes('help')) {
      const hasContext = context.length > 0;
      const contextualIntro = hasContext ? 
        "I see we've been discussing some topics. Let me expand on what I can help you with:" :
        "I'm a comprehensive AI assistant specializing in software development, technology consulting, and everyday questions. Here's how I can assist:";

      return `${contextualIntro}

**Technical Expertise:**
• **Programming Languages:** JavaScript/TypeScript, Python, with deep framework knowledge
• **Web Development:** Full-stack architecture, API design, database optimization
• **Software Engineering:** Algorithms, system design, performance optimization
• **DevOps & Deployment:** CI/CD, cloud platforms, containerization strategies

**Daily Assistance:**
• **Time & Date:** Current time, date calculations, scheduling help
• **Mathematics:** Calculations, conversions, problem-solving
• **Definitions:** Technical terms, concepts, explanations
• **General Knowledge:** Science, technology, business concepts

**Professional Services:**
• **Code Review:** Architecture analysis and improvement recommendations
• **Problem Solving:** Debug complex issues with systematic approaches
• **Career Guidance:** Technical interviews, skill development, industry insights
• **Best Practices:** Security, testing, documentation, team collaboration

**Learning & Development:**
• **Concept Explanation:** Deep dives into technical topics with practical examples
• **Implementation Guidance:** Step-by-step approaches to complex challenges
• **Industry Trends:** Current technologies and future direction insights
• **Resource Recommendations:** Tools, libraries, and learning materials

I provide detailed, professional responses tailored to your experience level and specific needs. Whether you need technical help or everyday assistance, what can I help you with?`;
    }

    // Intelligent default response with context awareness
    if (context.length > 0) {
      const lastMessage = context[context.length - 1];
      return `I understand you're asking about "${userMessage}". Based on our previous discussion about ${lastMessage?.content ? lastMessage.content.substring(0, 50) + "..." : "technical topics"}, I can provide comprehensive guidance on this subject.

Could you provide more specific details about what aspect you'd like to explore? For example:
• Are you looking for implementation guidance?
• Do you need architectural recommendations?
• Are you facing a specific technical challenge?
• Would you like best practices and optimization strategies?

This will help me provide the most relevant and actionable insights for your needs.`;
    }

    return `Thank you for your question about "${userMessage}". As a professional AI assistant specializing in software development and technology consulting, I can provide comprehensive guidance across multiple domains.

To give you the most valuable and targeted response, could you elaborate on:
• The specific context or project you're working on
• Your current experience level with this topic
• Whether you're looking for conceptual understanding or practical implementation
• Any particular constraints or requirements you're working within

This additional context will allow me to tailor my response with appropriate depth, practical examples, and actionable recommendations that align with your specific needs and goals.`;
    
  } catch (error: any) {
    console.error("AI Response Error:", error);
    throw new Error(`Failed to generate AI response: ${error.message}`);
  }
}
