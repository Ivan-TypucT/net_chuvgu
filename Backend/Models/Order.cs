using System.ComponentModel.DataAnnotations;

namespace net_chuvgu.Backend.Models;


public class Order
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string OrderNumber { get; set; }
    public DateTime OrderDate { get; set; }
        
    [StringLength(20)]
    public string Status { get; set; } 
        
    [Range(0, 100000)]
    public decimal Total { get; set; }
        
    public int ItemsCount { get; set; }
    public string ShippingAddress { get; set; }
    public string PaymentMethod { get; set; }
        
    public virtual User User { get; set; }
    public virtual ICollection<OrderItem> OrderItems { get; set; }
}

public enum OrderStatus
{
    Pending,
    Processing,
    Shipped,
    Delivered,
    Cancelled,
}

