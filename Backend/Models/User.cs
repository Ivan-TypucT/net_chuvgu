using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Drawing;

namespace net_chuvgu.Backend.Models;

public class User
{
    public int Id { get; set; }
        
    [Required]
    [StringLength(50)]
    public string FirstName { get; set; }
        
    [Required]
    [StringLength(50)]
    public string LastName { get; set; }
        
    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]    
    public string Phone { get; set; }
    
    public string Avatar { get; set; }
    public DateTime CreatedAt { get; set; }

    // Навигационные свойства
    public virtual AuthorizationData AuthorizationData { get; set; }
    public virtual ICollection<Order> Orders { get; set; }
    public virtual ICollection<UserFavorite> FavoriteProducts { get; set; }
    public virtual ICollection<CartItem> CartItems { get; set; }
}
