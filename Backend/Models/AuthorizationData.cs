using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace net_chuvgu.Backend.Models;

public class AuthorizationData
{

    public AuthorizationData(int accessLevel)
    {
        AccessLevel = accessLevel;
    }
    
    public AuthorizationData()
    {
    }
    
    public int Id { get; set; }
    public int UserId { get; set; }
    
    [Required]
    public int AccessLevel { get; set; }

    public int GetAccessLevel()
    {
        //TODO
        return AccessLevel;
    }

    [Required]
    public string PasswordHash { get; set; }
        
    [Required]
    public string Salt { get; set; }
        
    public DateTime LastLogin { get; set; }
    public int FailedLoginAttempts { get; set; }
    public bool IsBanned { get; set; }
    public DateTime? BannedUntil { get; set; }
    public string? SessionToken { get; set; }
    public DateTime? TokenExpiry { get; set; }
        
    public virtual User User { get; set; }
}
