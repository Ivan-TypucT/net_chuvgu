using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using net_chuvgu.Backend.Contexts;
using net_chuvgu.Backend.Models;
using System.Security.Claims;

namespace net_chuvgu.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ApiControllerBase
{
    private readonly MarketplaceDbContext _context;

    public ProductsController(MarketplaceDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] ProductFilter filter)
    {
        var query = _context.Products.AsQueryable();

        if (!string.IsNullOrEmpty(filter.Category))
            query = query.Where(p => p.Category == filter.Category);

        if (!string.IsNullOrEmpty(filter.Brand))
            query = query.Where(p => p.Brand == filter.Brand);

        if (!string.IsNullOrEmpty(filter.Search))
            query = query.Where(p => p.Name.Contains(filter.Search) || p.Brand.Contains(filter.Search));

        if (filter.MinPrice.HasValue)
            query = query.Where(p => p.Price >= filter.MinPrice);

        if (filter.MaxPrice.HasValue)
            query = query.Where(p => p.Price <= filter.MaxPrice);

        // Сортировка
        query = filter.SortBy?.ToLower() switch
        {
            "price_asc" => query.OrderBy(p => p.Price),
            "price_desc" => query.OrderByDescending(p => p.Price),
            "rating" => query.OrderByDescending(p => p.Rating),
            "name" => query.OrderBy(p => p.Name),
            _ => query.OrderByDescending(p => p.Id)
        };

        var totalCount = await query.CountAsync();
        var products = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        // Проверяем избранное для авторизованных пользователей
        var userId = GetUserId();
        List<int> favoriteIds = new List<int>();
        
        if (userId.HasValue)
        {
            favoriteIds = await _context.UserFavorites
                .Where(uf => uf.UserId == userId.Value && products.Select(p => p.Id).Contains(uf.ProductId))
                .Select(uf => uf.ProductId)
                .ToListAsync();
        }

        // Формируем результат с флагом избранного
        var result = products.Select(p => new
        {
            p.Id,
            p.Name,
            p.Brand,
            p.Category,
            p.Price,
            p.OldPrice,
            p.Image,
            p.Rating,
            p.ReviewsCount,
            p.Weight,
            p.Description,
            p.InStock,
            p.StockQuantity,
            p.CreatedAt,
            IsFavorite = favoriteIds.Contains(p.Id)
        }).ToList();

        return Success(new { products = result, totalCount });
    }
    
    [HttpPost("Products")]
    public async Task<IActionResult> GetProductsPost([FromBody] ProductFilter filter)
    {
        var query = _context.Products.AsQueryable();

        if (!string.IsNullOrEmpty(filter.Category))
            query = query.Where(p => p.Category.ToLower() == filter.Category.ToLower());

        if (!string.IsNullOrEmpty(filter.Brand))
            query = query.Where(p => p.Brand.ToLower() == filter.Brand.ToLower());

        if (!string.IsNullOrEmpty(filter.Search))
            query = query.Where(p => p.Name.ToLower().Contains(filter.Search.ToLower()) || p.Brand.ToLower().Contains(filter.Search.ToLower()));

        if (filter.MinPrice.HasValue)
            query = query.Where(p => p.Price >= filter.MinPrice);

        if (filter.MaxPrice.HasValue)
            query = query.Where(p => p.Price <= filter.MaxPrice);

        // Сортировка
        query = filter.SortBy?.ToLower() switch
        {
            "price_asc" => query.OrderBy(p => p.Price),
            "price_desc" => query.OrderByDescending(p => p.Price),
            "rating" => query.OrderByDescending(p => p.Rating),
            "name" => query.OrderBy(p => p.Name),
            _ => query.OrderByDescending(p => p.Id)
        };

        var totalCount = await query.CountAsync();
        var products = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        // Проверяем избранное для авторизованных пользователей
        var userId = GetUserId();
        List<int> favoriteIds = new List<int>();
        
        if (userId.HasValue)
        {
            favoriteIds = await _context.UserFavorites
                .Where(uf => uf.UserId == userId.Value && products.Select(p => p.Id).Contains(uf.ProductId))
                .Select(uf => uf.ProductId)
                .ToListAsync();
        }

        // Формируем результат с флагом избранного
        var result = products.Select(p => new
        {
            p.Id,
            p.Name,
            p.Brand,
            p.Category,
            p.Price,
            p.OldPrice,
            p.Image,
            p.Rating,
            p.ReviewsCount,
            p.Weight,
            p.Description,
            p.InStock,
            p.StockQuantity,
            p.CreatedAt,
            IsFavorite = favoriteIds.Contains(p.Id)
        }).ToList();

        return Success(new { products = result, totalCount });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
            return NotFound();

        // Проверяем избранное для авторизованных пользователей
        var userId = GetUserId();
        bool isFavorite = false;
        
        if (userId.HasValue)
        {
            isFavorite = await _context.UserFavorites
                .AnyAsync(uf => uf.UserId == userId.Value && uf.ProductId == id);
        }

        var result = new
        {
            product.Id,
            product.Name,
            product.Brand,
            product.Category,
            product.Price,
            product.OldPrice,
            product.Image,
            product.Rating,
            product.ReviewsCount,
            product.Weight,
            product.Description,
            product.InStock,
            product.StockQuantity,
            product.CreatedAt,
            IsFavorite = isFavorite
        };

        return Success(result);
    }

    [HttpGet("changes")]
    public async Task<IActionResult> GetPriceChanges()
    {
        var items = await _context.Products
            .Where(p => p.OldPrice.HasValue && p.OldPrice.Value != p.Price)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        // Проверяем избранное для авторизованных пользователей
        var userId = GetUserId();
        List<int> favoriteIds = new List<int>();
        
        if (userId.HasValue)
        {
            favoriteIds = await _context.UserFavorites
                .Where(uf => uf.UserId == userId.Value && items.Select(p => p.Id).Contains(uf.ProductId))
                .Select(uf => uf.ProductId)
                .ToListAsync();
        }

        var result = items.Select(p => new
        {
            p.Id,
            p.Name,
            p.Brand,
            p.Category,
            p.Price,
            p.OldPrice,
            p.Image,
            p.Rating,
            p.ReviewsCount,
            p.Weight,
            p.Description,
            p.InStock,
            p.StockQuantity,
            p.CreatedAt,
            IsFavorite = favoriteIds.Contains(p.Id)
        }).ToList();

        return Success(new { items = result, totalCount = items.Count });
    }

    // CRUD (только для админов)
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] Product product)
    {
        product.CreatedAt = DateTime.UtcNow;
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        
        var result = new
        {
            product.Id,
            product.Name,
            product.Brand,
            product.Category,
            product.Price,
            product.OldPrice,
            product.Image,
            product.Rating,
            product.ReviewsCount,
            product.Weight,
            product.Description,
            product.InStock,
            product.StockQuantity,
            product.CreatedAt,
            IsFavorite = false
        };
        
        return Success(result);
    }

    

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] Product update)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();

        product.Name = update.Name;
        product.Brand = update.Brand;
        product.Category = update.Category;
        product.Price = update.Price;
        product.OldPrice = update.OldPrice;
        product.Image = update.Image;
        product.Rating = update.Rating;
        product.ReviewsCount = update.ReviewsCount;
        product.Weight = update.Weight;
        product.Description = update.Description;
        product.InStock = update.InStock;
        product.StockQuantity = update.StockQuantity;

        await _context.SaveChangesAsync();
        
        // Проверяем избранное
        var userId = GetUserId();
        bool isFavorite = false;
        
        if (userId.HasValue)
        {
            isFavorite = await _context.UserFavorites
                .AnyAsync(uf => uf.UserId == userId.Value && uf.ProductId == id);
        }

        var result = new
        {
            product.Id,
            product.Name,
            product.Brand,
            product.Category,
            product.Price,
            product.OldPrice,
            product.Image,
            product.Rating,
            product.ReviewsCount,
            product.Weight,
            product.Description,
            product.InStock,
            product.StockQuantity,
            product.CreatedAt,
            IsFavorite = isFavorite
        };
        
        return Success(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();
        
        // Удаляем также из избранного всех пользователей
        var favorites = await _context.UserFavorites
            .Where(uf => uf.ProductId == id)
            .ToListAsync();
            
        _context.UserFavorites.RemoveRange(favorites);
        _context.Products.Remove(product);
        
        await _context.SaveChangesAsync();
        
        return Success(new { message = "Товар удален" });
    }

    private int? GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
        {
            return null;
        }
        
        return int.Parse(userIdClaim);
    }
}

public class ProductFilter
{
    public string? Category { get; set; } 
    public string? Brand { get; set; } 
    public string? Search { get; set; } 
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? SortBy { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}