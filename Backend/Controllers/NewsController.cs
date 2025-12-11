using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using net_chuvgu.Backend.Contexts;
using net_chuvgu.Backend.Models;

namespace net_chuvgu.Backend.Controllers;

public class NewsController : ApiControllerBase
{
    private readonly MarketplaceDbContext _context;

    public NewsController(MarketplaceDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetNews([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        
        var query = _context.News.Where(n => n.IsActive).OrderByDescending(n => n.PublishedAt);
        var totalCount = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return Success(new { items, totalCount });
    }
    
    [HttpGet("newsAll")]
    public async Task<IActionResult> GetNewsAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        
        var query = _context.News.OrderByDescending(n => n.PublishedAt);
        var totalCount = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return Success(new { items, totalCount });
    }
    
    [HttpGet("banner")]
    public async Task<IActionResult> GetBanner()
    {
        var banner = await _context.News
            .Where(n => n.Id == 1 && n.IsActive)
            .FirstOrDefaultAsync();
    
        if (banner == null)
        {
            // Возвращаем дефолтный баннер если нет в базе
            return Success(new News 
            { 
                Id = 0,
                Title = "🚀 Скидки до 50% на всю бытовую химию! (TEST)",
                Content = "Только до конца месяца • Бесплатная доставка от 1500₽ (ТЕСТ)",
                Image = "",
                PublishedAt = DateTime.UtcNow,
                IsActive = true,
                Author = "Система"
            });
        }
    
        return Success(banner);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetNewsItem(int id)
    {
        var item = await _context.News.FindAsync(id);
        if (item == null || !item.IsActive)
            return NotFound();
        return Success(item);
    }

    // CRUD (админ)
    [HttpPost("create")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] News news)
    {
        _context.News.Add(news);
        await _context.SaveChangesAsync();
        return Success(news);
    }

    [HttpPut("update/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] News update)
    {
        var news = await _context.News.FindAsync(id);
        if (news == null) return NotFound();

        news.Title = update.Title;
        news.Content = update.Content;
        news.Image = update.Image;
        news.PublishedAt = update.PublishedAt;
        news.IsActive = update.IsActive;
        news.Author = update.Author;

        await _context.SaveChangesAsync();
        return Success(news);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var news = await _context.News.FindAsync(id);
        if (news == null) return NotFound();
        _context.News.Remove(news);
        await _context.SaveChangesAsync();
        return Success();
    }
}
