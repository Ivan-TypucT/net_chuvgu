using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using net_chuvgu.Backend.Contexts;
using net_chuvgu.Backend.Models;

namespace net_chuvgu.Backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly MarketplaceDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(MarketplaceDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users
            .Include(u => u.AuthorizationData)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        //if (user == null || !VerifyPassword(request.Password, user.AuthorizationData))
        //{
        //    return Unauthorized(new { success = false, message = "Неверный email или пароль" });
        //}

        if (user.AuthorizationData.IsBanned)
        {
            return Unauthorized(new { success = false, message = "Аккаунт заблокирован" });
        }

        var token = GenerateJwtToken(user);
        return Ok(new { success = true, token, user = MapUserToDto(user) });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            return BadRequest(new { success = false, message = "Пользователь с таким email уже существует" });
        }

        var salt = GenerateSalt();
        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Phone = request.Phone,
            CreatedAt = DateTime.UtcNow,
            AuthorizationData = new AuthorizationData
            {
                PasswordHash = HashPassword(request.Password, salt),
                Salt = salt,
                LastLogin = DateTime.UtcNow,
                IsBanned = false
            }
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user);
        return Ok(new { success = true, token, user = MapUserToDto(user) });
    }

    [HttpPost("refresh")]
    [Authorize]
    public async Task<IActionResult> Refresh()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdStr, out var userId))
            return Unauthorized(new { success = false });

        var user = await _context.Users.Include(u => u.AuthorizationData).FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null || user.AuthorizationData.IsBanned)
            return Unauthorized(new { success = false });

        var token = GenerateJwtToken(user);
        return Ok(new { success = true, token });
    }

    private string HashPassword(string password, string salt)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password + salt);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }

    private bool VerifyPassword(string password, AuthorizationData authData)
    {
        var hashedPassword = HashPassword(password, authData.Salt);
        return authData.PasswordHash == hashedPassword;
    }

    private string GenerateSalt()
    {
        var bytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes);
    }

    private string GenerateJwtToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Secret"]);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FirstName + " " + user.LastName),
                new Claim(ClaimTypes.Role, user.AuthorizationData.GetAccessLevel() > 0 ? "Admin" : "User")
            }),
            Expires = DateTime.UtcNow.AddMinutes(30),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private object MapUserToDto(User user)
    {
        return new
        {
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            user.Phone,
            user.Avatar,
            user.CreatedAt,
        };
    }
}

public class LoginRequest
{
    public string Email { get; set; }
    public string Password { get; set; }
}

public class RegisterRequest
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public string Password { get; set; }
}
