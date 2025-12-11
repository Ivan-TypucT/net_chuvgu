using System.ComponentModel.DataAnnotations;

namespace net_chuvgu.Backend.Models;

public class Product
{
    public int Id { get; set; }
        
    [Required]
    [StringLength(100)]
    public string Name { get; set; }
        
    [Required]
    [StringLength(50)]
    public string Brand { get; set; }
        
    [Required]
    [StringLength(50)]
    public string Category { get; set; }
        
    [Range(0, 100000)]
    public decimal Price { get; set; }
        
    [Range(0, 100000)]
    public decimal? OldPrice { get; set; }
        
    public string Image { get; set; }
        
    [Range(0, 5)]
    public double Rating { get; set; }
        
    public int ReviewsCount { get; set; }
    public string Weight { get; set; }
    public string Description { get; set; }
    public bool InStock { get; set; }
    public int StockQuantity { get; set; }
    public DateTime CreatedAt { get; set; }
        
    // ИЗМЕНИ НА ЭТО:
    public virtual ICollection<UserFavorite> UserFavorites { get; set; } = new List<UserFavorite>();
    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
