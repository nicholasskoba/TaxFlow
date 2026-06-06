import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Bank Tax Accounting API",
      version: "1.0.0",
      description:
        "API for income accounting, automatic tax calculation, reports and dashboard analytics. Tax rules are reference rules for demonstrating calculation logic; fixed and simplified progressive rules are supported. Annual accumulation, deductions and individual exemptions can be added later."
    },
    servers: [
      {
        url: "http://localhost:3001/api",
        description: "Local development API"
      }
    ],
    tags: [
      { name: "Health" },
      { name: "Auth" },
      { name: "Users" },
      { name: "Income Categories" },
      { name: "Incomes" },
      { name: "Tax Rules" },
      { name: "Tax Calculations" },
      { name: "Reports" },
      { name: "Dashboard" },
      { name: "Audit Logs" }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
          description:
            "JWT is stored in the httpOnly cookie named token. Protected endpoints require this cookie."
        }
      },
      schemas: {
        ApiError: {
          type: "object",
          properties: {
            status: { type: "string", example: "error" },
            message: { type: "string", example: "Unauthorized" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  path: { type: "string", example: "email" },
                  message: { type: "string", example: "Invalid email" }
                }
              }
            }
          }
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            fullName: { type: "string" },
            role: { type: "string", enum: ["USER", "ADMIN"] },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        AuthRegisterRequest: {
          type: "object",
          required: ["email", "password", "fullName"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            fullName: { type: "string", minLength: 2 }
          }
        },
        AuthLoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" }
          }
        },
        IncomeCategory: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            description: { type: "string", nullable: true },
            incomeType: {
              type: "string",
              enum: [
                "SALARY",
                "FREELANCE",
                "INVESTMENT",
                "RENT",
                "DIVIDENDS",
                "PRIVATE_PRACTICE",
                "ROYALTY",
                "SALE_PROPERTY",
                "OTHER"
              ]
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        Income: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            categoryId: { type: "string", format: "uuid" },
            amount: { type: "string", example: "250000.00" },
            currency: {
              type: "string",
              enum: ["KZT"],
              example: "KZT",
              description: "Technical field. All financial amounts are stored and calculated in KZT."
            },
            receivedAt: { type: "string", format: "date-time" },
            description: { type: "string", nullable: true },
            category: { $ref: "#/components/schemas/IncomeCategory" }
          }
        },
        CreateIncomeRequest: {
          type: "object",
          required: ["categoryId", "amount", "receivedAt"],
          properties: {
            categoryId: { type: "string", format: "uuid" },
            amount: { type: "string", example: "250000.00", description: "Amount in KZT" },
            receivedAt: { type: "string", format: "date", example: "2026-05-20" },
            description: { type: "string", nullable: true }
          }
        },
        UpdateIncomeRequest: {
          type: "object",
          properties: {
            categoryId: { type: "string", format: "uuid" },
            amount: { type: "string", example: "250000.00", description: "Amount in KZT" },
            receivedAt: { type: "string", format: "date", example: "2026-05-20" },
            description: { type: "string", nullable: true }
          }
        },
        TaxRule: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            rate: { type: "string", example: "10.00" },
            ruleType: { type: "string", enum: ["FIXED", "PROGRESSIVE"] },
            threshold: { type: "string", nullable: true, example: "36762500.00" },
            extraRate: { type: "string", nullable: true, example: "15.00" },
            incomeType: {
              type: "string",
              enum: [
                "SALARY",
                "FREELANCE",
                "INVESTMENT",
                "RENT",
                "DIVIDENDS",
                "PRIVATE_PRACTICE",
                "ROYALTY",
                "SALE_PROPERTY",
                "OTHER"
              ]
            },
            isCustom: { type: "boolean" },
            userId: { type: "string", format: "uuid", nullable: true },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        TaxCalculation: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            incomeId: { type: "string", format: "uuid" },
            taxRuleId: { type: "string", format: "uuid" },
            incomeAmount: { type: "string", example: "250000.00" },
            taxRate: { type: "string", example: "10.00" },
            taxAmount: { type: "string", example: "25000.00" },
            netAmount: { type: "string", example: "225000.00" },
            calculatedAt: { type: "string", format: "date-time" },
            income: { $ref: "#/components/schemas/Income" },
            taxRule: { $ref: "#/components/schemas/TaxRule" }
          }
        },
        MonthlyReport: {
          type: "object",
          properties: {
            period: { type: "object" },
            totals: { $ref: "#/components/schemas/ReportTotals" },
            byCategory: { type: "array", items: { type: "object" } },
            byIncomeType: { type: "array", items: { type: "object" } },
            latestIncomes: {
              type: "array",
              items: { $ref: "#/components/schemas/Income" }
            },
            latestTaxCalculations: {
              type: "array",
              items: { $ref: "#/components/schemas/TaxCalculation" }
            }
          }
        },
        YearlyReport: {
          type: "object",
          properties: {
            period: { type: "object" },
            totals: { $ref: "#/components/schemas/ReportTotals" },
            byMonth: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  month: { type: "number", example: 5 },
                  incomeAmount: { type: "string" },
                  taxAmount: { type: "string" },
                  netAmount: { type: "string" },
                  incomeCount: { type: "number" },
                  taxCalculationCount: { type: "number" }
                }
              }
            },
            byCategory: { type: "array", items: { type: "object" } },
            byIncomeType: { type: "array", items: { type: "object" } }
          }
        },
        ReportTotals: {
          type: "object",
          properties: {
            incomeAmount: { type: "string", example: "655000.00" },
            taxAmount: { type: "string", example: "65500.00" },
            netAmount: { type: "string", example: "589500.00" },
            incomeCount: { type: "number" },
            taxCalculationCount: { type: "number" }
          }
        },
        DashboardSummary: {
          type: "object",
          properties: {
            income: { type: "object" },
            tax: { type: "object" },
            charts: { type: "object" },
            latest: { type: "object" }
          }
        },
        AuditLog: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid", nullable: true },
            action: { type: "string", example: "UPDATE_USER" },
            entity: { type: "string", example: "User" },
            entityId: { type: "string", format: "uuid", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            user: { $ref: "#/components/schemas/User" }
          }
        }
      }
    },
    paths: {
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Check API health",
          responses: { "200": { description: "API is running" } }
        }
      },
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user and set token cookie",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthRegisterRequest" }
              }
            }
          },
          responses: {
            "201": { description: "Registered" },
            "400": { description: "Validation error" },
            "409": { description: "Email already exists" }
          }
        }
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login and set token cookie",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthLoginRequest" }
              }
            }
          },
          responses: {
            "200": { description: "Logged in" },
            "401": { description: "Invalid credentials" }
          }
        }
      },
      "/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current user",
          security: [{ cookieAuth: [] }],
          responses: { "200": { description: "Current user" }, "401": { description: "Unauthorized" } }
        }
      },
      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Clear token cookie",
          security: [{ cookieAuth: [] }],
          responses: { "200": { description: "Logged out" } }
        }
      },
      "/users": {
        get: {
          tags: ["Users"],
          summary: "List users (ADMIN)",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "role", in: "query", schema: { type: "string", enum: ["USER", "ADMIN"] } }
          ],
          responses: {
            "200": { description: "Users list" },
            "403": { description: "Admin access required" }
          }
        }
      },
      "/users/{id}": {
        get: {
          tags: ["Users"],
          summary: "Get user by id with short statistics (ADMIN)",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "User details" },
            "404": { description: "User not found" }
          }
        },
        patch: {
          tags: ["Users"],
          summary: "Update user fullName or role (ADMIN)",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    fullName: { type: "string" },
                    role: { type: "string", enum: ["USER", "ADMIN"] }
                  }
                }
              }
            }
          },
          responses: {
            "200": { description: "User updated" },
            "400": { description: "Cannot demote the last admin user" }
          }
        }
      },
      "/income-categories": {
        get: {
          tags: ["Income Categories"],
          summary: "List income categories",
          security: [{ cookieAuth: [] }],
          responses: { "200": { description: "Categories list" } }
        },
        post: {
          tags: ["Income Categories"],
          summary: "Create income category managed by admin (ADMIN)",
          security: [{ cookieAuth: [] }],
          responses: { "201": { description: "Created" }, "403": { description: "Admin access required" } }
        }
      },
      "/income-categories/{id}": {
        patch: {
          tags: ["Income Categories"],
          summary: "Update income category managed by admin (ADMIN)",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Updated" } }
        },
        delete: {
          tags: ["Income Categories"],
          summary: "Delete income category managed by admin (ADMIN)",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Deleted" } }
        }
      },
      "/incomes": {
        get: {
          tags: ["Incomes"],
          summary: "List incomes with filters",
          security: [{ cookieAuth: [] }],
          responses: { "200": { description: "Incomes list" } }
        },
        post: {
          tags: ["Incomes"],
          summary: "Create income",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateIncomeRequest" }
              }
            }
          },
          responses: { "201": { description: "Created" } }
        }
      },
      "/incomes/summary": {
        get: {
          tags: ["Incomes"],
          summary: "Get income summary",
          security: [{ cookieAuth: [] }],
          responses: { "200": { description: "Income summary" } }
        }
      },
      "/incomes/{id}": {
        get: {
          tags: ["Incomes"],
          summary: "Get income by id",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Income" } }
        },
        patch: {
          tags: ["Incomes"],
          summary: "Update income",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateIncomeRequest" }
              }
            }
          },
          responses: { "200": { description: "Updated" } }
        },
        delete: {
          tags: ["Incomes"],
          summary: "Delete income",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Deleted" } }
        }
      },
      "/tax-rules": {
        get: {
          tags: ["Tax Rules"],
          summary: "List tax rules",
          security: [{ cookieAuth: [] }],
          responses: { "200": { description: "Tax rules list" } }
        },
        post: {
          tags: ["Tax Rules"],
          summary: "Create tax rule (ADMIN)",
          security: [{ cookieAuth: [] }],
          responses: { "201": { description: "Created" } }
        }
      },
      "/tax-rules/{id}": {
        get: {
          tags: ["Tax Rules"],
          summary: "Get tax rule by id",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Tax rule" } }
        },
        patch: {
          tags: ["Tax Rules"],
          summary: "Update tax rule (ADMIN)",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Updated" } }
        },
        delete: {
          tags: ["Tax Rules"],
          summary: "Delete or deactivate tax rule (ADMIN)",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Deleted or deactivated" } }
        }
      },
      "/my-tax-rules": {
        get: {
          tags: ["Tax Rules"],
          summary: "List current user's custom tax rules",
          security: [{ cookieAuth: [] }],
          responses: { "200": { description: "Custom tax rules list" } }
        },
        post: {
          tags: ["Tax Rules"],
          summary: "Create current user's custom tax rule",
          security: [{ cookieAuth: [] }],
          responses: { "201": { description: "Created" } }
        }
      },
      "/my-tax-rules/{id}": {
        patch: {
          tags: ["Tax Rules"],
          summary: "Update current user's custom tax rule",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Updated" }, "404": { description: "Rule not found" } }
        },
        delete: {
          tags: ["Tax Rules"],
          summary: "Delete or deactivate current user's custom tax rule",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Deleted or deactivated" } }
        }
      },
      "/tax-calculations/calculate-auto": {
        post: {
          tags: ["Tax Calculations"],
          summary: "Automatically calculate tax by income category type",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["incomeId"],
                  properties: {
                    incomeId: { type: "string", format: "uuid" }
                  }
                }
              }
            }
          },
          responses: { "201": { description: "Calculated" } }
        }
      },
      "/tax-calculations/calculate": {
        post: {
          tags: ["Tax Calculations"],
          summary: "Manually calculate tax by selected income and tax rule",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["incomeId", "taxRuleId"],
                  properties: {
                    incomeId: { type: "string", format: "uuid" },
                    taxRuleId: { type: "string", format: "uuid" }
                  }
                }
              }
            }
          },
          responses: {
            "201": { description: "Calculated" },
            "400": { description: "Tax rule does not match income type" },
            "403": { description: "Access denied" }
          }
        }
      },
      "/tax-calculations": {
        get: {
          tags: ["Tax Calculations"],
          summary: "List tax calculations",
          security: [{ cookieAuth: [] }],
          responses: { "200": { description: "Tax calculation history" } }
        }
      },
      "/tax-calculations/summary": {
        get: {
          tags: ["Tax Calculations"],
          summary: "Get tax calculation summary",
          security: [{ cookieAuth: [] }],
          responses: { "200": { description: "Tax summary" } }
        }
      },
      "/tax-calculations/{id}": {
        get: {
          tags: ["Tax Calculations"],
          summary: "Get tax calculation by id",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: {
            "200": { description: "Tax calculation" },
            "403": { description: "Access denied" },
            "404": { description: "Tax calculation not found" }
          }
        },
        delete: {
          tags: ["Tax Calculations"],
          summary: "Delete tax calculation",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: {
            "200": { description: "Deleted" },
            "403": { description: "Access denied" },
            "404": { description: "Tax calculation not found" }
          }
        }
      },
      "/reports/monthly": {
        get: {
          tags: ["Reports"],
          summary: "Get monthly report",
          security: [{ cookieAuth: [] }],
          responses: { "200": { description: "Monthly report" } }
        }
      },
      "/reports/monthly/export": {
        get: {
          tags: ["Reports"],
          summary: "Export monthly report as CSV",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "year", in: "query", required: true, schema: { type: "number", example: 2026 } },
            { name: "month", in: "query", required: true, schema: { type: "number", minimum: 1, maximum: 12, example: 5 } }
          ],
          responses: {
            "200": {
              description: "CSV file",
              content: {
                "text/csv": {
                  schema: { type: "string", format: "binary" }
                }
              }
            }
          }
        }
      },
      "/reports/yearly": {
        get: {
          tags: ["Reports"],
          summary: "Get yearly report",
          security: [{ cookieAuth: [] }],
          responses: { "200": { description: "Yearly report" } }
        }
      },
      "/reports/yearly/export": {
        get: {
          tags: ["Reports"],
          summary: "Export yearly report as CSV",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "year", in: "query", required: true, schema: { type: "number", example: 2026 } }
          ],
          responses: {
            "200": {
              description: "CSV file",
              content: {
                "text/csv": {
                  schema: { type: "string", format: "binary" }
                }
              }
            }
          }
        }
      },
      "/reports/period": {
        get: {
          tags: ["Reports"],
          summary: "Get custom period report",
          security: [{ cookieAuth: [] }],
          responses: { "200": { description: "Period report" } }
        }
      },
      "/reports/period/export": {
        get: {
          tags: ["Reports"],
          summary: "Export custom period report as CSV",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "dateFrom", in: "query", required: true, schema: { type: "string", format: "date", example: "2026-05-01" } },
            { name: "dateTo", in: "query", required: true, schema: { type: "string", format: "date", example: "2026-05-31" } }
          ],
          responses: {
            "200": {
              description: "CSV file",
              content: {
                "text/csv": {
                  schema: { type: "string", format: "binary" }
                }
              }
            }
          }
        }
      },
      "/dashboard/summary": {
        get: {
          tags: ["Dashboard"],
          summary: "Get dashboard summary and chart data",
          security: [{ cookieAuth: [] }],
          responses: { "200": { description: "Dashboard summary" } }
        }
      },
      "/audit-logs": {
        get: {
          tags: ["Audit Logs"],
          summary: "List audit log entries (ADMIN)",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "action", in: "query", schema: { type: "string" } },
            { name: "entity", in: "query", schema: { type: "string" } },
            { name: "userId", in: "query", schema: { type: "string" } },
            { name: "dateFrom", in: "query", schema: { type: "string", format: "date" } },
            { name: "dateTo", in: "query", schema: { type: "string", format: "date" } },
            { name: "limit", in: "query", schema: { type: "number", default: 50, maximum: 200 } }
          ],
          responses: {
            "200": { description: "Audit log entries" },
            "403": { description: "Admin access required" }
          }
        }
      },
      "/audit-logs/{id}": {
        get: {
          tags: ["Audit Logs"],
          summary: "Get audit log entry by id (ADMIN)",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "Audit log entry" },
            "404": { description: "Audit log not found" }
          }
        }
      }
    }
  },
  apis: []
});
