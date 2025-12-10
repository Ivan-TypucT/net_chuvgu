using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using net_chuvgu.Backend.Contexts;
using net_chuvgu.Backend.Models;

namespace net_chuvgu.Backend.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly MarketplaceDbContext _context;

    public AdminController(MarketplaceDbContext context)
    {
        _context = context;
    }

    // Пользователи (кроме админов)
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] string? search = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var users = await _context.Users
            .Include(u => u.AuthorizationData)
            .OrderBy(u => u.Id)
            .ToListAsync();

        IEnumerable<User> filtered = users.Where(u => u.AuthorizationData != null && u.AuthorizationData.GetAccessLevel() == 0);
        if (!string.IsNullOrWhiteSpace(search))
        {
            filtered = filtered.Where(u =>
                (u.Email != null && u.Email.Contains(search)) ||
                (u.FirstName != null && u.FirstName.Contains(search)) ||
                (u.LastName != null && u.LastName.Contains(search)) ||
                (u.Phone != null && u.Phone.Contains(search))
            );
        }

        var total = filtered.Count();
        var items = filtered.Skip((page - 1) * pageSize).Take(pageSize).Select(u => new
        {
            u.Id,
            u.FirstName,
            u.LastName,
            u.Email,
            u.Phone,
            IsBanned = u.AuthorizationData.IsBanned,
            u.CreatedAt
        });

        return Ok(new { success = true, data = new { items, total } });
    }

    [HttpPost("users/{id}/ban")]
    public async Task<IActionResult> BanUser(int id)
    {
        var user = await _context.Users.Include(u => u.AuthorizationData).FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return NotFound(new { success = false, message = "Пользователь не найден" });
        user.AuthorizationData.IsBanned = true;
        await _context.SaveChangesAsync();
        return Ok(new { success = true });
    }

    [HttpPost("users/{id}/unban")]
    public async Task<IActionResult> UnbanUser(int id)
    {
        var user = await _context.Users.Include(u => u.AuthorizationData).FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return NotFound(new { success = false, message = "Пользователь не найден" });
        user.AuthorizationData.IsBanned = false;
        await _context.SaveChangesAsync();
        return Ok(new { success = true });
    }

    public class ResetPasswordRequest { public string NewPassword { get; set; } }

    [HttpPost("users/{id}/reset-password")]
    public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordRequest body)
    {
        if (string.IsNullOrWhiteSpace(body.NewPassword))
            return BadRequest(new { success = false, message = "Пароль обязателен" });

        var user = await _context.Users.Include(u => u.AuthorizationData).FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return NotFound(new { success = false, message = "Пользователь не найден" });

        var salt = GenerateSalt();
        user.AuthorizationData.Salt = salt;
        user.AuthorizationData.PasswordHash = HashPassword(body.NewPassword, salt);
        await _context.SaveChangesAsync();
        return Ok(new { success = true });
    }

    [HttpGet("users/stats")]
    public async Task<IActionResult> GetUserStats()
    {
        var users = await _context.Users.Include(u => u.AuthorizationData).ToListAsync();
        var total = users.Count;
        var banned = users.Count(u => u.AuthorizationData.IsBanned);
        var active7d = users.Count(u => u.AuthorizationData.LastLogin >= DateTime.UtcNow.AddDays(-7));
        return Ok(new { success = true, data = new { total, banned, active7d } });
    }

    // Вспомогательные методы хеширования
    private static string HashPassword(string password, string salt)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password + salt);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }

    private static string GenerateSalt()
    {
        var bytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes);
    }
}
