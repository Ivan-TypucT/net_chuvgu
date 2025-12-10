using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using net_chuvgu.Backend.Contexts;
using net_chuvgu.Backend.Models;

namespace net_chuvgu.Backend.Controllers;

public class CategoriesController : ApiControllerBase
{
    private readonly MarketplaceDbContext _context;

    public CategoriesController(MarketplaceDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.Categories
            .Where(c => c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync();

        return Success(categories);
    }

    // CRUD (только админ)
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return Success(category);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] Category update)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return NotFound();
        category.Name = update.Name;
        category.Icon = update.Icon;
        category.ProductCount = update.ProductCount;
        category.IsActive = update.IsActive;
        category.DisplayOrder = update.DisplayOrder;
        await _context.SaveChangesAsync();
        return Success(category);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return NotFound();
        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        return Success();
    }
}
