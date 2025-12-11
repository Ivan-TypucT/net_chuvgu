// Program.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using net_chuvgu.Backend.Contexts;
using net_chuvgu.Backend.Models;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Указываем явно порт 80
builder.WebHost.UseUrls("http://*:80");


// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure SQLite
builder.Services.AddDbContext<MarketplaceDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(
                builder.Configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured"))),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

// Serve SPA static files from Frontend folder
var frontendPath = Path.Combine(app.Environment.ContentRootPath, "Frontend");
app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = new PhysicalFileProvider(frontendPath),
    RequestPath = ""
});
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(frontendPath),
    RequestPath = ""
});

app.MapControllers();

// SPA fallback: любые не-API пути отдаем на index.html
app.Use(async (context, next) =>
{
    await next();
    if (context.Response.StatusCode == 404 && !context.Request.Path.StartsWithSegments("/api") )
    {
        context.Response.StatusCode = 200;
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(Path.Combine(frontendPath, "index.html"));
    }
});

// Initialize database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<MarketplaceDbContext>();
    context.Database.Migrate();
    await SeedData(context);
}

app.Run();

// Seed data method
static async Task SeedData(MarketplaceDbContext context)
{
    if (!context.Categories.Any())
    {
        context.Categories.AddRange(
            new Category { Id = 1, Name = "Стиральные порошки", Icon = "🧺", ProductCount = 24, IsActive = true, DisplayOrder = 1 },
            new Category { Id = 2, Name = "Гели для стирки", Icon = "🧴", ProductCount = 18, IsActive = true, DisplayOrder = 2 },
            new Category { Id = 3, Name = "Кондиционеры для белья", Icon = "👔", ProductCount = 15, IsActive = true, DisplayOrder = 3 },
            new Category { Id = 4, Name = "Отбеливатели", Icon = "⚪", ProductCount = 12, IsActive = true, DisplayOrder = 4 },
            new Category { Id = 5, Name = "Пятновыводители", Icon = "🔍", ProductCount = 8, IsActive = true, DisplayOrder = 5 },
            new Category { Id = 6, Name = "Чистящие средства", Icon = "✨", ProductCount = 22, IsActive = true, DisplayOrder = 6 },
            new Category { Id = 7, Name = "Средства для посуды", Icon = "🍽️", ProductCount = 14, IsActive = true, DisplayOrder = 7 },
            new Category { Id = 8, Name = "Освежители воздуха", Icon = "💨", ProductCount = 9, IsActive = true, DisplayOrder = 8 }
        );
    }

    if (!context.Products.Any())
    {
        context.Products.AddRange(
            new Product
            {
                Id = 1,
                Name = "Стиральный порошок Ariel Автомат Горный родник",
                Brand = "Ariel",
                Category = "Стиральные порошки",
                Price = 450.00m,
                OldPrice = 520.00m,
                Image = "/images/ariel1.jpg",
                Rating = 4.5,
                ReviewsCount = 120,
                Weight = "1.5 кг",
                Description = "Эффективное средство для стирки с ароматом горного родника",
                InStock = true,
                StockQuantity = 50,
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = 2,
                Name = "Гель для стирки Persil Expert Цветные ткани",
                Brand = "Persil",
                Category = "Гели для стирки",
                Price = 380.00m,
                OldPrice = 420.00m,
                Image = "/images/nyan1.jpg",
                Rating = 4.7,
                ReviewsCount = 89,
                Weight = "1.2 л",
                Description = "Концентрированный гель для цветных тканей",
                InStock = true,
                StockQuantity = 30,
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = 3,
                Name = "Кондиционер для белья Lenor Апрельская свежесть",
                Brand = "Lenor",
                Category = "Кондиционеры для белья",
                Price = 280.00m,
                OldPrice = 320.00m,
                Image = "/images/nyan1.jpg",
                Rating = 4.3,
                ReviewsCount = 67,
                Weight = "1.0 л",
                Description = "Придает белью мягкость и свежий аромат",
                InStock = true,
                StockQuantity = 40,
                CreatedAt = DateTime.UtcNow
            }
            // Добавьте больше товаров по аналогии
        );
    }

    if (!context.News.Any())
    {
        // Баннер
        context.News.Add(new News 
        { 
            Id = 0,
            Title = "🚀 Скидки до 50% на всю бытовую химию! asdfasfasfasfd" ,
            Content = "Только до конца месяца • Бесплатная доставка от 1500₽ <fpjdsq",
            Image = "",
            PublishedAt = DateTime.UtcNow,
            IsActive = true,
            Author = "Система"
        });
        
        context.News.AddRange(
            new News { Title = "Запуск сайта", Content = "Мы запустили новый сайт!", Image = "/images/nyan1.jpg", PublishedAt = DateTime.UtcNow.AddDays(-7), IsActive = true, Author = "Admin" },
            new News { Title = "Скидки на гели для стирки", Content = "Неделя скидок на популярные товары.", Image = "/images/ariel1.jpg", PublishedAt = DateTime.UtcNow.AddDays(-3), IsActive = true, Author = "Маркетинг" },
            new News { Title = "Новые поступления", Content = "Обновили каталог товаров.", Image = "/images/ariel1.jpg", PublishedAt = DateTime.UtcNow.AddDays(-1), IsActive = true, Author = "Каталог" }
        );
    }

    if (!context.Users.Any())
    {
        var hasher = new PasswordHasher();
        var salt = hasher.GenerateSalt();
        
        var adminUser = new User
        {
            Id = 1,
            FirstName = "Администратор",
            LastName = "Системы",
            Email = "admin@marketplace.ru",
            Phone = "+79999999999",
            CreatedAt = DateTime.UtcNow,
            Avatar = ""
                
        };

        adminUser.AuthorizationData = new AuthorizationData(5)
        {
            PasswordHash = hasher.HashPassword("stalin", salt),
            Salt = salt,
            LastLogin = DateTime.UtcNow,
            IsBanned = false,
        };

        context.Users.Add(adminUser);
    }

    await context.SaveChangesAsync();
}

// PasswordHasher helper class
public class PasswordHasher
{
    public string HashPassword(string password, string salt)
    {
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password + salt);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }

    public string GenerateSalt()
    {
        var bytes = new byte[32];
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes);
    }
}
