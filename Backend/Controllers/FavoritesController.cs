using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using net_chuvgu.Backend.Contexts;
using net_chuvgu.Backend.Models;
using System.Security.Claims;

namespace net_chuvgu.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FavoritesController : ApiControllerBase
{
    private readonly MarketplaceDbContext _context;

    public FavoritesController(MarketplaceDbContext context)
    {
        _context = context;
    }

    // GET: api/favorites
    [HttpGet]
    public async Task<IActionResult> GetFavorites()
    {
        try
        {
            var userId = GetUserId();
            
            var favorites = await _context.UserFavorites
                .Include(uf => uf.Product)
                .Where(uf => uf.UserId == userId)
                .Select(uf => new
                {
                    uf.Product.Id,
                    uf.Product.Name,
                    uf.Product.Brand,
                    uf.Product.Category,
                    uf.Product.Price,
                    uf.Product.OldPrice,
                    uf.Product.Image,
                    uf.Product.Rating,
                    uf.Product.ReviewsCount,
                    uf.Product.Weight,
                    uf.Product.Description,
                    uf.Product.InStock,
                    uf.Product.StockQuantity,
                    uf.Product.CreatedAt,
                    AddedAt = uf.AddedAt,
                    IsFavorite = true
                })
                .ToListAsync();

            return Success(favorites);
        }
        catch (Exception ex)
        {
            return Error("Ошибка при получении избранного", ex.Message);
        }
    }

    // POST: api/favorites/{productId}
    [HttpPost("{productId}")]
    public async Task<IActionResult> AddToFavorites(int productId)
    {
        try
        {
            var userId = GetUserId();
            
            // Проверяем существование товара
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
            {
                return NotFound(new { success = false, message = "Товар не найден" });
            }

            // Проверяем, не добавлен ли уже в избранное
            var existingFavorite = await _context.UserFavorites
                .FirstOrDefaultAsync(uf => uf.UserId == userId && uf.ProductId == productId);

            if (existingFavorite != null)
            {
                return Success(new { message = "Товар уже в избранном" });
            }

            // Добавляем в избранное
            var favorite = new UserFavorite
            {
                UserId = userId,
                ProductId = productId,
                AddedAt = DateTime.UtcNow
            };

            _context.UserFavorites.Add(favorite);
            await _context.SaveChangesAsync();

            return Success(new 
            { 
                success = true,
                message = "Товар добавлен в избранное",
                favoriteId = favorite.Id,
                addedAt = favorite.AddedAt
            });
        }
        catch (Exception ex)
        {
            return Error("Ошибка при добавлении в избранное", ex.Message);
        }
    }

    // DELETE: api/favorites/{productId}
    [HttpDelete("{productId}")]
    public async Task<IActionResult> RemoveFromFavorites(int productId)
    {
        try
        {
            var userId = GetUserId();
            
            var favorite = await _context.UserFavorites
                .FirstOrDefaultAsync(uf => uf.UserId == userId && uf.ProductId == productId);

            if (favorite == null)
            {
                return NotFound(new { success = false, message = "Товар не найден в избранном" });
            }

            _context.UserFavorites.Remove(favorite);
            await _context.SaveChangesAsync();

            return Success(new { 
                success = true,
                message = "Товар удален из избранного" 
            });
        }
        catch (Exception ex)
        {
            return Error("Ошибка при удалении из избранного", ex.Message);
        }
    }

    // GET: api/favorites/check/{productId}
    [HttpGet("check/{productId}")]
    public async Task<IActionResult> CheckFavorite(int productId)
    {
        try
        {
            var userId = GetUserId();
            
            var isFavorite = await _context.UserFavorites
                .AnyAsync(uf => uf.UserId == userId && uf.ProductId == productId);

            return Success(new { 
                success = true,
                isFavorite, 
                productId 
            });
        }
        catch (Exception ex)
        {
            return Error("Ошибка при проверке избранного", ex.Message);
        }
    }

    // GET: api/favorites/count
    [HttpGet("count")]
    public async Task<IActionResult> GetFavoritesCount()
    {
        try
        {
            var userId = GetUserId();
            
            var count = await _context.UserFavorites
                .Where(uf => uf.UserId == userId)
                .CountAsync();

            return Success(new { 
                success = true,
                count 
            });
        }
        catch (Exception ex)
        {
            return Error("Ошибка при получении количества избранного", ex.Message);
        }
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
        {
            throw new UnauthorizedAccessException("Пользователь не авторизован");
        }
        
        return int.Parse(userIdClaim);
    }
}