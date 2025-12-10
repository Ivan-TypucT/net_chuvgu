using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using net_chuvgu.Backend.Contexts;
using net_chuvgu.Backend.Models;

namespace net_chuvgu.Backend.Controllers;

public class CartController : ApiControllerBase
{
    private readonly MarketplaceDbContext _context;

    public CartController(MarketplaceDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetCart()
    {
        var userId = GetUserId();
        var cartItems = await _context.CartItems
            .Include(ci => ci.Product)
            .Where(ci => ci.UserId == userId)
            .Select(ci => new
            {
                ci.Id,
                ci.ProductId,
                ci.Quantity,
                ci.AddedAt,
                Product = new
                {
                    ci.Product.Id,
                    ci.Product.Name,
                    ci.Product.Brand,
                    ci.Product.Price,
                    ci.Product.Image,
                    ci.Product.InStock
                }
            })
            .ToListAsync();

        return Success(cartItems);
    }

    [HttpPost("add")]
    [Authorize]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
    {
        var userId = GetUserId();
        
        // Проверяем существование товара
        var product = await _context.Products.FindAsync(request.ProductId);
        if (product == null)
        {
            return NotFound(new { success = false, message = "Товар не найден" });
        }

        var existingItem = await _context.CartItems
            .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == request.ProductId);

        if (existingItem != null)
        {
            existingItem.Quantity += request.Quantity;
        }
        else
        {
            var cartItem = new CartItem
            {
                UserId = userId,
                ProductId = request.ProductId,
                Quantity = request.Quantity,
                AddedAt = DateTime.UtcNow
            };
            _context.CartItems.Add(cartItem);
        }

        await _context.SaveChangesAsync();
        return Success(new { message = "Товар добавлен в корзину" });
    }

    [HttpDelete("remove/{productId}")]
    [Authorize]
    public async Task<IActionResult> RemoveFromCart(int productId)
    {
        var userId = GetUserId();
        var cartItem = await _context.CartItems
            .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == productId);

        if (cartItem != null)
        {
            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();
        }

        return Success(new { message = "Товар удален из корзины" });
    }

    [HttpPut("update/{productId}")]
    [Authorize]
    public async Task<IActionResult> UpdateQuantity(int productId, [FromBody] UpdateQuantityRequest request)
    {
        var userId = GetUserId();
        var cartItem = await _context.CartItems
            .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == productId);

        if (cartItem == null)
        {
            return NotFound(new { success = false, message = "Товар не найден в корзине" });
        }

        if (request.Quantity <= 0)
        {
            _context.CartItems.Remove(cartItem);
        }
        else
        {
            cartItem.Quantity = request.Quantity;
        }

        await _context.SaveChangesAsync();
        return Success(new { message = "Количество обновлено" });
    }

    [HttpPost("sync")]
    [Authorize]
    public async Task<IActionResult> SyncCart([FromBody] SyncCartRequest request)
    {
        var userId = GetUserId();
        
        // Удаляем старую корзину пользователя
        var oldItems = await _context.CartItems
            .Where(ci => ci.UserId == userId)
            .ToListAsync();
            
        _context.CartItems.RemoveRange(oldItems);
        
        // Добавляем новые товары
        foreach (var item in request.Items)
        {
            // Проверяем существование товара
            var product = await _context.Products.FindAsync(item.ProductId);
            if (product == null) continue;
            
            var cartItem = new CartItem
            {
                UserId = userId,
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                AddedAt = DateTime.UtcNow
            };
            _context.CartItems.Add(cartItem);
        }
        
        await _context.SaveChangesAsync();
        return Success(new { message = "Корзина синхронизирована" });
    }

    private int GetUserId()
    {
        return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
    }
}

public class AddToCartRequest
{
    public int ProductId { get; set; }
    public int Quantity { get; set; } = 1;
}

public class UpdateQuantityRequest
{
    public int Quantity { get; set; }
}

public class SyncCartRequest
{
    public List<CartItemDto> Items { get; set; }
}

public class CartItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}