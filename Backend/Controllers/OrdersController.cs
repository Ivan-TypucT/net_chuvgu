using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using net_chuvgu.Backend.Contexts;
using net_chuvgu.Backend.Models;

namespace net_chuvgu.Backend.Controllers;

public class OrdersController : ApiControllerBase
{
    private readonly MarketplaceDbContext _context;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(MarketplaceDbContext context, ILogger<OrdersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpPost("create")]
    [Authorize]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            var userId = GetUserId();
            
            // 1. Получаем товары из корзины пользователя
            var cartItems = await _context.CartItems
                .Include(ci => ci.Product)
                .Where(ci => ci.UserId == userId)
                .ToListAsync();

            if (cartItems == null || !cartItems.Any())
            {
                return BadRequest(new { success = false, message = "Корзина пуста" });
            }

            // 2. Проверяем наличие товаров на складе
            var insufficientStockProducts = new List<string>();
            var productsToUpdate = new List<Product>();

            foreach (var cartItem in cartItems)
            {
                var product = cartItem.Product;
                
                if (product == null)
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new { success = false, message = $"Товар {cartItem.ProductId} не найден" });
                }

                if (!product.InStock || product.StockQuantity < cartItem.Quantity)
                {
                    insufficientStockProducts.Add($"{product.Name} (осталось: {product.StockQuantity})");
                }
                else
                {
                    // Уменьшаем количество на складе
                    product.StockQuantity -= cartItem.Quantity;
                    
                    // Если товар закончился, помечаем как отсутствующий
                    if (product.StockQuantity <= 0)
                    {
                        product.InStock = false;
                        product.StockQuantity = 0;
                    }
                    
                    productsToUpdate.Add(product);
                }
            }

            if (insufficientStockProducts.Any())
            {
                await transaction.RollbackAsync();
                return Error("Недостаточно товаров на складе", new { 
                    success = false, 
                    products = insufficientStockProducts 
                });
            }

            // 3. Создаем номер заказа
            var orderNumber = GenerateOrderNumber();
            
            // 4. Рассчитываем общую сумму
            decimal totalAmount = 0;
            var orderItems = new List<OrderItem>();

            foreach (var cartItem in cartItems)
            {
                var product = cartItem.Product;
                var itemTotal = product.Price * cartItem.Quantity;
                
                totalAmount += itemTotal;

                orderItems.Add(new OrderItem
                {
                    ProductId = product.Id,
                    Quantity = cartItem.Quantity,
                    UnitPrice = product.Price,
                    TotalPrice = itemTotal
                });
            }

            // 5. Создаем заказ
            var order = new Order
            {
                UserId = userId,
                OrderNumber = orderNumber,
                OrderDate = DateTime.UtcNow,
                Status = OrderStatus.Pending.ToString(),
                Total = totalAmount,
                ItemsCount = cartItems.Sum(ci => ci.Quantity),
                ShippingAddress = request.ShippingAddress,
                PaymentMethod = request.PaymentMethod,
                OrderItems = orderItems
            };

            _context.Orders.Add(order);

            // 6. Обновляем количество товаров на складе
            foreach (var product in productsToUpdate)
            {
                _context.Products.Attach(product);
                _context.Entry(product).Property(p => p.StockQuantity).IsModified = true;
                _context.Entry(product).Property(p => p.InStock).IsModified = true;
            }

            // 7. Очищаем корзину пользователя
            _context.CartItems.RemoveRange(cartItems);

            // 8. Сохраняем все изменения
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Заказ {OrderNumber} успешно создан для пользователя {UserId}", orderNumber, userId);

            return Success(new 
            { 
                success = true, 
                message = "Заказ успешно оформлен", 
                orderNumber = order.OrderNumber,
                orderId = order.Id,
                total = order.Total
            });
        }
        catch (DbUpdateException dbEx)
        {
            await transaction.RollbackAsync();
            _logger.LogError(dbEx, "Ошибка базы данных при создании заказа");
            return StatusCode(500, new { success = false, message = "Ошибка базы данных при оформлении заказа" });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Ошибка при создании заказа");
            return StatusCode(500, new { success = false, message = "Произошла ошибка при оформлении заказа" });
        }
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetOrders()
    {
        var userId = GetUserId();
        
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.OrderDate)
            .Select(o => new
            {
                o.Id,
                o.OrderNumber,
                o.OrderDate,
                o.Status,
                o.Total,
                o.ItemsCount,
                Items = o.OrderItems.Select(oi => new
                {
                    oi.ProductId,
                    oi.Quantity,
                    oi.UnitPrice,
                    oi.TotalPrice,
                    ProductName = oi.Product.Name,
                    ProductImage = oi.Product.Image
                })
            })
            .ToListAsync();

        return Success(orders);
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetOrderDetails(int id)
    {
        var userId = GetUserId();
        
        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .Where(o => o.Id == id && o.UserId == userId)
            .Select(o => new
            {
                o.Id,
                o.OrderNumber,
                o.OrderDate,
                o.Status,
                o.Total,
                o.ItemsCount,
                o.ShippingAddress,
                o.PaymentMethod,
                Items = o.OrderItems.Select(oi => new
                {
                    oi.ProductId,
                    oi.Quantity,
                    oi.UnitPrice,
                    oi.TotalPrice,
                    Product = new
                    {
                        oi.Product.Id,
                        oi.Product.Name,
                        oi.Product.Brand,
                        oi.Product.Image
                    }
                })
            })
            .FirstOrDefaultAsync();

        if (order == null)
        {
            return NotFound(new { success = false, message = "Заказ не найден" });
        }

        return Success(order);
    }

    [HttpPost("{id}/cancel")]
    [Authorize]
    public async Task<IActionResult> CancelOrder(int id)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            var userId = GetUserId();
            
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

            if (order == null)
            {
                return NotFound(new { success = false, message = "Заказ не найден" });
            }

            // Проверяем можно ли отменить заказ
            if (order.Status != OrderStatus.Pending.ToString() && 
                order.Status != OrderStatus.Processing.ToString())
            {
                return BadRequest(new { 
                    success = false, 
                    message = "Невозможно отменить заказ в текущем статусе" 
                });
            }

            // Возвращаем товары на склад
            foreach (var orderItem in order.OrderItems)
            {
                var product = orderItem.Product;
                if (product != null)
                {
                    product.StockQuantity += orderItem.Quantity;
                    if (product.StockQuantity > 0 && !product.InStock)
                    {
                        product.InStock = true;
                    }
                    
                    _context.Products.Attach(product);
                    _context.Entry(product).Property(p => p.StockQuantity).IsModified = true;
                    _context.Entry(product).Property(p => p.InStock).IsModified = true;
                }
            }

            // Обновляем статус заказа
            order.Status = OrderStatus.Cancelled.ToString();

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Заказ {OrderId} отменен пользователем {UserId}", id, userId);

            return Success(new { success = true, message = "Заказ успешно отменен" });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Ошибка при отмене заказа {OrderId}", id);
            return StatusCode(500, new { success = false, message = "Ошибка при отмене заказа" });
        }
    }

    [HttpGet("stats")]
    [Authorize]
    public async Task<IActionResult> GetOrderStats()
    {
        var userId = GetUserId();
        
        var stats = await _context.Orders
            .Where(o => o.UserId == userId)
            .GroupBy(o => 1)
            .Select(g => new
            {
                TotalOrders = g.Count(),
                TotalSpent = g.Sum(o => o.Total),
                PendingOrders = g.Count(o => o.Status == OrderStatus.Pending.ToString()),
                CompletedOrders = g.Count(o => o.Status == OrderStatus.Delivered.ToString())
            })
            .FirstOrDefaultAsync();

        return Success(stats ?? new { TotalOrders = 0, TotalSpent = 0m, PendingOrders = 0, CompletedOrders = 0 });
    }

    [HttpPost("change-status/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ChangeOrderStatus(int id, [FromBody] ChangeOrderStatusRequest request)
    {
        try
        {
            var order = await _context.Orders.FindAsync(id);
            
            if (order == null)
            {
                return NotFound(new { success = false, message = "Заказ не найден" });
            }

            // Проверяем валидность статуса
            if (!Enum.IsDefined(typeof(OrderStatus), request.Status))
            {
                return BadRequest(new { 
                    success = false, 
                    message = "Некорректный статус заказа",
                    validStatuses = Enum.GetNames(typeof(OrderStatus))
                });
            }

            order.Status = request.Status;

            // Если заказ доставлен или отменен, можно добавить дополнительную логику
            if (request.Status == OrderStatus.Delivered.ToString())
            {
                _logger.LogInformation("Заказ {OrderId} помечен как доставленный", id);
            }

            await _context.SaveChangesAsync();

            return Success(new { success = true, message = "Статус заказа обновлен" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при изменении статуса заказа {OrderId}", id);
            return StatusCode(500, new { success = false, message = "Ошибка при изменении статуса заказа" });
        }
    }

    // Вспомогательные методы
    private string GenerateOrderNumber()
    {
        return $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";
    }

    private int GetUserId()
    {
        return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
    }
}

// DTO классы
public class CreateOrderRequest
{
    public string ShippingAddress { get; set; } = "UserDefaultShippingAddress";
    public string PaymentMethod { get; set; } = "Картой онлайн";
}

public class ChangeOrderStatusRequest
{
    public string Status { get; set; }
}

public class OrderSummaryDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; }
    public DateTime OrderDate { get; set; }
    public string Status { get; set; }
    public decimal Total { get; set; }
    public int ItemsCount { get; set; }
    public List<OrderItemDto> Items { get; set; }
}

public class OrderItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public string ProductName { get; set; }
    public string ProductImage { get; set; }
}